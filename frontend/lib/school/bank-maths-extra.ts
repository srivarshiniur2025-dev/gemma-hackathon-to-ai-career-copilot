import type { RawQuestion } from "./bank-types";

export const MATHS_QUESTIONS_EXTRA: Record<string, RawQuestion[]> = {
  "m9-coordinates": [
    ["easy", "The point (4, 0) lies:", "On the x-axis", ["On the y-axis", "In the first quadrant", "At the origin"], "Its y-coordinate is 0."],
    ["easy", "The x-coordinate of a point is also called its:", "Abscissa", ["Ordinate", "Origin", "Quadrant"], "The y-coordinate is the ordinate."],
    ["medium", "In which quadrant do both coordinates of a point have negative signs?", "Third quadrant", ["First quadrant", "Second quadrant", "Fourth quadrant"], "Quadrant III has signs (−, −)."],
    ["hard", "The points (1, 1), (2, 2) and (3, 3) all lie on the line:", "y = x", ["y = 2x", "x + y = 2", "y = 1"], "In each point, the y-coordinate equals the x-coordinate."],
  ],
  "m9-linear-poly": [
    ["easy", "Which of these is a linear polynomial?", "5x − 3", ["x² + 1", "x³", "7"], "Its highest power of x is 1."],
    ["medium", "A linear polynomial has how many zeros?", "Exactly one", ["None", "Two", "Infinitely many"], "ax + b = 0 has the single zero x = −b/a (a ≠ 0)."],
    ["medium", "The point (2, 5) lies on the line y = 2x + k. The value of k is:", "1", ["5", "−1", "3"], "5 = 2 × 2 + k gives k = 1."],
    ["hard", "A taxi charges ₹20 plus ₹10 per km. The fare y for x km is:", "y = 10x + 20", ["y = 20x + 10", "y = 30x", "y = 10x − 20"], "Fixed charge 20 plus 10 for each km."],
  ],
  "m9-numbers": [
    ["easy", "√5 × √5 equals:", "5", ["25", "√10", "10"], "√a × √a = a."],
    ["medium", "The simplified value of 2^3 × 2^4 is:", "2^7", ["2^12", "4^7", "2^1"], "aᵐ × aⁿ = aᵐ⁺ⁿ."],
    ["medium", "A rational number between 1/2 and 1 is:", "3/4", ["1/4", "5/4", "1/3"], "The average (1/2 + 1)/2 = 3/4 lies between them."],
    ["hard", "0.4777… (7 repeating) written as a fraction is:", "43/90", ["47/90", "4/9", "47/99"], "Let x = 0.4777…; 100x − 10x = 47.7… − 4.7… = 43, so x = 43/90."],
  ],
  "m9-identities": [
    ["easy", "(x + 3)(x + 2) equals:", "x² + 5x + 6", ["x² + 6x + 5", "x² + 6", "x² + 5x + 5"], "(x + a)(x + b) = x² + (a + b)x + ab."],
    ["medium", "Using an identity, 99² equals:", "9801", ["9810", "9999", "9601"], "(100 − 1)² = 10000 − 200 + 1 = 9801."],
    ["medium", "Factorise 4x² − 25:", "(2x + 5)(2x − 5)", ["(2x − 5)²", "(4x − 5)(x + 5)", "(2x + 5)²"], "Difference of squares with a = 2x, b = 5."],
    ["hard", "If x + 1/x = 3, then x² + 1/x² equals:", "7", ["9", "11", "6"], "(x + 1/x)² = x² + 2 + 1/x², so 9 − 2 = 7."],
  ],
  "m9-circles": [
    ["easy", "A line segment joining any two points on a circle is a:", "Chord", ["Radius", "Tangent", "Sector"], "A chord through the centre is a diameter."],
    ["medium", "The angle subtended by an arc at the centre is how many times the angle at any point on the remaining circle?", "Twice", ["Half", "Equal", "Three times"], "Angle at centre = 2 × angle at circumference."],
    ["medium", "The angle in a semicircle is:", "90°", ["180°", "60°", "45°"], "It is half of the 180° angle at the centre."],
    ["hard", "In a cyclic quadrilateral, one angle is 70°. The opposite angle is:", "110°", ["70°", "20°", "290°"], "Opposite angles of a cyclic quadrilateral add to 180°."],
  ],
  "m9-area": [
    ["easy", "The area of a circle of radius 7 cm (π = 22/7) is:", "154 cm²", ["44 cm²", "49 cm²", "308 cm²"], "πr² = (22/7) × 49 = 154 cm²."],
    ["medium", "The semi-perimeter of a triangle with sides 5, 12 and 13 cm is:", "15 cm", ["30 cm", "10 cm", "12.5 cm"], "s = (5 + 12 + 13)/2 = 15 cm."],
    ["medium", "The area of a rectangle 12 m by 5 m is:", "60 m²", ["34 m²", "17 m²", "120 m²"], "Area = length × breadth."],
    ["hard", "Using Heron's formula, the area of an equilateral triangle with side 6 cm is:", "9√3 cm²", ["18 cm²", "36√3 cm²", "6√3 cm²"], "s = 9; area = √(9 × 3 × 3 × 3) = 9√3 cm²."],
  ],
  "m9-probability": [
    ["easy", "An event that is sure to happen has probability:", "1", ["0", "0.5", "2"], "Certain events have probability 1."],
    ["medium", "A die is rolled 60 times and shows 6 twelve times. The experimental probability of a 6 is:", "0.2", ["0.12", "0.6", "1/6"], "12/60 = 0.2."],
    ["medium", "Out of 40 students surveyed, 10 like cricket. The probability a student chosen at random likes cricket is:", "1/4", ["1/10", "3/4", "10"], "10/40 = 1/4."],
    ["hard", "As the number of trials increases, the experimental probability of heads for a fair coin tends to get closer to:", "0.5", ["0", "1", "0.25"], "With many trials, results settle near the theoretical value."],
  ],
  "m9-sequences": [
    ["easy", "The next term of 1, 3, 9, 27, … is:", "81", ["54", "36", "30"], "Each term is multiplied by 3."],
    ["medium", "The sequence 10, 7, 4, 1, … has a common difference of:", "−3", ["3", "−7", "4"], "7 − 10 = −3."],
    ["medium", "The first three terms of the sequence with nth term 2n − 1 are:", "1, 3, 5", ["2, 4, 6", "1, 2, 3", "0, 1, 2"], "Put n = 1, 2, 3."],
    ["hard", "In the Fibonacci sequence 1, 1, 2, 3, 5, 8, …, the next term is:", "13", ["11", "16", "10"], "Each term is the sum of the previous two: 5 + 8 = 13."],
  ],

  "m10-real": [
    ["easy", "The prime factorisation of 60 is:", "2² × 3 × 5", ["2 × 3 × 10", "2² × 15", "2 × 3² × 5"], "60 = 4 × 15 = 2² × 3 × 5."],
    ["medium", "The HCF of two consecutive natural numbers is always:", "1", ["0", "2", "The smaller number"], "Consecutive numbers are co-prime."],
    ["medium", "The LCM of 8, 9 and 25 is:", "1800", ["200", "72", "225"], "They share no common factors, so LCM = 8 × 9 × 25 = 1800."],
    ["hard", "To prove √2 is irrational, we assume √2 = p/q in lowest terms and reach a contradiction because:", "Both p and q turn out to be even", ["q becomes zero", "p becomes negative", "p equals q"], "If p and q are both even, p/q was not in lowest terms."],
  ],
  "m10-poly": [
    ["easy", "The degree of a quadratic polynomial is:", "2", ["1", "3", "0"], "Quadratic means highest power 2."],
    ["medium", "For ax² + bx + c, the product of zeros is:", "c/a", ["−b/a", "b/a", "−c/a"], "αβ = c/a."],
    ["medium", "The zeros of x² − 16 are:", "4 and −4", ["16 and −16", "4 only", "8 and −8"], "x² − 16 = (x − 4)(x + 4)."],
    ["hard", "If the graph of y = p(x) cuts the x-axis at 3 points, p(x) has:", "3 zeros", ["2 zeros", "1 zero", "No zeros"], "Each crossing of the x-axis is a zero."],
  ],
  "m10-linear": [
    ["easy", "If x = 2 and y = 1, which equation is satisfied?", "x + y = 3", ["x − y = 3", "2x + y = 3", "x + 2y = 5"], "2 + 1 = 3."],
    ["medium", "Two parallel lines represent a pair of equations that is:", "Inconsistent (no solution)", ["Consistent with one solution", "Consistent with infinitely many solutions", "Dependent"], "Parallel lines never meet."],
    ["medium", "Solving y = 2x and x + y = 9 by substitution gives:", "x = 3, y = 6", ["x = 6, y = 3", "x = 2, y = 7", "x = 4, y = 5"], "x + 2x = 9, so x = 3 and y = 6."],
    ["hard", "The sum of two numbers is 20 and their difference is 4. The numbers are:", "12 and 8", ["10 and 10", "14 and 6", "16 and 4"], "x + y = 20 and x − y = 4 give x = 12, y = 8."],
  ],
  "m10-quadratic": [
    ["easy", "The roots of (x − 2)(x + 5) = 0 are:", "2 and −5", ["−2 and 5", "2 and 5", "−2 and −5"], "Set each factor to zero."],
    ["medium", "The quadratic formula gives x =", "[−b ± √(b² − 4ac)] / 2a", ["[b ± √(b² − 4ac)] / 2a", "[−b ± √(b² + 4ac)] / 2a", "−b / 2a only"], "It solves ax² + bx + c = 0."],
    ["medium", "The equation x² − 4x + 4 = 0 has:", "Two equal real roots", ["Two distinct real roots", "No real roots", "Three roots"], "D = 16 − 16 = 0."],
    ["hard", "The product of two consecutive positive integers is 30. The integers are:", "5 and 6", ["3 and 10", "4 and 5", "6 and 7"], "x(x + 1) = 30 gives x² + x − 30 = 0, so x = 5."],
  ],
  "m10-ap": [
    ["easy", "Which of these is an AP?", "3, 6, 9, 12, …", ["1, 2, 4, 8, …", "1, 4, 9, 16, …", "2, 3, 5, 7, …"], "It has a common difference of 3."],
    ["medium", "The nth term of an AP is given by:", "a + (n − 1)d", ["a + nd", "a × dⁿ", "n/2 (a + l)"], "aₙ = a + (n − 1)d."],
    ["medium", "Which term of the AP 3, 8, 13, … is 48?", "10th", ["9th", "11th", "8th"], "48 = 3 + (n − 1)5 gives n = 10."],
    ["hard", "The sum of the first 15 terms of the AP 2, 4, 6, … is:", "240", ["225", "250", "120"], "S = n(n + 1) for even numbers: 15 × 16 = 240."],
  ],
  "m10-coord": [
    ["easy", "The distance formula between (x₁, y₁) and (x₂, y₂) is:", "√[(x₂ − x₁)² + (y₂ − y₁)²]", ["(x₂ − x₁) + (y₂ − y₁)", "√[(x₂ + x₁)² + (y₂ + y₁)²]", "(x₂ − x₁)(y₂ − y₁)"], "It comes from the Pythagoras theorem."],
    ["medium", "If (3, k) is the midpoint of (1, 2) and (5, 8), then k is:", "5", ["3", "10", "6"], "k = (2 + 8)/2 = 5."],
    ["medium", "The point on the x-axis equidistant from (2, 0) and (6, 0) is:", "(4, 0)", ["(0, 4)", "(8, 0)", "(3, 0)"], "It is the midpoint of the two points."],
    ["hard", "The points (1, 1), (4, 4) and (7, 7) are:", "Collinear", ["Vertices of a right triangle", "Vertices of an equilateral triangle", "Concyclic only"], "All lie on y = x, and the middle point is the midpoint of the others."],
  ],
  "m10-triangles": [
    ["easy", "Two similar figures have the same:", "Shape", ["Size always", "Area always", "Perimeter always"], "Similar figures can differ in size."],
    ["medium", "Triangles with corresponding sides in the same ratio are similar by:", "SSS similarity", ["AA similarity", "ASA congruence", "RHS congruence"], "Proportional sides give similarity."],
    ["medium", "△ABC ~ △PQR with AB = 4, PQ = 8 and BC = 5. Then QR is:", "10", ["2.5", "9", "20"], "The ratio is 1 : 2, so QR = 2 × 5 = 10."],
    ["hard", "If DE ∥ BC in △ABC and AD/DB = 1/2, then DE/BC equals:", "1/3", ["1/2", "2/3", "2"], "AD/AB = 1/3, and △ADE ~ △ABC."],
  ],
  "m10-circles": [
    ["easy", "A line that cuts a circle at two distinct points is a:", "Secant", ["Tangent", "Radius", "Diameter only"], "A tangent touches at one point only."],
    ["medium", "The lengths of the two tangents drawn from an external point to a circle are:", "Equal", ["Unequal", "In the ratio 1 : 2", "Always equal to the radius"], "This is a standard theorem."],
    ["medium", "How many tangents can a circle have at one point on it?", "1", ["2", "0", "Infinitely many"], "Only one tangent at any point of a circle."],
    ["hard", "Two tangents from P touch a circle with centre O at A and B. If ∠APB = 80°, then ∠AOB is:", "100°", ["80°", "160°", "40°"], "In quadrilateral OAPB, two angles are 90°, so ∠AOB = 360 − 180 − 80 = 100°."],
  ],
  "m10-trig": [
    ["easy", "cos 0° equals:", "1", ["0", "1/2", "Not defined"], "Standard value."],
    ["medium", "tan 45° equals:", "1", ["0", "√3", "1/√3"], "Opposite and adjacent sides are equal at 45°."],
    ["medium", "1 + tan²θ equals:", "sec²θ", ["cosec²θ", "cos²θ", "1"], "Divide sin²θ + cos²θ = 1 by cos²θ."],
    ["hard", "The value of sin 60° × cos 30° + cos 60° × sin 30° is:", "1", ["0", "1/2", "√3/2"], "(√3/2)(√3/2) + (1/2)(1/2) = 3/4 + 1/4 = 1."],
  ],
  "m10-heights": [
    ["easy", "When an observer looks down at an object, the angle formed with the horizontal is the:", "Angle of depression", ["Angle of elevation", "Straight angle", "Complementary angle"], "Looking up gives the angle of elevation."],
    ["medium", "The angle of elevation of the top of a pole from a point is 30°, and the point is 10√3 m from the foot. The height of the pole is:", "10 m", ["10√3 m", "30 m", "5 m"], "h = 10√3 × tan 30° = 10√3 × (1/√3) = 10 m."],
    ["medium", "As you walk closer to a tower, the angle of elevation of its top:", "Increases", ["Decreases", "Stays the same", "Becomes zero"], "The same height over a shorter distance gives a bigger angle."],
    ["hard", "From a 20 m high building, a car is seen at an angle of depression of 45°. The car's distance from the building is:", "20 m", ["20√3 m", "10 m", "40 m"], "tan 45° = 20/d = 1, so d = 20 m."],
  ],
  "m10-areas": [
    ["easy", "The area of a semicircle of radius r is:", "½ πr²", ["πr²", "2πr", "πr"], "Half the area of the full circle."],
    ["medium", "The perimeter of a semicircular plate of radius 7 cm (π = 22/7) is:", "36 cm", ["22 cm", "44 cm", "29 cm"], "Arc + diameter = 22 + 14 = 36 cm."],
    ["medium", "The minute hand of a clock is 14 cm long. The area it sweeps in 15 minutes (π = 22/7) is:", "154 cm²", ["616 cm²", "77 cm²", "44 cm²"], "15 minutes is 90°, a quarter circle: ¼ × (22/7) × 196 = 154 cm²."],
    ["hard", "The area of a major sector equals:", "Area of the circle − area of the minor sector", ["Area of the minor sector + triangle", "Arc length × radius", "πr² + minor sector"], "Major and minor sectors together form the whole circle."],
  ],
  "m10-surface": [
    ["easy", "The volume of a cone is:", "⅓ πr²h", ["πr²h", "πrl", "2/3 πr³"], "One-third of a cylinder with the same base and height."],
    ["medium", "The curved surface area of a cylinder of radius 7 cm and height 10 cm (π = 22/7) is:", "440 cm²", ["220 cm²", "1540 cm²", "308 cm²"], "2πrh = 2 × (22/7) × 7 × 10 = 440 cm²."],
    ["medium", "The volume of a cube of side 5 cm is:", "125 cm³", ["25 cm³", "150 cm³", "60 cm³"], "a³ = 5³ = 125 cm³."],
    ["hard", "Two cubes of side 4 cm are joined end to end. The surface area of the cuboid formed is:", "160 cm²", ["192 cm²", "128 cm²", "96 cm²"], "The cuboid is 8 × 4 × 4: 2(32 + 16 + 32) = 160 cm²."],
  ],
  "m10-stats": [
    ["easy", "The mean of 2, 4, 6, 8 and 10 is:", "6", ["5", "30", "8"], "Sum 30 ÷ 5 = 6."],
    ["medium", "The class with the highest frequency in grouped data is the:", "Modal class", ["Median class", "Cumulative class", "Class mark"], "The mode is calculated within the modal class."],
    ["medium", "The median of 3, 7, 9, 12 and 15 is:", "9", ["7", "12", "9.2"], "The middle value of the ordered data is 9."],
    ["hard", "If the mean is 20 and the median is 22, the mode (by the empirical formula) is:", "26", ["24", "18", "21"], "Mode = 3 Median − 2 Mean = 66 − 40 = 26."],
  ],
  "m10-prob": [
    ["easy", "A sure event has probability:", "1", ["0", "1/2", "Infinity"], "It will certainly happen."],
    ["medium", "Two coins are tossed together. The probability of getting two heads is:", "1/4", ["1/2", "3/4", "1/3"], "Outcomes HH, HT, TH, TT: 1 favourable out of 4."],
    ["medium", "A bag has 3 red and 5 blue balls. The probability of drawing a red ball is:", "3/8", ["5/8", "3/5", "1/3"], "3 red out of 8 balls."],
    ["hard", "Two dice are thrown. The probability that the sum is 7 is:", "1/6", ["1/12", "7/36", "1/36"], "6 favourable pairs out of 36."],
  ],
};

export const MATHS_CARDS_EXTRA: Record<string, [string, string][]> = {
  "m9-circles": [["Angle in a semicircle", "90°"], ["Cyclic quadrilateral", "Opposite angles add to 180°"]],
  "m10-quadratic": [["Quadratic formula", "x = [−b ± √(b² − 4ac)] / 2a"], ["D = 0", "Two equal real roots"]],
  "m10-ap": [["nth term of an AP", "aₙ = a + (n − 1)d"], ["Sum of n terms", "Sₙ = n/2 [2a + (n − 1)d]"]],
  "m10-trig": [["1 + tan²θ", "sec²θ"], ["tan 45°", "1"]],
  "m10-surface": [["Volume of a cone", "⅓ πr²h"]],
};
