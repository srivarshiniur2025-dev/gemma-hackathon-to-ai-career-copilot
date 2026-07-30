"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InterviewSession, QuestionType, WsClientMessage, WsServerMessage } from "@/lib/interview-types";
import { api } from "@/lib/api";

function getWsBase(): string {
  if (typeof window === "undefined") return "ws://127.0.0.1:8000";
  return process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";
}

type ChatMessage = {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  stage?: string;
  question_type?: QuestionType;
  what_good_answer_includes?: string[];
};

export function useInterviewWebSocket(sessionId: string, token: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentStage, setCurrentStage] = useState<string>("fundamentals");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [answerHints, setAnswerHints] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleServerMessage = useCallback((data: WsServerMessage) => {
    switch (data.type) {
      case "stream_start":
        setCurrentQuestion("");
        setAnswerHints([]);
        break;
      case "stream_chunk":
        setCurrentQuestion((prev) => prev + data.content);
        break;
      case "question":
        setCurrentQuestion(data.content);
        setCurrentStage(data.stage);
        setQuestionNumber(data.question_number);
        setQuestionType(data.question_type ?? null);
        setAnswerHints(data.what_good_answer_includes ?? []);
        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          stage: data.stage,
          question_type: data.question_type,
          what_good_answer_includes: data.what_good_answer_includes,
        });
        break;
      case "stage_change":
        appendMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: data.message,
        });
        setCurrentStage(data.to);
        break;
      case "complete":
        setCompleted(true);
        appendMessage({
          id: crypto.randomUUID(),
          role: "system",
          content: data.message,
        });
        break;
      case "error":
        setError(data.content);
        break;
      case "pong":
        break;
    }
  }, [appendMessage]);

  const connect = useCallback(() => {
    if (!token || !sessionId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnecting(true);
    setError(null);

    const url = `${getWsBase()}/ws/interview/${sessionId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setConnecting(false);
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" } satisfies WsClientMessage));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsServerMessage;
        handleServerMessage(data);
      } catch {
        setError("Failed to parse server message");
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection error");
      setConnecting(false);
    };

    ws.onclose = () => {
      setConnected(false);
      setConnecting(false);
      if (pingTimer.current) clearInterval(pingTimer.current);

      if (!completed) {
        reconnectTimer.current = setTimeout(() => connect(), 3000);
      }
    };
  }, [token, sessionId, completed, handleServerMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (pingTimer.current) clearInterval(pingTimer.current);
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  const sendAnswer = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to interview server");
      return;
    }
    appendMessage({ id: crypto.randomUUID(), role: "user", content });
    wsRef.current.send(JSON.stringify({ type: "answer", content } satisfies WsClientMessage));
  }, [appendMessage]);

  useEffect(() => {
    if (!sessionId || !token) return;
    api.getInterviewSession(sessionId).then((session: InterviewSession) => {
      if (session.total_questions) setTotalQuestions(session.total_questions);
      if (session.status === "completed") setCompleted(true);

      const transcript = session.transcript ?? [];
      if (transcript.length > 0) {
        setMessages(
          transcript.map((m) => ({
            id: crypto.randomUUID(),
            role: m.role,
            content: m.content,
            stage: m.stage,
            question_type: m.question_type,
            what_good_answer_includes: m.what_good_answer_includes,
          }))
        );
        const lastAssistant = [...transcript].reverse().find((m) => m.role === "assistant");
        if (lastAssistant) {
          setCurrentQuestion(lastAssistant.content);
          setQuestionType(lastAssistant.question_type ?? null);
          setAnswerHints(lastAssistant.what_good_answer_includes ?? []);
        }
        if (session.question_count) setQuestionNumber(session.question_count);
        if (session.current_stage) setCurrentStage(session.current_stage);
      }
    }).catch(() => undefined);
  }, [sessionId, token]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connected,
    connecting,
    messages,
    currentQuestion,
    currentStage,
    questionNumber,
    totalQuestions,
    setTotalQuestions,
    questionType,
    answerHints,
    completed,
    error,
    sendAnswer,
    disconnect,
    reconnect: connect,
  };
}
