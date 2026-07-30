export type InterviewFocus = "fundamentals" | "system_design" | "behavioral" | "full_pipeline";

export type InterviewStage = "fundamentals" | "system_design" | "behavioral";

export type QuestionType = "behavioral" | "technical" | "project-based" | "introductory";

export type InterviewSession = {
  session_id: string;
  uid: string;
  target_role: string;
  focus: InterviewFocus;
  company_context?: string;
  resume_summary?: string;
  target_skills?: string[];
  total_questions?: number;
  status: "active" | "completed" | "evaluated";
  current_stage: InterviewStage;
  question_count: number;
  transcript: InterviewMessage[];
  evaluation: InterviewEvaluation | null;
  created_at: string;
  updated_at: string;
};

export type InterviewMessage = {
  role: "assistant" | "user";
  content: string;
  stage: InterviewStage;
  question_type?: QuestionType;
  what_good_answer_includes?: string[];
};

export type InterviewEvaluation = {
  technical_accuracy: number;
  communication: number;
  confidence: number;
  overall_score: number;
  stage_scores: {
    fundamentals: number | null;
    system_design: number | null;
    behavioral: number | null;
  };
  strengths: string[];
  areas_to_improve: string[];
  star_method_feedback: {
    situation: string;
    task: string;
    action: string;
    result: string;
    overall: string;
  };
  missed_topics: string[];
  got_right: string[];
  summary: string;
};

export type WsServerMessage =
  | {
      type: "question";
      content: string;
      stage: InterviewStage;
      question_number: number;
      question_type?: QuestionType;
      what_good_answer_includes?: string[];
    }
  | { type: "stream_start"; question_number: number }
  | { type: "stream_chunk"; content: string }
  | { type: "stage_change"; from: string; to: string; message: string }
  | { type: "complete"; message: string; content?: string }
  | { type: "error"; content: string }
  | { type: "pong" };

export type WsClientMessage =
  | { type: "answer"; content: string }
  | { type: "ping" };
