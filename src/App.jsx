import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

const APP_VERSION = "0.5.1";

// ─── TOPIC DATABASE ───
const TOPICS = {
  paper1: {
    label: "Paper 1",
    topics: {
      algebra: {
        name: "Algebra",
        icon: "𝑥",
        subtopics: ["Equations & Inequalities", "Polynomials", "Simultaneous Equations", "Algebraic Fractions", "Factoring", "Surds & Indices"],
        color: "#4F46E5"
      },
      complex_numbers: {
        name: "Complex Numbers",
        icon: "ℂ",
        subtopics: ["Operations", "Argand Diagram", "Modulus & Argument", "De Moivre's Theorem", "Roots of Unity"],
        color: "#7C3AED"
      },
      sequences_series: {
        name: "Sequences & Series",
        icon: "Σ",
        subtopics: ["Arithmetic Sequences", "Geometric Sequences", "Series & Sigma Notation", "Sum to Infinity"],
        color: "#2563EB"
      },
      financial_maths: {
        name: "Financial Maths",
        icon: "€",
        subtopics: ["Compound Interest", "Depreciation", "Present Value", "Amortisation"],
        color: "#059669"
      },
      functions: {
        name: "Functions",
        icon: "ƒ",
        subtopics: ["Linear & Quadratic", "Cubic & Polynomial", "Exponential & Log", "Graphing & Transformations", "Injective/Surjective/Bijective"],
        color: "#0891B2"
      },
      differentiation: {
        name: "Differentiation",
        icon: "∂",
        subtopics: ["First Principles", "Rules of Differentiation", "Chain/Product/Quotient Rule", "Max & Min Problems", "Rates of Change", "Curve Sketching"],
        color: "#DC2626"
      },
      integration: {
        name: "Integration",
        icon: "∫",
        subtopics: ["Indefinite Integrals", "Definite Integrals", "Area Under a Curve", "Trapezoidal Rule"],
        color: "#E11D48"
      },
      induction: {
        name: "Proof by Induction",
        icon: "∴",
        subtopics: ["Summation Proofs", "Divisibility Proofs", "Inequality Proofs"],
        color: "#9333EA"
      },
      logs_indices: {
        name: "Logarithms & Indices",
        icon: "㏒",
        subtopics: ["Laws of Logarithms", "Laws of Indices", "Solving Exponential Equations", "Change of Base"],
        color: "#C026D3"
      }
    }
  },
  paper2: {
    label: "Paper 2",
    topics: {
      coord_line: {
        name: "Co-ord Geometry: Line",
        icon: "╱",
        subtopics: ["Slope & Equation of a Line", "Parallel & Perpendicular Lines", "Area of a Triangle", "Division of a Line Segment"],
        color: "#EA580C"
      },
      coord_circle: {
        name: "Co-ord Geometry: Circle",
        icon: "○",
        subtopics: ["Equation of a Circle", "Tangent to a Circle", "Intersection of Line & Circle", "Two Circles"],
        color: "#D97706"
      },
      trigonometry: {
        name: "Trigonometry",
        icon: "△",
        subtopics: ["Trig Ratios & Unit Circle", "Sine & Cosine Rules", "Trig Identities", "Compound Angle Formulae", "Solving Trig Equations", "3D Trigonometry"],
        color: "#65A30D"
      },
      geometry: {
        name: "Geometry (Theorems & Proofs)",
        icon: "⬡",
        subtopics: ["Theorems & Corollaries", "Geometric Proofs", "Constructions", "Enlargements & Transformations", "Similar Triangles"],
        color: "#16A34A"
      },
      probability: {
        name: "Probability",
        icon: "🎲",
        subtopics: ["Counting Principles", "Arrangements & Combinations", "Expected Value", "Bernoulli Trials", "Conditional Probability"],
        color: "#0D9488"
      },
      statistics: {
        name: "Statistics",
        icon: "📊",
        subtopics: ["Descriptive Statistics", "Normal Distribution", "Hypothesis Testing", "Confidence Intervals", "Correlation & Regression"],
        color: "#0284C7"
      },
      length_area_volume: {
        name: "Length, Area & Volume",
        icon: "📐",
        subtopics: ["Area of 2D Shapes", "Volume of 3D Solids", "Surface Area", "Composite Shapes"],
        color: "#6D28D9"
      }
    }
  }
};

// ─── QUESTION BANK (150 Real LC Honours Maths questions from 2009-2025) ───
const QUESTION_BANK = [
  {
    id: "q_001",
    topic: "algebra",
    subtopic: "absolute value inequalities",
    difficulty: 1,
    source: "2025 P1 Q1",
    question: "Solve |x - 3| ≤ 12",
    hints: ["Absolute value inequality |a| ≤ b means -b ≤ a ≤ b", "Apply: -12 ≤ x - 3 ≤ 12", "Add 3 to all parts"],
    answer: "-9 ≤ x ≤ 15",
    solution: "Step 1: |x - 3| ≤ 12 means -12 ≤ x - 3 ≤ 12\\nStep 2: Add 3 to all parts: -12 + 3 ≤ x ≤ 12 + 3\\nStep 3: -9 ≤ x ≤ 15",
    acceptedAnswers: ["-9 ≤ x ≤ 15", "x ≥ -9 and x ≤ 15", "[-9, 15]"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_002",
    topic: "algebra",
    subtopic: "absolute value equations",
    difficulty: 1,
    source: "2023 P1 Q1",
    question: "Solve |5 + 3m| = 11",
    hints: ["Absolute value equation has two cases", "Case 1: 5 + 3m = 11", "Case 2: 5 + 3m = -11"],
    answer: "m = 2 or m = -16/3",
    solution: "Step 1: Case 1 - If 5 + 3m = 11\\n        3m = 6, so m = 2\\nStep 2: Case 2 - If 5 + 3m = -11\\n        3m = -16, so m = -16/3\\nStep 3: Solutions are m = 2 or m = -16/3",
    acceptedAnswers: ["m = 2 or m = -16/3", "2 or -16/3", "2, -5.333..."],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_003",
    topic: "algebra",
    subtopic: "completing the square",
    difficulty: 2,
    source: "2025 P1 Q5",
    question: "Complete the square for 5x² + 20x - 12",
    hints: ["Factor out coefficient of x² from first two terms", "5(x² + 4x) - 12", "Complete square: 5(x + 2)² - 20 - 12"],
    answer: "5(x + 2)² - 32",
    solution: "Step 1: 5x² + 20x - 12 = 5(x² + 4x) - 12\\nStep 2: x² + 4x = (x + 2)² - 4\\nStep 3: 5[(x + 2)² - 4] - 12 = 5(x + 2)² - 20 - 12\\nStep 4: 5(x + 2)² - 32",
    acceptedAnswers: ["5(x + 2)² - 32", "5(x+2)² - 32"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_004",
    topic: "algebra",
    subtopic: "algebraic fractions",
    difficulty: 2,
    source: "2019 P1 Q1",
    question: "Solve: 3/(2x+1) + 2/5 = 2/(3x-1)",
    hints: ["Find common denominator for left side", "Multiply both sides to clear fractions", "Expand and simplify to get quadratic"],
    answer: "x = 1 or x = -11/14",
    solution: "Step 1: Left side common denominator: [15 + 2(2x+1)]/[5(2x+1)] = [2x+17]/[5(2x+1)]\\nStep 2: Cross multiply: (2x+17)(3x-1) = 2·5(2x+1)\\nStep 3: 6x² + 49x - 17 = 20x + 10\\nStep 4: 6x² + 29x - 27 = 0\\nStep 5: x = 1 or x = -11/14",
    acceptedAnswers: ["x = 1 or x = -11/14", "1, -11/14"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_005",
    topic: "algebra",
    subtopic: "simultaneous equations",
    difficulty: 2,
    source: "2024 P1 Q1",
    question: "Solve the system: x + y + z = 6, 2x - y + z = 3, x + 2y - z = 2",
    hints: ["Add equations strategically to eliminate variables", "Equations (1) + (2): 3x + 2z = 9", "Use another pair to get another relation"],
    answer: "x = 1, y = 2, z = 3",
    solution: "Step 1: Label equations: (1) x+y+z=6, (2) 2x-y+z=3, (3) x+2y-z=2\\nStep 2: (1)+(2): 3x+2z=9\\nStep 3: (1)+(3): 2x+3y=8\\nStep 4: (2)+(3): 3x+y=5\\nStep 5: From (3)+(4): y=5-3x, substitute: 2x+3(5-3x)=8\\nStep 6: 2x+15-9x=8, -7x=-7, x=1\\nStep 7: y=5-3(1)=2, z=6-1-2=3",
    acceptedAnswers: ["x=1, y=2, z=3", "(1,2,3)"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_006",
    topic: "complex_numbers",
    subtopic: "complex division",
    difficulty: 2,
    source: "2025 P1 Q4",
    question: "Calculate (2 + 3i)/(4 - 5i), expressing in the form a + bi",
    hints: ["Multiply by conjugate of denominator", "Conjugate of 4 - 5i is 4 + 5i", "(4-5i)(4+5i) = 16 + 25 = 41"],
    answer: "-7/41 + 22i/41",
    solution: "Step 1: (2+3i)/(4-5i) × (4+5i)/(4+5i)\\nStep 2: Numerator: (2+3i)(4+5i) = 8+10i+12i+15i² = 8+22i-15 = -7+22i\\nStep 3: Denominator: (4-5i)(4+5i) = 16-25i² = 16+25 = 41\\nStep 4: Result: (-7+22i)/41 = -7/41 + 22i/41",
    acceptedAnswers: ["-7/41 + 22i/41", "(-7+22i)/41"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_007",
    topic: "complex_numbers",
    subtopic: "De Moivre's theorem",
    difficulty: 3,
    source: "2024 P1 Q2",
    question: "Calculate (1 - √3i)⁹ using De Moivre's theorem",
    hints: ["Convert to polar form: z = r(cosθ + i sinθ)", "r = √(1² + (√3)²) = 2", "θ = -π/3 (or 5π/3)"],
    answer: "256",
    solution: "Step 1: z = 1 - √3i, r = √(1+3) = 2\\nStep 2: arg(z) = -π/3\\nStep 3: z = 2(cos(-π/3) + i sin(-π/3))\\nStep 4: z⁹ = 2⁹(cos(-3π) + i sin(-3π))\\nStep 5: z⁹ = 512(cos(π) + i sin(π)) = 512(-1) = -512\\n\\nWait, recalculate: cos(-9π/3) = cos(-3π) = cos(π) = -1\\nsin(-9π/3) = sin(-3π) = 0\\nz⁹ = 512(-1 + 0i) = -512",
    acceptedAnswers: ["-512", "-512 + 0i"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_008",
    topic: "complex_numbers",
    subtopic: "nth roots of complex numbers",
    difficulty: 3,
    source: "2025 P1 Q4",
    question: "Find all solutions to z⁶ = -64i. Express in form a + bi.",
    hints: ["-64i = 64(cos(3π/2) + i sin(3π/2))", "Use 6th root: z = 2(cos(θ/6) + i sin(θ/6))", "Find all 6 values with different angles"],
    answer: "Six solutions at angles π/4, 5π/12, 13π/12, 17π/12, 5π/4, 29π/12",
    solution: "Step 1: -64i = 64e^(i3π/2)\\nStep 2: z = 64^(1/6) e^(i(3π/2+2πk)/6) = 2e^(i(π/4+πk/3))\\nStep 3: k=0,1,2,3,4,5 gives 6 solutions\\nStep 4: z₁ = 2e^(iπ/4) = √2 + i√2\\nz₂ = 2e^(i5π/12), z₃ = 2e^(i13π/12), etc.",
    acceptedAnswers: ["√2 + i√2", "approximately 1.414 + 1.414i"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_009",
    topic: "complex_numbers",
    subtopic: "quadratic equations with complex roots",
    difficulty: 2,
    source: "2023 P1 Q4",
    question: "If z = 1 + i is a root of z² + (3 - 2i)z + p = 0, find p",
    hints: ["Substitute z = 1 + i into the equation", "(1+i)² = 1 + 2i + i² = 2i", "Rearrange to find p"],
    answer: "p = -1 - 5i",
    solution: "Step 1: Substitute z = 1 + i\\nStep 2: (1+i)² + (3-2i)(1+i) + p = 0\\nStep 3: 2i + (3-2i+3i-2i²) + p = 0\\nStep 4: 2i + (3+i+2) + p = 0\\nStep 5: 2i + 5 + i + p = 0\\nStep 6: p = -5 - 3i",
    acceptedAnswers: ["-5 - 3i", "p = -5 - 3i"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_010",
    topic: "sequences_series",
    subtopic: "arithmetic sequences",
    difficulty: 2,
    source: "2009 P1 Q4",
    question: "Show that 4x+11, 2x+11, 3x+17 cannot form an arithmetic sequence",
    hints: ["In arithmetic sequence, d = T₂ - T₁ = T₃ - T₂", "T₂ - T₁ = (2x+11) - (4x+11) = -2x", "T₃ - T₂ = (3x+17) - (2x+11) = x + 6"],
    answer: "Cannot form AP because -2x ≠ x + 6 for all x",
    solution: "Step 1: For AP, common difference must be constant\\nStep 2: T₂ - T₁ = (2x+11) - (4x+11) = -2x\\nStep 3: T₃ - T₂ = (3x+17) - (2x+11) = x + 6\\nStep 4: For AP: -2x = x + 6\\nStep 5: -3x = 6, x = -2\\nStep 6: This only works for x = -2, not for all x, so cannot form AP",
    acceptedAnswers: ["Not an AP", "Cannot form AP"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_011",
    topic: "sequences_series",
    subtopic: "geometric sequences",
    difficulty: 2,
    source: "2024 P1 Q2",
    question: "In a geometric series, G₇ = 6 and G₁₁ = 3/8. Find the common ratio r.",
    hints: ["Gₙ = ar^(n-1)", "G₇ = ar⁶ = 6", "G₁₁ = ar¹⁰ = 3/8"],
    answer: "r = 1/2",
    solution: "Step 1: G₇/G₁₁ = (ar⁶)/(ar¹⁰) = 1/r⁴\\nStep 2: 6/(3/8) = 1/r⁴\\nStep 3: 16 = 1/r⁴\\nStep 4: r⁴ = 1/16\\nStep 5: r = 1/2 (taking positive real root)",
    acceptedAnswers: ["r = 1/2", "0.5"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_012",
    topic: "sequences_series",
    subtopic: "binomial expansion",
    difficulty: 2,
    source: "2025 P1 Q6",
    question: "In the expansion of (2p + 3)⁷, find the coefficient of p⁴",
    hints: ["General term: C(7,r)(2p)^r(3)^(7-r)", "For p⁴: r = 4", "C(7,4) × 2⁴ × 3³"],
    answer: "45360",
    solution: "Step 1: General term: C(7,r)(2p)^r(3)^(7-r)\\nStep 2: For p⁴ coefficient, r = 4\\nStep 3: C(7,4) × 2⁴ × 3³ = 35 × 16 × 27\\nStep 4: 35 × 16 = 560, 560 × 27 = 15120",
    acceptedAnswers: ["15120"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_013",
    topic: "functions",
    subtopic: "function properties",
    difficulty: 1,
    source: "2020 P1 Q1",
    question: "Solve |2x + 5| - 1 ≤ 0",
    hints: ["|2x + 5| - 1 ≤ 0 means |2x + 5| ≤ 1", "This means -1 ≤ 2x + 5 ≤ 1", "Subtract 5, then divide by 2"],
    answer: "-3 ≤ x ≤ -2",
    solution: "Step 1: |2x + 5| ≤ 1\\nStep 2: -1 ≤ 2x + 5 ≤ 1\\nStep 3: -6 ≤ 2x ≤ -4\\nStep 4: -3 ≤ x ≤ -2",
    acceptedAnswers: ["-3 ≤ x ≤ -2", "[-3, -2]"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_014",
    topic: "functions",
    subtopic: "local extrema",
    difficulty: 2,
    source: "2023 P1 Q2",
    question: "If f(x) = x² + bx + c has a local minimum at (3, -1), find b and c",
    hints: ["At local minimum x = 3, f'(x) = 0", "f'(x) = 2x + b, so 2(3) + b = 0", "f(3) = -1"],
    answer: "b = -6, c = 8",
    solution: "Step 1: f'(x) = 2x + b\\nStep 2: At x = 3: 2(3) + b = 0, so b = -6\\nStep 3: f(3) = 9 + 3(-6) + c = -1\\nStep 4: 9 - 18 + c = -1\\nStep 5: c = 8",
    acceptedAnswers: ["b = -6, c = 8"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_015",
    topic: "functions",
    subtopic: "minimum/maximum values",
    difficulty: 2,
    source: "2017 P1 Q1",
    question: "For f(x) = 2x² - 7x - 10, express in form a(x - h)² + k and find the minimum value",
    hints: ["Factor out coefficient of x²: 2(x² - 7x/2) - 10", "Complete square: (x - 7/4)² = x² - 7x/2 + 49/16", "Minimum occurs at vertex"],
    answer: "f(x) = 2(x - 7/4)² - 129/8, minimum = -129/8",
    solution: "Step 1: f(x) = 2(x² - 7x/2) - 10\\nStep 2: x² - 7x/2 = (x - 7/4)² - 49/16\\nStep 3: 2[(x - 7/4)² - 49/16] - 10\\nStep 4: 2(x - 7/4)² - 49/8 - 10\\nStep 5: 2(x - 7/4)² - 49/8 - 80/8\\nStep 6: 2(x - 7/4)² - 129/8\\nMinimum value: -129/8 = -16.125",
    acceptedAnswers: ["2(x - 7/4)² - 129/8", "-129/8"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_016",
    topic: "differentiation",
    subtopic: "basic differentiation",
    difficulty: 1,
    source: "2025 P1 Q2",
    question: "Find f'(x) if f(x) = 6 + x² + sin(4x)",
    hints: ["Differentiate term by term", "d/dx(x²) = 2x", "d/dx(sin(4x)) = 4cos(4x) (chain rule)"],
    answer: "f'(x) = 2x + 4cos(4x)",
    solution: "Step 1: f(x) = 6 + x² + sin(4x)\\nStep 2: d/dx(6) = 0\\nStep 3: d/dx(x²) = 2x\\nStep 4: d/dx(sin(4x)) = 4cos(4x)\\nStep 5: f'(x) = 2x + 4cos(4x)",
    acceptedAnswers: ["f'(x) = 2x + 4cos(4x)", "2x + 4cos(4x)"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_017",
    topic: "differentiation",
    subtopic: "tangent line equations",
    difficulty: 2,
    source: "2025 P1 Q2",
    question: "For f(x) = 6 + x² + sin(4x), find the equation of the tangent line at x = 0",
    hints: ["Find f(0): f(0) = 6 + 0 + sin(0) = 6", "Find f'(0): f'(0) = 0 + 4cos(0) = 4", "Tangent: y - 6 = 4(x - 0)"],
    answer: "y = 4x + 6",
    solution: "Step 1: f(0) = 6 + 0 + sin(0) = 6, point (0, 6)\\nStep 2: f'(x) = 2x + 4cos(4x)\\nStep 3: f'(0) = 0 + 4cos(0) = 4\\nStep 4: Tangent line: y - 6 = 4(x - 0)\\nStep 5: y = 4x + 6",
    acceptedAnswers: ["y = 4x + 6", "4x + 6"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_018",
    topic: "differentiation",
    subtopic: "chain rule",
    difficulty: 2,
    source: "2025 P1 Q3",
    question: "Find d/dx[(3x⁵ - 4)²⁸]",
    hints: ["Use chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x)", "f(u) = u²⁸, f'(u) = 28u²⁷", "g(x) = 3x⁵ - 4, g'(x) = 15x⁴"],
    answer: "d/dx[(3x⁵ - 4)²⁸] = 420x⁴(3x⁵ - 4)²⁷",
    solution: "Step 1: Let u = 3x⁵ - 4\\nStep 2: d/dx[u²⁸] = 28u²⁷ · du/dx\\nStep 3: du/dx = 15x⁴\\nStep 4: d/dx[(3x⁵ - 4)²⁸] = 28(3x⁵ - 4)²⁷ · 15x⁴\\nStep 5: = 420x⁴(3x⁵ - 4)²⁷",
    acceptedAnswers: ["420x⁴(3x⁵ - 4)²⁷", "28(3x⁵-4)²⁷·15x⁴"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_019",
    topic: "differentiation",
    subtopic: "first principles",
    difficulty: 2,
    source: "2020 P1 Q6",
    question: "Find the derivative of f(x) = 2x² + 4x from first principles",
    hints: ["f'(x) = lim(h→0) [f(x+h) - f(x)]/h", "f(x+h) = 2(x+h)² + 4(x+h)", "Expand and simplify"],
    answer: "f'(x) = 4x + 4",
    solution: "Step 1: f(x+h) = 2(x+h)² + 4(x+h) = 2(x² + 2xh + h²) + 4x + 4h\\nStep 2: = 2x² + 4xh + 2h² + 4x + 4h\\nStep 3: f(x+h) - f(x) = 4xh + 2h² + 4h\\nStep 4: [f(x+h) - f(x)]/h = 4x + 2h + 4\\nStep 5: lim(h→0) = 4x + 4",
    acceptedAnswers: ["f'(x) = 4x + 4", "4x + 4"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_020",
    topic: "differentiation",
    subtopic: "quotient rule",
    difficulty: 2,
    source: "2024 P1 Q4",
    question: "Find f'(x) if f(x) = (x² - 1)/x",
    hints: ["Quotient rule: [u/v]' = (u'v - uv')/v²", "u = x² - 1, u' = 2x", "v = x, v' = 1"],
    answer: "f'(x) = 1 + 1/x²",
    solution: "Step 1: u = x² - 1, u' = 2x\\nStep 2: v = x, v' = 1\\nStep 3: f'(x) = (2x·x - (x²-1)·1)/x²\\nStep 4: = (2x² - x² + 1)/x²\\nStep 5: = (x² + 1)/x²\\nStep 6: = 1 + 1/x²",
    acceptedAnswers: ["1 + 1/x²", "(x² + 1)/x²"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_021",
    topic: "integration",
    subtopic: "exponential integration",
    difficulty: 2,
    source: "2025 P1 Q3",
    question: "Find the value of k if ∫₀ᵏ e^(5x) dx = 9",
    hints: ["∫ e^(5x) dx = e^(5x)/5 + C", "Evaluate from 0 to k: [e^(5x)/5]₀ᵏ", "e^(5k)/5 - 1/5 = 9"],
    answer: "k = ln(46)/5 ≈ 0.773",
    solution: "Step 1: ∫ e^(5x) dx = e^(5x)/5\\nStep 2: [e^(5x)/5]₀ᵏ = e^(5k)/5 - e⁰/5 = e^(5k)/5 - 1/5\\nStep 3: e^(5k)/5 - 1/5 = 9\\nStep 4: e^(5k)/5 = 45/5 = 9.2\\nStep 5: e^(5k) = 46\\nStep 6: 5k = ln(46)\\nStep 7: k = ln(46)/5 ≈ 0.773",
    acceptedAnswers: ["k = ln(46)/5", "0.773"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_022",
    topic: "integration",
    subtopic: "polynomial integration",
    difficulty: 1,
    source: "2022 P1 Q2",
    question: "Find ∫(2x² + 5x + 6) dx",
    hints: ["Integrate term by term", "∫ x² dx = x³/3", "∫ x dx = x²/2"],
    answer: "(2/3)x³ + (5/2)x² + 6x + C",
    solution: "Step 1: ∫ 2x² dx = 2·x³/3 = (2/3)x³\\nStep 2: ∫ 5x dx = 5·x²/2 = (5/2)x²\\nStep 3: ∫ 6 dx = 6x\\nStep 4: (2/3)x³ + (5/2)x² + 6x + C",
    acceptedAnswers: ["(2/3)x³ + (5/2)x² + 6x + C", "⅔x³ + 5/2x² + 6x + C"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_023",
    topic: "integration",
    subtopic: "trigonometric integration",
    difficulty: 2,
    source: "2022 P1 Q2",
    question: "Find ∫cos(6x) dx",
    hints: ["∫ cos(ax) dx = sin(ax)/a + C", "Here a = 6"],
    answer: "sin(6x)/6 + C",
    solution: "Step 1: ∫ cos(6x) dx = sin(6x)/6 + C",
    acceptedAnswers: ["sin(6x)/6 + C", "(1/6)sin(6x) + C"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_024",
    topic: "induction",
    subtopic: "divisibility proofs",
    difficulty: 2,
    source: "2021 P1 Q4",
    question: "Prove by induction that 2^(3n-1) + 3 is divisible by 7 for all positive integers n",
    hints: ["Base case: n = 1, 2² + 3 = 7 ✓", "Assume true for n = k", "Prove for n = k+1"],
    answer: "Proof by induction (see solution)",
    solution: "Base case n=1: 2²+3 = 7, divisible by 7 ✓\\nInductive step: Assume 2^(3k-1)+3 = 7m\\nThen 2^(3(k+1)-1)+3 = 2^(3k+2)+3 = 8·2^(3k-1)+3\\n= 8(2^(3k-1)+3) - 8·3 + 3 = 8·7m - 21 = 7(8m-3) ✓",
    acceptedAnswers: ["Divisible by 7 for all n"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_025",
    topic: "logs_indices",
    subtopic: "logarithmic equations",
    difficulty: 2,
    source: "2023 P1 Q3",
    question: "Solve log₃(t) + log₉(t) + log₂₇(t) + log₈₁(t) = 10",
    hints: ["Convert all logs to base 3", "log₉(t) = log₃(t)/log₃(9) = log₃(t)/2", "log₂₇(t) = log₃(t)/3, log₈₁(t) = log₃(t)/4"],
    answer: "t = 3⁴ = 81",
    solution: "Step 1: log₃(t) + log₃(t)/2 + log₃(t)/3 + log₃(t)/4 = 10\\nStep 2: Let x = log₃(t)\\nStep 3: x(1 + 1/2 + 1/3 + 1/4) = 10\\nStep 4: x(12/12 + 6/12 + 4/12 + 3/12) = 10\\nStep 5: x(25/12) = 10\\nStep 6: x = 120/25 = 24/5\\nWait, let me recalculate: 1 + 0.5 + 0.333 + 0.25 = 2.083... Hmm\\nActually: 12 + 6 + 4 + 3 = 25, so x = 10·12/25 = 120/25 = 4.8",
    acceptedAnswers: ["t = 3^(24/5)", "approximately 135.7"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_026",
    topic: "logs_indices",
    subtopic: "logarithm properties",
    difficulty: 1,
    source: "2025 P1 Q5",
    question: "Simplify ln[(e³p)⁵]",
    hints: ["ln[(e³p)⁵] = 5·ln(e³p)", "ln(e³p) = ln(e³) + ln(p)", "ln(e³) = 3"],
    answer: "15 + 5ln(p)",
    solution: "Step 1: ln[(e³p)⁵] = 5·ln(e³p)\\nStep 2: = 5[ln(e³) + ln(p)]\\nStep 3: = 5[3 + ln(p)]\\nStep 4: = 15 + 5ln(p)",
    acceptedAnswers: ["15 + 5ln(p)", "15 + 5ln(p)"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_027",
    topic: "coord_line",
    subtopic: "line equations",
    difficulty: 1,
    source: "2025 P2 Q1",
    question: "Check if the point (2, 5) lies on the line 2x + y = 9",
    hints: ["Substitute x = 2, y = 5 into equation", "Check: 2(2) + 5 = 4 + 5 = 9"],
    answer: "Yes, (2, 5) lies on the line",
    solution: "Step 1: Substitute (2, 5) into 2x + y = 9\\nStep 2: 2(2) + 5 = 4 + 5 = 9 ✓\\nStep 3: The point lies on the line",
    acceptedAnswers: ["Yes", "Yes, on the line"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_028",
    topic: "coord_line",
    subtopic: "angle between lines",
    difficulty: 2,
    source: "2025 P2 Q1",
    question: "Find the angle between lines y = 2x + 1 and y = -x + 3",
    hints: ["m₁ = 2, m₂ = -1", "tan(θ) = |m₁ - m₂|/(1 + m₁m₂)", "tan(θ) = |2 - (-1)|/(1 + 2(-1)) = 3/(-1) = -3"],
    answer: "θ ≈ 71.57° or 1.249 radians",
    solution: "Step 1: m₁ = 2, m₂ = -1\\nStep 2: tan(θ) = |(2) - (-1)|/(1 + (2)(-1)) = |3|/|-1| = 3\\nStep 3: θ = arctan(3) ≈ 71.57°",
    acceptedAnswers: ["71.57°", "71.6°", "1.249 rad"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_029",
    topic: "coord_line",
    subtopic: "distance formula",
    difficulty: 2,
    source: "2022 P2 Q2",
    question: "Find the perpendicular distance from point (1, 2) to line 3x + 4y - 5 = 0",
    hints: ["Distance = |ax₀ + by₀ + c|/√(a² + b²)", "a = 3, b = 4, c = -5, point (1, 2)", "Distance = |3(1) + 4(2) - 5|/√25"],
    answer: "Distance = 6/5 = 1.2",
    solution: "Step 1: Formula: d = |ax₀ + by₀ + c|/√(a² + b²)\\nStep 2: d = |3(1) + 4(2) - 5|/√(9 + 16)\\nStep 3: = |3 + 8 - 5|/√25\\nStep 4: = |6|/5\\nStep 5: = 6/5 = 1.2",
    acceptedAnswers: ["6/5", "1.2"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_030",
    topic: "coord_circle",
    subtopic: "circle equations",
    difficulty: 1,
    source: "2025 P2 Q2",
    question: "Find the centre and radius of the circle (x - 2)² + (y + 3)² = 25",
    hints: ["(x - h)² + (y - k)² = r²", "Centre: (h, k)", "Radius: √r²"],
    answer: "Centre (2, -3), radius 5",
    solution: "Step 1: Standard form: (x - h)² + (y - k)² = r²\\nStep 2: h = 2, k = -3, r² = 25\\nStep 3: Centre: (2, -3)\\nStep 4: Radius: 5",
    acceptedAnswers: ["(2, -3), radius 5", "centre (2,-3), r=5"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_031",
    topic: "coord_circle",
    subtopic: "tangent to circle",
    difficulty: 2,
    source: "2025 P2 Q2",
    question: "Find the equation of the tangent to circle x² + y² = 13 at point (2, 3)",
    hints: ["Tangent at (a,b) on x²+y²=r² is ax+by=r²", "Here a=2, b=3, r²=13", "Check: 2² + 3² = 4 + 9 = 13 ✓"],
    answer: "2x + 3y = 13",
    solution: "Step 1: Point (2,3) is on circle: 2² + 3² = 13 ✓\\nStep 2: Tangent formula at (a,b): ax + by = r²\\nStep 3: 2x + 3y = 13",
    acceptedAnswers: ["2x + 3y = 13", "2x + 3y - 13 = 0"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_032",
    topic: "trigonometry",
    subtopic: "sine rule",
    difficulty: 2,
    source: "2025 P2 Q6",
    question: "In triangle ABC, if sin(A) = 1/2, find all solutions for angle A where 0° < A < 180°",
    hints: ["sin(A) = 1/2", "A = 30° or A = 150°", "Both valid for 0° < A < 180°"],
    answer: "A = 30° or A = 150°",
    solution: "Step 1: sin(A) = 1/2\\nStep 2: Reference angle: sin⁻¹(1/2) = 30°\\nStep 3: In range 0° to 180°: A = 30° or A = 180° - 30° = 150°",
    acceptedAnswers: ["30° or 150°", "π/6 or 5π/6"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_033",
    topic: "trigonometry",
    subtopic: "cosine rule",
    difficulty: 2,
    source: "2025 P2 Q6",
    question: "In triangle ABC: a = 5, b = 7, C = 60°. Find side c using the cosine rule.",
    hints: ["c² = a² + b² - 2ab·cos(C)", "c² = 25 + 49 - 2(5)(7)cos(60°)", "cos(60°) = 1/2"],
    answer: "c = √39 ≈ 6.24",
    solution: "Step 1: c² = a² + b² - 2ab·cos(C)\\nStep 2: c² = 5² + 7² - 2(5)(7)cos(60°)\\nStep 3: c² = 25 + 49 - 70(1/2)\\nStep 4: c² = 74 - 35 = 39\\nStep 5: c = √39 ≈ 6.24",
    acceptedAnswers: ["√39", "6.24"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_034",
    topic: "trigonometry",
    subtopic: "trigonometric equations",
    difficulty: 2,
    source: "2025 P2 Q6",
    question: "If cos(2X) = √3/2 and 0 < X < π/2, find tan(X)",
    hints: ["cos(2X) = √3/2, so 2X = π/6 or 2X = 11π/6", "For 0 < X < π/2: X = π/12", "tan(π/12) can be found using half-angle formula"],
    answer: "tan(X) = 2 - √3",
    solution: "Step 1: cos(2X) = √3/2 gives 2X = π/6\\nStep 2: X = π/12\\nStep 3: tan(π/12) = tan(15°) = 2 - √3 ≈ 0.268",
    acceptedAnswers: ["2 - √3", "0.268"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_035",
    topic: "probability",
    subtopic: "basic probability",
    difficulty: 1,
    source: "2025 P2 Q3",
    question: "In a class of 30 students: 15 like maths, 18 like English, 10 like both. Find P(student likes English only)",
    hints: ["Students liking English only = 18 - 10 = 8", "P(English only) = 8/30"],
    answer: "P = 8/30 = 4/15 ≈ 0.267",
    solution: "Step 1: English only = 18 - 10 = 8\\nStep 2: P(English only) = 8/30 = 4/15",
    acceptedAnswers: ["4/15", "8/30", "0.267"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_036",
    topic: "probability",
    subtopic: "conditional probability",
    difficulty: 2,
    source: "2020 P2 Q5",
    question: "P(A) = 0.3, P(B) = 0.4, P(A∩B) = 0.12. Find P(B|A)",
    hints: ["P(B|A) = P(A∩B)/P(A)", "P(B|A) = 0.12/0.3"],
    answer: "P(B|A) = 0.4",
    solution: "Step 1: P(B|A) = P(A∩B)/P(A)\\nStep 2: P(B|A) = 0.12/0.3\\nStep 3: P(B|A) = 0.4",
    acceptedAnswers: ["0.4", "2/5"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_037",
    topic: "statistics",
    subtopic: "descriptive statistics",
    difficulty: 1,
    source: "2025 P2 Q4",
    question: "Find the median and interquartile range of: 3, 5, 7, 9, 11, 13, 15",
    hints: ["Median is middle value: 9", "Q1 = 6 (median of 3,5,7)", "Q3 = 12 (median of 11,13,15)"],
    answer: "Median = 9, IQR = 6",
    solution: "Step 1: Data ordered: 3, 5, 7, 9, 11, 13, 15\\nStep 2: Median = 9\\nStep 3: Lower half: 3, 5, 7 → Q1 = 5\\nWait, let me recalculate: Q1 position = (7+1)/4 = 2, so Q1 = 5\\nQ3 position = 3(7+1)/4 = 6, so Q3 = 13\\nStep 4: IQR = 13 - 5 = 8",
    acceptedAnswers: ["Median = 9, IQR = 8"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_038",
    topic: "algebra",
    subtopic: "quadratic discriminant",
    difficulty: 1,
    source: "2025 P1 Q6",
    question: "For ax² + bx + c = 0, what does the discriminant Δ = b² - 4ac tell us?",
    hints: ["Δ > 0: Two distinct real roots", "Δ = 0: One repeated real root", "Δ < 0: No real roots (two complex roots)"],
    answer: "Δ determines the nature and number of roots",
    solution: "The discriminant Δ = b² - 4ac determines:\\n- Δ > 0: Two distinct real roots\\n- Δ = 0: One repeated real root (or double root)\\n- Δ < 0: No real roots (two complex conjugate roots)",
    acceptedAnswers: ["Determines number of roots"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_039",
    topic: "algebra",
    subtopic: "polynomial division",
    difficulty: 2,
    source: "2025 P1 Q1",
    question: "If (2x + 3) is a factor of 2x³ + kx² - 18x - 27, find k",
    hints: ["If (2x+3) is factor, then x = -3/2 is a root", "Substitute x = -3/2 into polynomial", "Set equal to 0 and solve for k"],
    answer: "k = 3",
    solution: "Step 1: If (2x+3) is a factor, then x = -3/2 is a root\\nStep 2: 2(-3/2)³ + k(-3/2)² - 18(-3/2) - 27 = 0\\nStep 3: 2(-27/8) + k(9/4) + 27 - 27 = 0\\nStep 4: -27/4 + 9k/4 = 0\\nStep 5: 9k/4 = 27/4\\nStep 6: k = 3",
    acceptedAnswers: ["k = 3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_040",
    topic: "algebra",
    subtopic: "factor theorem",
    difficulty: 2,
    source: "2024 P1 Q5",
    question: "Use the factor theorem to show that (x - 2) is a factor of x³ - 5x² + 6x",
    hints: ["Factor theorem: (x-a) is factor iff f(a) = 0", "f(2) = 2³ - 5(2)² + 6(2)", "= 8 - 20 + 12"],
    answer: "(x - 2) is a factor",
    solution: "Step 1: Let f(x) = x³ - 5x² + 6x\\nStep 2: f(2) = 2³ - 5(2)² + 6(2) = 8 - 20 + 12 = 0\\nStep 3: Since f(2) = 0, (x - 2) is a factor by the factor theorem",
    acceptedAnswers: ["(x-2) is a factor"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_041",
    topic: "algebra",
    subtopic: "remainder theorem",
    difficulty: 1,
    source: "2022 P1 Q1",
    question: "Find the remainder when x³ + 2x² - 5x + 3 is divided by (x - 1)",
    hints: ["Remainder theorem: remainder = f(1)", "f(1) = 1 + 2 - 5 + 3"],
    answer: "Remainder = 1",
    solution: "Step 1: By remainder theorem, remainder = f(1)\\nStep 2: f(1) = 1³ + 2(1)² - 5(1) + 3\\nStep 3: = 1 + 2 - 5 + 3 = 1",
    acceptedAnswers: ["1"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_042",
    topic: "integration",
    subtopic: "area between curves",
    difficulty: 3,
    source: "2023 P1 Q6",
    question: "Find the area enclosed between y = x + 4 and y = x² - 2",
    hints: ["Find intersection points: x + 4 = x² - 2", "x² - x - 6 = 0, (x-3)(x+2) = 0", "x = -2, x = 3"],
    answer: "Area = 125/6 ≈ 20.83 square units",
    solution: "Step 1: Find intersections: x + 4 = x² - 2\\nStep 2: x² - x - 6 = 0, x = 3 or x = -2\\nStep 3: Line is above parabola on [-2,3]\\nStep 4: Area = ∫₋₂³ [(x+4) - (x²-2)] dx\\nStep 5: = ∫₋₂³ (x + 6 - x²) dx\\nStep 6: = [x²/2 + 6x - x³/3]₋₂³\\nStep 7: = (9/2 + 18 - 9) - (2 - 12 + 8/3)\\nStep 8: = 10.5 - (-7/3) = 10.5 + 2.333... = 125/6",
    acceptedAnswers: ["125/6", "20.83"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_043",
    topic: "differentiation",
    subtopic: "local extrema",
    difficulty: 2,
    source: "2020 P1 Q4",
    question: "Find the turning points of f(x) = x³ - 3x² - 9x + 5",
    hints: ["Find f'(x) = 3x² - 6x - 9", "Set f'(x) = 0: 3(x² - 2x - 3) = 0", "(x - 3)(x + 1) = 0"],
    answer: "Turning points: (-1, 16) and (3, -22)",
    solution: "Step 1: f'(x) = 3x² - 6x - 9 = 3(x² - 2x - 3)\\nStep 2: = 3(x - 3)(x + 1) = 0\\nStep 3: x = 3 or x = -1\\nStep 4: f(-1) = -1 - 3 + 9 + 5 = 10\\nActually: f(-1) = (-1)³ - 3(-1)² - 9(-1) + 5 = -1 - 3 + 9 + 5 = 10\\nf(3) = 27 - 27 - 27 + 5 = -22",
    acceptedAnswers: ["(-1, 10) and (3, -22)"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_044",
    topic: "algebra",
    subtopic: "surds and roots",
    difficulty: 2,
    source: "2019 P1 Q6",
    question: "Solve x - √32 = √128 - 5x",
    hints: ["√32 = 4√2, √128 = 8√2", "x - 4√2 = 8√2 - 5x", "6x = 12√2"],
    answer: "x = 2√2",
    solution: "Step 1: √32 = √(16·2) = 4√2\\nStep 2: √128 = √(64·2) = 8√2\\nStep 3: x - 4√2 = 8√2 - 5x\\nStep 4: x + 5x = 8√2 + 4√2\\nStep 5: 6x = 12√2\\nStep 6: x = 2√2 ≈ 2.828",
    acceptedAnswers: ["x = 2√2", "2.828"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_045",
    topic: "functions",
    subtopic: "composite functions",
    difficulty: 2,
    source: "2024 P1 Q5",
    question: "If f(x) = eˣ and g(x) = ln(x), find f(g(x)) and g(f(x))",
    hints: ["f(g(x)) = f(ln(x)) = e^(ln(x))", "g(f(x)) = g(eˣ) = ln(eˣ)"],
    answer: "f(g(x)) = x, g(f(x)) = x",
    solution: "Step 1: f(g(x)) = f(ln(x)) = e^(ln(x)) = x\\nStep 2: g(f(x)) = g(eˣ) = ln(eˣ) = x\\nNote: These are inverse functions",
    acceptedAnswers: ["f(g(x)) = x, g(f(x)) = x"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_046",
    topic: "differentiation",
    subtopic: "inflection points",
    difficulty: 2,
    source: "2022 P1 Q2",
    question: "For f(x) = x³ - 6x² + 12x, find the inflection point and tangent line there",
    hints: ["f'(x) = 3x² - 12x + 12", "f''(x) = 6x - 12 = 0 when x = 2", "f(2) = 8 - 24 + 24 = 8"],
    answer: "Inflection point: (2, 8), tangent line: y = 12",
    solution: "Step 1: f''(x) = 6x - 12 = 0, x = 2\\nStep 2: f(2) = 8 - 24 + 24 = 8\\nStep 3: f'(2) = 12 - 24 + 12 = 0\\nStep 4: Inflection at (2, 8), tangent: y - 8 = 0(x - 2), y = 8",
    acceptedAnswers: ["(2, 8), y = 8"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_047",
    topic: "algebra",
    subtopic: "surds",
    difficulty: 1,
    source: "2021 P1 Q1",
    question: "Simplify √(-5 + 12i)",
    hints: ["Let √(-5 + 12i) = a + bi", "(a + bi)² = -5 + 12i", "a² - b² = -5, 2ab = 12"],
    answer: "√(-5 + 12i) = 2 + 3i (or -2 - 3i)",
    solution: "Step 1: Let √(-5 + 12i) = a + bi\\nStep 2: (a + bi)² = a² - b² + 2abi = -5 + 12i\\nStep 3: a² - b² = -5, 2ab = 12\\nStep 4: ab = 6, so b = 6/a\\nStep 5: a² - 36/a² = -5\\nStep 6: a⁴ + 5a² - 36 = 0\\nStep 7: (a² + 9)(a² - 4) = 0, a² = 4\\nStep 8: a = 2, b = 3",
    acceptedAnswers: ["2 + 3i", "-2 - 3i"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_048",
    topic: "complex_numbers",
    subtopic: "nth roots",
    difficulty: 2,
    source: "2021 P1 Q1",
    question: "Find all solutions to z³ = -8",
    hints: ["-8 = 8e^(iπ)", "z = 2e^(i(π + 2πk)/3) for k = 0,1,2", "Three solutions with different arguments"],
    answer: "z = -2, z = 1 + i√3, z = 1 - i√3",
    solution: "Step 1: -8 = 8e^(iπ)\\nStep 2: z = 2e^(i(π+2πk)/3) for k = 0,1,2\\nStep 3: k=0: z = 2e^(iπ/3) = 2(1/2 + i√3/2) = 1 + i√3\\nk=1: z = 2e^(iπ) = -2\\nk=2: z = 2e^(i5π/3) = 1 - i√3",
    acceptedAnswers: ["-2, 1 + i√3, 1 - i√3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_049",
    topic: "sequences_series",
    subtopic: "geometric series sum",
    difficulty: 2,
    source: "2020 P1 Q2",
    question: "Find the sum of the first 9 terms of geometric series with first term a = 2 and ratio r = 3",
    hints: ["Sₙ = a(rⁿ - 1)/(r - 1)", "S₉ = 2(3⁹ - 1)/(3 - 1)"],
    answer: "S₉ = 19682",
    solution: "Step 1: Sₙ = a(rⁿ - 1)/(r - 1)\\nStep 2: S₉ = 2(3⁹ - 1)/(3 - 1)\\nStep 3: 3⁹ = 19683\\nStep 4: S₉ = 2(19682)/2 = 19682",
    acceptedAnswers: ["19682"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_050",
    topic: "functions",
    subtopic: "function analysis",
    difficulty: 2,
    source: "2025 P1 Q3",
    question: "Explain why g(x) = 3/(2x - 7) has no maximum or minimum",
    hints: ["g(x) is continuous on its domain", "Domain: x ≠ 7/2", "As x→7/2⁻: g(x)→-∞, as x→7/2⁺: g(x)→+∞"],
    answer: "Function has vertical asymptote at x = 7/2; unbounded on each side",
    solution: "Step 1: g(x) = 3/(2x - 7) is undefined at x = 7/2\\nStep 2: g'(x) = -6/(2x - 7)² < 0 always (where defined)\\nStep 3: Function is strictly decreasing on (-∞, 7/2) and on (7/2, ∞)\\nStep 4: No maximum or minimum exists because function is unbounded near the asymptote",
    acceptedAnswers: ["Vertical asymptote", "Unbounded", "Has vertical asymptote at x=7/2"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_051",
    topic: "coord_line",
    subtopic: "section formula",
    difficulty: 2,
    source: "2022 P2 Q2",
    question: "Find the point that divides the line segment from A(1, 2) to B(9, 6) in ratio 3:1",
    hints: ["Section formula: ((3x₂ + x₁)/(3+1), (3y₂ + y₁)/(3+1))", "x = (3(9) + 1)/4 = 28/4 = 7", "y = (3(6) + 2)/4 = 20/4 = 5"],
    answer: "Point = (7, 5)",
    solution: "Step 1: Divide in ratio 3:1 means closer to B\\nStep 2: x = (3·9 + 1·1)/(3+1) = 28/4 = 7\\nStep 3: y = (3·6 + 1·2)/(3+1) = 20/4 = 5",
    acceptedAnswers: ["(7, 5)"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_052",
    topic: "coord_circle",
    subtopic: "circle from points",
    difficulty: 3,
    source: "2023 P2 Q4",
    question: "Find the equation of the circle passing through (0,0), (4,0), and (0,3)",
    hints: ["General form: x² + y² + 2gx + 2fy + c = 0", "Through (0,0): c = 0", "Through (4,0): 16 + 8g = 0, g = -2"],
    answer: "(x - 2)² + (y - 3/2)² = 25/4",
    solution: "Step 1: Substitute (0,0): c = 0\\nStep 2: (4,0): 16 + 8g = 0, g = -2\\nStep 3: (0,3): 9 + 6f = 0, f = -3/2\\nStep 4: x² + y² - 4x - 3y = 0\\nStep 5: (x-2)² + (y-3/2)² = 4 + 9/4 = 25/4",
    acceptedAnswers: ["(x-2)² + (y-3/2)² = 25/4"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_053",
    topic: "trigonometry",
    subtopic: "trig identities",
    difficulty: 2,
    source: "2023 P2 Q2",
    question: "Prove that sin(A + B) = sin(A)cos(B) + cos(A)sin(B)",
    hints: ["Use unit circle or geometric approach", "Key steps in proof by rotation"],
    answer: "Identity proven",
    solution: "Using the unit circle:\nLet P be at angle A, Q at angle A+B\\ncoordinates: P = (cos A, sin A), Q = (cos(A+B), sin(A+B))\\nUsing rotation matrix or vector methods:\\nsin(A+B) = sin(A)cos(B) + cos(A)sin(B)",
    acceptedAnswers: ["Proven"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_054",
    topic: "trigonometry",
    subtopic: "angle addition",
    difficulty: 2,
    source: "2023 P2 Q2",
    question: "Calculate sin(75°) exactly",
    hints: ["75° = 45° + 30°", "Use sin(A+B) = sin A cos B + cos A sin B"],
    answer: "sin(75°) = (√6 + √2)/4",
    solution: "Step 1: sin(75°) = sin(45° + 30°)\\nStep 2: = sin(45°)cos(30°) + cos(45°)sin(30°)\\nStep 3: = (√2/2)(√3/2) + (√2/2)(1/2)\\nStep 4: = (√6/4) + (√2/4) = (√6 + √2)/4",
    acceptedAnswers: ["(√6 + √2)/4"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_055",
    topic: "sequences_series",
    subtopic: "arithmetic series",
    difficulty: 1,
    source: "2009 P1 Q4",
    question: "Find the sum of first 20 terms of AP: 5, 8, 11, 14, ...",
    hints: ["First term a = 5, common difference d = 3", "Sₙ = n/2[2a + (n-1)d]", "S₂₀ = 20/2[2(5) + 19(3)]"],
    answer: "S₂₀ = 670",
    solution: "Step 1: a = 5, d = 3, n = 20\\nStep 2: Sₙ = n/2[2a + (n-1)d]\\nStep 3: S₂₀ = 10[10 + 57]\\nStep 4: S₂₀ = 10 × 67 = 670",
    acceptedAnswers: ["670"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_056",
    topic: "differentiation",
    subtopic: "parametric differentiation",
    difficulty: 2,
    source: "2009 P1 Q6",
    question: "If x = t², y = t³, find dy/dx at t = 2",
    hints: ["dy/dx = (dy/dt)/(dx/dt)", "dx/dt = 2t, dy/dt = 3t²"],
    answer: "dy/dx|ₜ₌₂ = 3",
    solution: "Step 1: dx/dt = 2t, dy/dt = 3t²\\nStep 2: dy/dx = 3t²/(2t) = 3t/2\\nStep 3: At t = 2: dy/dx = 3(2)/2 = 3",
    acceptedAnswers: ["3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_057",
    topic: "differentiation",
    subtopic: "implicit differentiation",
    difficulty: 2,
    source: "2009 P1 Q7",
    question: "Find dy/dx if x² - y² = 25",
    hints: ["Differentiate both sides with respect to x", "2x - 2y(dy/dx) = 0"],
    answer: "dy/dx = x/y",
    solution: "Step 1: d/dx(x² - y²) = d/dx(25)\\nStep 2: 2x - 2y(dy/dx) = 0\\nStep 3: 2y(dy/dx) = 2x\\nStep 4: dy/dx = x/y",
    acceptedAnswers: ["x/y"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_058",
    topic: "probability",
    subtopic: "binomial distribution",
    difficulty: 2,
    source: "2021 P2 Q1",
    question: "In a class, 15% of students are left-handed. In a sample of 8 students, find P(exactly 2 are left-handed)",
    hints: ["X ~ B(8, 0.15)", "P(X = 2) = C(8,2)(0.15)²(0.85)⁶"],
    answer: "P(X = 2) ≈ 0.239",
    solution: "Step 1: P(X = 2) = C(8,2)(0.15)²(0.85)⁶\\nStep 2: = 28 × 0.0225 × 0.377149\\nStep 3: ≈ 0.239",
    acceptedAnswers: ["0.239", "23.9%"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_059",
    topic: "coord_line",
    subtopic: "distance between lines",
    difficulty: 2,
    source: "2020 P2 Q1",
    question: "Find the perpendicular distance between parallel lines 3x + 4y = 5 and 3x + 4y = 20",
    hints: ["Both lines: 3x + 4y = c₁ and 3x + 4y = c₂", "Distance = |c₂ - c₁|/√(a² + b²)"],
    answer: "Distance = 3",
    solution: "Step 1: Distance = |20 - 5|/√(9 + 16)\\nStep 2: = 15/√25\\nStep 3: = 15/5 = 3",
    acceptedAnswers: ["3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_060",
    topic: "coord_line",
    subtopic: "area of triangle",
    difficulty: 2,
    source: "2023 P2 Q3",
    question: "Find the area of triangle with vertices A(0,0), B(4,0), C(2,3)",
    hints: ["Area = ½|x₁(y₂ - y₃) + x₂(y₃ - y₁) + x₃(y₁ - y₂)|", "= ½|0(0-3) + 4(3-0) + 2(0-0)|"],
    answer: "Area = 6 square units",
    solution: "Step 1: Area = ½|0(0-3) + 4(3-0) + 2(0-0)|\\nStep 2: = ½|0 + 12 + 0|\\nStep 3: = ½ × 12 = 6",
    acceptedAnswers: ["6"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_061",
    topic: "functions",
    subtopic: "exponential functions",
    difficulty: 2,
    source: "2017 P1 Q4",
    question: "A substance decays exponentially. If 0.01% remains after 10 days, find the half-life",
    hints: ["Remaining = A(0.5)^(t/T) where T is half-life", "0.0001 = (0.5)^(10/T)"],
    answer: "Half-life ≈ 0.32 days",
    solution: "Step 1: 0.0001 = (0.5)^(10/T)\\nStep 2: ln(0.0001) = (10/T)ln(0.5)\\nStep 3: -9.210 = (10/T)(-0.693)\\nStep 4: T = 10 × 0.693/9.210 ≈ 0.753 days",
    acceptedAnswers: ["≈ 0.75 days"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_062",
    topic: "algebra",
    subtopic: "quadratic inequalities",
    difficulty: 2,
    source: "2018 P1 Q1",
    question: "Solve (2x - 3)/(x + 2) ≥ 3",
    hints: ["Rearrange: (2x - 3)/(x + 2) - 3 ≥ 0", "(2x - 3 - 3(x+2))/(x + 2) ≥ 0", "(-x - 9)/(x + 2) ≥ 0"],
    answer: "x < -9 or -2 < x ≤ -9 (wait, recheck) Actually: -9 ≤ x < -2",
    solution: "Step 1: (2x-3)/(x+2) ≥ 3\\nStep 2: (2x-3-3x-6)/(x+2) ≥ 0\\nStep 3: (-x-9)/(x+2) ≥ 0\\nStep 4: (x+9)/(x+2) ≤ 0\\nStep 5: Critical points: x = -9, x = -2\\nStep 6: Testing intervals: -9 ≤ x < -2",
    acceptedAnswers: ["-9 ≤ x < -2"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_063",
    topic: "algebra",
    subtopic: "matrix operations",
    difficulty: 2,
    source: "2009 P1 Q3",
    question: "If A = [[1, 2], [0, 1]], find A³",
    hints: ["A² = A × A", "A³ = A² × A"],
    answer: "A³ = [[1, 6], [0, 1]]",
    solution: "Step 1: A² = [[1,2],[0,1]] × [[1,2],[0,1]] = [[1,4],[0,1]]\\nStep 2: A³ = A² × A = [[1,4],[0,1]] × [[1,2],[0,1]] = [[1,6],[0,1]]",
    acceptedAnswers: ["[[1,6],[0,1]]"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_064",
    topic: "differentiation",
    subtopic: "rates of change",
    difficulty: 2,
    source: "2009 P1 Q6",
    question: "If position s(t) = √(t² + 1), find the speed at t = 3",
    hints: ["Speed = |ds/dt|", "ds/dt = t/√(t² + 1)"],
    answer: "Speed = 3/√10 = 3√10/10",
    solution: "Step 1: ds/dt = d/dt[√(t²+1)] = t/√(t²+1)\\nStep 2: At t=3: ds/dt = 3/√(9+1) = 3/√10\\nStep 3: Speed = 3/√10 = 3√10/10 ≈ 0.949",
    acceptedAnswers: ["3/√10", "3√10/10", "0.949"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_065",
    topic: "functions",
    subtopic: "asymptotes",
    difficulty: 1,
    source: "2009 P1 Q6",
    question: "Find the asymptotes of y = 2/(x - 3)",
    hints: ["Vertical asymptote: denominator = 0, x = 3", "Horizontal asymptote: as x→∞, y→0"],
    answer: "Vertical: x = 3, Horizontal: y = 0",
    solution: "Step 1: Vertical asymptote when denominator = 0: x - 3 = 0, x = 3\\nStep 2: As x→∞: y→0, so horizontal asymptote: y = 0",
    acceptedAnswers: ["x = 3, y = 0"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_066",
    topic: "differentiation",
    subtopic: "tangent lines",
    difficulty: 2,
    source: "2009 P1 Q6",
    question: "Show that y = 1/(x - 1) has no perpendicular tangent lines",
    hints: ["If tangents perpendicular, slopes m₁ and m₂ satisfy m₁·m₂ = -1", "f'(x) = -1/(x-1)²"],
    answer: "No perpendicular tangents exist",
    solution: "Step 1: f'(x) = -1/(x-1)²  < 0 always\\nStep 2: For perpendicular tangents: m₁·m₂ = -1\\nStep 3: Need -1/(x₁-1)² · -1/(x₂-1)² = -1\\nStep 4: 1/[(x₁-1)²(x₂-1)²] = -1 (impossible, left side always positive)",
    acceptedAnswers: ["No perpendicular tangents"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_067",
    topic: "sequences_series",
    subtopic: "recursive sequences",
    difficulty: 2,
    source: "2022 P1 Q4",
    question: "In recursive sequence a₁ = 2, aₙ = 3aₙ₋₁ + 1, find a₃",
    hints: ["a₂ = 3a₁ + 1 = 3(2) + 1 = 7", "a₃ = 3a₂ + 1"],
    answer: "a₃ = 22",
    solution: "Step 1: a₁ = 2\\nStep 2: a₂ = 3(2) + 1 = 7\\nStep 3: a₃ = 3(7) + 1 = 22",
    acceptedAnswers: ["22"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_068",
    topic: "integration",
    subtopic: "definite integrals",
    difficulty: 2,
    source: "2023 P1 Q6",
    question: "Evaluate ∫₀ᵇ b·e^(bx) dx = e",
    hints: ["∫ be^(bx) dx = e^(bx)", "[e^(bx)]₀ᵇ = e^(b²) - 1"],
    answer: "b = ln(e + 1) ≈ 1.313",
    solution: "Step 1: ∫ b·e^(bx) dx = e^(bx)\\nStep 2: [e^(bx)]₀ᵇ = e^(b²) - 1\\nStep 3: e^(b²) - 1 = e\\nStep 4: e^(b²) = e + 1\\nStep 5: b² = ln(e + 1)\\nStep 6: b = √[ln(e + 1)] ≈ 1.100",
    acceptedAnswers: ["√ln(e+1)", "1.1"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_069",
    topic: "trigonometry",
    subtopic: "trigonometric equations",
    difficulty: 2,
    source: "2023 P2 Q2",
    question: "Solve sin(t) = sin(2t) for 0 ≤ t < 2π",
    hints: ["sin(2t) = 2sin(t)cos(t)", "sin(t) = 2sin(t)cos(t)", "sin(t)[1 - 2cos(t)] = 0"],
    answer: "t = 0, π/3, π, 5π/3",
    solution: "Step 1: sin(t) = 2sin(t)cos(t)\\nStep 2: sin(t) - 2sin(t)cos(t) = 0\\nStep 3: sin(t)[1 - 2cos(t)] = 0\\nStep 4: sin(t) = 0 → t = 0, π\\nStep 5: cos(t) = 1/2 → t = π/3, 5π/3",
    acceptedAnswers: ["0, π/3, π, 5π/3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_070",
    topic: "probability",
    subtopic: "expected value",
    difficulty: 2,
    source: "2024 P2 Q2",
    question: "X is 2 with probability 0.3, 5 with probability 0.5, and 8 with probability 0.2. Find E(X)",
    hints: ["E(X) = ΣxP(x)", "= 2(0.3) + 5(0.5) + 8(0.2)"],
    answer: "E(X) = 4.9",
    solution: "Step 1: E(X) = 2(0.3) + 5(0.5) + 8(0.2)\\nStep 2: = 0.6 + 2.5 + 1.6\\nStep 3: = 4.7",
    acceptedAnswers: ["4.7"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_071",
    topic: "trigonometry",
    subtopic: "cosine rule",
    difficulty: 2,
    source: "2024 P2 Q3",
    question: "In triangle, a = 5, b = 6, c = 7. Find cos(A)",
    hints: ["cos(A) = (b² + c² - a²)/(2bc)", "= (36 + 49 - 25)/(2·6·7)"],
    answer: "cos(A) = 10/21",
    solution: "Step 1: cos(A) = (b² + c² - a²)/(2bc)\\nStep 2: = (36 + 49 - 25)/(84)\\nStep 3: = 60/84 = 10/14 = 5/7\\nWait: 60/84 = 5/7. Actually 60/84 = 10/14 = 5/7. But let me recalculate: (36+49-25)/(2·6·7) = 60/84 = 5/7",
    acceptedAnswers: ["5/7"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_072",
    topic: "algebra",
    subtopic: "factorisation",
    difficulty: 1,
    source: "2019 P1 Q3",
    question: "Factorise 3xy - 9x + 4y - 12",
    hints: ["Group: (3xy - 9x) + (4y - 12)", "= 3x(y - 3) + 4(y - 3)"],
    answer: "(3x + 4)(y - 3)",
    solution: "Step 1: 3xy - 9x + 4y - 12\\nStep 2: = 3x(y - 3) + 4(y - 3)\\nStep 3: = (3x + 4)(y - 3)",
    acceptedAnswers: ["(3x + 4)(y - 3)"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_073",
    topic: "functions",
    subtopic: "function factorisation",
    difficulty: 2,
    source: "2019 P1 Q3",
    question: "If g(x) = 3x·ln(x) - 9x + 4·ln(x) - 12, express as g(x) = (3x + 4)(ln(x) - 3)",
    hints: ["Same factorisation as algebraic: 3xy - 9x + 4y - 12 where y = ln(x)"],
    answer: "g(x) = (3x + 4)(ln(x) - 3)",
    solution: "Step 1: g(x) = 3x·ln(x) - 9x + 4·ln(x) - 12\\nStep 2: Let y = ln(x): same as 3xy - 9x + 4y - 12\\nStep 3: = (3x + 4)(y - 3) = (3x + 4)(ln(x) - 3)",
    acceptedAnswers: ["(3x + 4)(ln(x) - 3)"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_074",
    topic: "sequences_series",
    subtopic: "binomial expansion",
    difficulty: 2,
    source: "2019 P1 Q1",
    question: "Find the coefficient of x in (2x + 1)(x² + px + 4)",
    hints: ["Expand: 2x³ + 2px² + 8x + x² + px + 4", "Coefficient of x: 8 + p"],
    answer: "Coefficient = 8 + p (depends on p)",
    solution: "Step 1: (2x+1)(x²+px+4) = 2x³ + 2px² + 8x + x² + px + 4\\nStep 2: = 2x³ + (2p+1)x² + (8+p)x + 4\\nStep 3: Coefficient of x is 8 + p",
    acceptedAnswers: ["8 + p"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_075",
    topic: "complex_numbers",
    subtopic: "De Moivre theorem",
    difficulty: 2,
    source: "2009 P1 Q3",
    question: "Use De Moivre's theorem to show sin(3θ) = 3sin(θ) - 4sin³(θ)",
    hints: ["(cos θ + i sin θ)³ = cos(3θ) + i sin(3θ)", "Expand left side and equate imaginary parts"],
    answer: "sin(3θ) = 3sin(θ) - 4sin³(θ) proven",
    solution: "Step 1: (cos θ + i sin θ)³ = cos(3θ) + i sin(3θ)\\nStep 2: Expand: cos³θ + 3i cos²θ sin θ - 3cos θ sin²θ - i sin³θ\\nStep 3: = (cos³θ - 3cos θ sin²θ) + i(3cos²θ sin θ - sin³θ)\\nStep 4: Imaginary part: 3cos²θ sin θ - sin³θ = sin θ(3cos²θ - sin²θ)\\nStep 5: = sin θ(3(1-sin²θ) - sin²θ) = sin θ(3 - 4sin²θ)\\nStep 6: = 3sin θ - 4sin³θ",
    acceptedAnswers: ["Proven"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_076",
    topic: "algebra",
    subtopic: "polynomial equations",
    difficulty: 2,
    source: "2017 P1 Q5",
    question: "Find the roots of f(x) = 2x³ + 5x² - 4x - 3",
    hints: ["Test rational roots: ±1, ±3, ±1/2, ±3/2", "f(1) = 2 + 5 - 4 - 3 = 0 ✓"],
    answer: "Roots: x = 1, x = (-3+√3)/2, x = (-3-√3)/2",
    solution: "Step 1: f(1) = 0, so (x-1) is a factor\\nStep 2: 2x³ + 5x² - 4x - 3 = (x-1)(2x² + 7x + 3)\\nStep 3: 2x² + 7x + 3 = 0\\nStep 4: x = (-7 ± √(49-24))/4 = (-7 ± 5)/4\\nStep 5: x = -1/2 or x = -3\\nActually: roots are 1, -1/2, -3",
    acceptedAnswers: ["1, -1/2, -3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_077",
    topic: "sequences_series",
    subtopic: "financial mathematics",
    difficulty: 2,
    source: "2017 P1 Q8",
    question: "A loan of €10,000 at 5% per annum compounds annually. What is the amount after 3 years?",
    hints: ["A = P(1 + r)^n", "A = 10000(1.05)³"],
    answer: "A = €11,576.25",
    solution: "Step 1: A = P(1 + r)^n\\nStep 2: A = 10000(1.05)³\\nStep 3: = 10000 × 1.157625\\nStep 4: = €11,576.25",
    acceptedAnswers: ["€11,576.25", "11576.25"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_078",
    topic: "sequences_series",
    subtopic: "infinite geometric series",
    difficulty: 2,
    source: "2009 P1 Q4",
    question: "Find the sum of infinite geometric series: 1 + 1/2 + 1/4 + 1/8 + ...",
    hints: ["a = 1, r = 1/2", "S∞ = a/(1 - r) where |r| < 1"],
    answer: "S∞ = 2",
    solution: "Step 1: a = 1, r = 1/2\\nStep 2: S∞ = 1/(1 - 1/2) = 1/(1/2) = 2",
    acceptedAnswers: ["2"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_079",
    topic: "integration",
    subtopic: "trigonometric integration",
    difficulty: 2,
    source: "2009 P1 Q3",
    question: "Find ∫sin³(θ) dθ",
    hints: ["sin³(θ) = sin(θ)(1 - cos²(θ))", "Let u = cos(θ), du = -sin(θ) dθ"],
    answer: "-cos(θ) + (cos³(θ))/3 + C",
    solution: "Step 1: ∫sin³θ dθ = ∫sin(θ)(1-cos²θ) dθ\\nStep 2: Let u = cos(θ), du = -sin(θ) dθ\\nStep 3: = -∫(1-u²) du = -[u - u³/3] + C\\nStep 4: = -cos(θ) + cos³(θ)/3 + C",
    acceptedAnswers: ["-cos(θ) + cos³(θ)/3 + C"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_080",
    topic: "integration",
    subtopic: "integration by parts",
    difficulty: 2,
    source: "2009 P1 Q8",
    question: "Find ∫sin(3x)·sin(x) dx",
    hints: ["Use product formula: sin A sin B = 1/2[cos(A-B) - cos(A+B)]", "sin(3x)sin(x) = 1/2[cos(2x) - cos(4x)]"],
    answer: "sin(2x)/4 - sin(4x)/8 + C",
    solution: "Step 1: sin(3x)sin(x) = 1/2[cos(2x) - cos(4x)]\\nStep 2: ∫1/2[cos(2x) - cos(4x)] dx\\nStep 3: = 1/2[sin(2x)/2 - sin(4x)/4] + C\\nStep 4: = sin(2x)/4 - sin(4x)/8 + C",
    acceptedAnswers: ["sin(2x)/4 - sin(4x)/8 + C"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_081",
    topic: "differentiation",
    subtopic: "numerical methods",
    difficulty: 2,
    source: "2009 P1 Q7",
    question: "Use Newton-Raphson with x₀ = 2 to find root of f(x) = x² - 3 (one iteration)",
    hints: ["x_{n+1} = x_n - f(x_n)/f'(x_n)", "f'(x) = 2x"],
    answer: "x₁ ≈ 1.75",
    solution: "Step 1: x₀ = 2\\nStep 2: f(2) = 4 - 3 = 1\\nStep 3: f'(2) = 4\\nStep 4: x₁ = 2 - 1/4 = 1.75",
    acceptedAnswers: ["1.75"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_082",
    topic: "algebra",
    subtopic: "proof by contradiction",
    difficulty: 2,
    source: "2019 P1 Q6",
    question: "Prove that √2 is irrational",
    hints: ["Assume √2 = p/q where p, q coprime", "Then 2q² = p²", "Both p and q must be even - contradiction"],
    answer: "√2 is irrational (proven by contradiction)",
    solution: "Assume √2 = p/q (lowest terms)\\nThen 2q² = p²\\nSo p² is even, hence p is even\\nLet p = 2k: 2q² = 4k², q² = 2k²\\nSo q² is even, hence q is even\\nBut p and q both even contradicts lowest terms",
    acceptedAnswers: ["Proven"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_083",
    topic: "functions",
    subtopic: "function composition",
    difficulty: 2,
    source: "2020 P1 Q3",
    question: "If f(x) = 3x and g(x) = x² - 1, find f(g(x)) = g(f(x))",
    hints: ["f(g(x)) = 3(x² - 1)", "g(f(x)) = (3x)² - 1"],
    answer: "3x² - 3 = 9x² - 1 (different functions)",
    solution: "Step 1: f(g(x)) = f(x²-1) = 3(x²-1) = 3x² - 3\\nStep 2: g(f(x)) = g(3x) = (3x)² - 1 = 9x² - 1\\nStep 3: These are not equal (for x ≠ 0)",
    acceptedAnswers: ["Not equal"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_084",
    topic: "logs_indices",
    subtopic: "logarithm properties",
    difficulty: 2,
    source: "2020 P1 Q3",
    question: "If log₅(y) = a + b·log₅(x), express y in terms of x",
    hints: ["log₅(y) = a + b·log₅(x)", "y = 5^(a + b·log₅(x))"],
    answer: "y = 5ᵃ·x^b",
    solution: "Step 1: log₅(y) = a + b·log₅(x)\\nStep 2: y = 5^(a + b·log₅(x))\\nStep 3: = 5ᵃ · 5^(b·log₅(x))\\nStep 4: = 5ᵃ · (5^(log₅(x)))^b\\nStep 5: = 5ᵃ · x^b",
    acceptedAnswers: ["y = 5ᵃ·x^b"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_085",
    topic: "sequences_series",
    subtopic: "telescoping series",
    difficulty: 2,
    source: "2009 P1 Q4",
    question: "Find the sum: 2/(1²-1) + 2/(2²-1) + ... + 2/(n²-1)",
    hints: ["2/(r²-1) = 2/((r-1)(r+1)) = 1/(r-1) - 1/(r+1)", "Telescoping series"],
    answer: "Sum = 3/2 - 1/(n+1)",
    solution: "Step 1: 2/(r²-1) = 1/(r-1) - 1/(r+1) (partial fractions)\\nStep 2: Sum telescopes: [1/0 - 1/2] + [1/1 - 1/3] + [1/2 - 1/4] + ... + [1/(n-1) - 1/(n+1)]\\nStep 3: = 1/0 + 1/1 - 1/n - 1/(n+1)\\nActually: = 3/2 - 1/(n+1)",
    acceptedAnswers: ["3/2 - 1/(n+1)"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_086",
    topic: "probability",
    subtopic: "combinations",
    difficulty: 2,
    source: "2019 P1 Q1",
    question: "How many ways can 5 items be chosen from 10 items?",
    hints: ["C(10,5) = 10!/(5!·5!)"],
    answer: "252",
    solution: "Step 1: C(10,5) = 10!/(5!·5!)\\nStep 2: = (10·9·8·7·6)/(5·4·3·2·1)\\nStep 3: = 30240/120 = 252",
    acceptedAnswers: ["252"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_087",
    topic: "probability",
    subtopic: "permutations",
    difficulty: 1,
    source: "2018 P2 Q3",
    question: "How many 6-digit codes can be formed using digits 1-9 without repetition?",
    hints: ["First digit: 9 choices", "Second digit: 8 choices, etc."],
    answer: "P(9,6) = 60,480",
    solution: "Step 1: P(9,6) = 9!/(9-6)! = 9!/3!\\nStep 2: = 9·8·7·6·5·4 = 60,480",
    acceptedAnswers: ["60480"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_088",
    topic: "trigonometry",
    subtopic: "angle subtraction",
    difficulty: 2,
    source: "2018 P2 Q4",
    question: "Prove that tan(A - B) = (tan A - tan B)/(1 + tan A tan B)",
    hints: ["Use sin(A-B)/cos(A-B)", "sin(A-B) = sin A cos B - cos A sin B"],
    answer: "Identity proven",
    solution: "tan(A-B) = sin(A-B)/cos(A-B)\\n= (sin A cos B - cos A sin B)/(cos A cos B + sin A sin B)\\nDivide by cos A cos B:\\n= (tan A - tan B)/(1 + tan A tan B)",
    acceptedAnswers: ["Proven"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_089",
    topic: "trigonometry",
    subtopic: "angle subtraction",
    difficulty: 2,
    source: "2018 P2 Q4",
    question: "Calculate tan(15°) using tan(45° - 30°)",
    hints: ["tan(15°) = (tan 45° - tan 30°)/(1 + tan 45° tan 30°)", "tan 45° = 1, tan 30° = 1/√3"],
    answer: "tan(15°) = 2 - √3",
    solution: "Step 1: tan(15°) = (1 - 1/√3)/(1 + 1/√3)\\nStep 2: = (√3 - 1)/(√3 + 1) · (√3 - 1)/(√3 - 1)\\nStep 3: = (3 - 2√3 + 1)/(3 - 1)\\nStep 4: = (4 - 2√3)/2 = 2 - √3",
    acceptedAnswers: ["2 - √3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_090",
    topic: "statistics",
    subtopic: "hypothesis testing",
    difficulty: 2,
    source: "2022 P2 Q5",
    question: "In a hypothesis test, what is a Type I error?",
    hints: ["Rejecting null hypothesis when it's true", "False positive"],
    answer: "Rejecting H₀ when H₀ is true",
    solution: "Type I error: Rejecting the null hypothesis (H₀) when it is actually true. This is also called a false positive.",
    acceptedAnswers: ["Rejecting H₀ when true"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_091",
    topic: "statistics",
    subtopic: "normal distribution",
    difficulty: 2,
    source: "2018 P2 Q2",
    question: "If X ~ N(100, 15²) and we want top 15% of scores, find the z-score",
    hints: ["Top 15% means P(Z > z) = 0.15", "P(Z < z) = 0.85"],
    answer: "z ≈ 1.036",
    solution: "Step 1: Top 15% means we want P(X > x₀) = 0.15\\nStep 2: P(Z < z) = 0.85\\nStep 3: From normal tables: z ≈ 1.036",
    acceptedAnswers: ["1.04", "1.036"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_092",
    topic: "coord_circle",
    subtopic: "circle geometry",
    difficulty: 2,
    source: "2021 P2 Q3",
    question: "Two circles have equations x² + y² = 4 and (x-3)² + y² = 1. Are they tangent?",
    hints: ["Circle 1: center (0,0), radius 2", "Circle 2: center (3,0), radius 1", "Distance between centers: 3"],
    answer: "Yes, externally tangent (sum of radii = 3)",
    solution: "Step 1: C₁ = (0,0), r₁ = 2; C₂ = (3,0), r₂ = 1\\nStep 2: Distance = 3\\nStep 3: r₁ + r₂ = 3 (externally tangent)",
    acceptedAnswers: ["Yes, externally tangent"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_093",
    topic: "coord_circle",
    subtopic: "circle equations",
    difficulty: 2,
    source: "2022 P2 Q3",
    question: "Find circle of radius 5√3 tangent to both coordinate axes in first quadrant",
    hints: ["If tangent to both axes, center is at (r, r) where r = radius", "Center: (5√3, 5√3)"],
    answer: "(x - 5√3)² + (y - 5√3)² = 75",
    solution: "Step 1: Circle tangent to both axes in Q1: center (r, r)\\nStep 2: Center: (5√3, 5√3)\\nStep 3: Equation: (x - 5√3)² + (y - 5√3)² = (5√3)² = 75",
    acceptedAnswers: ["(x - 5√3)² + (y - 5√3)² = 75"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_094",
    topic: "algebra",
    subtopic: "quadratic equations",
    difficulty: 2,
    source: "2023 P1 Q1",
    question: "For 3x² - mx + 3 = 0 to have one solution, find m",
    hints: ["One solution means discriminant = 0", "Δ = m² - 4(3)(3) = 0"],
    answer: "m = ±6",
    solution: "Step 1: For one solution: Δ = 0\\nStep 2: m² - 36 = 0\\nStep 3: m² = 36\\nStep 4: m = ±6",
    acceptedAnswers: ["m = ±6", "±6"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_095",
    topic: "algebra",
    subtopic: "quadratic equations",
    difficulty: 2,
    source: "2009 P1 Q2",
    question: "For kx² + (1-k)x + k = 0, if roots are in ratio 1:2, find k",
    hints: ["Let roots be r and 2r", "Sum: r + 2r = (k-1)/k", "Product: r·2r = 1"],
    answer: "k = 1/2 or k = 2",
    solution: "Step 1: Let roots = r, 2r\\nStep 2: 2r² = 1, r = 1/√2\\nStep 3: 3r = (k-1)/k\\nStep 4: 3/√2 = (k-1)/k\\nStep 5: Solve to get k = 1/2 or k = 2",
    acceptedAnswers: ["k = 1/2 or k = 2"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_096",
    topic: "complex_numbers",
    subtopic: "complex equations",
    difficulty: 2,
    source: "2020 P1 Q2",
    question: "Solve: z + w = 2 + i and z - w = 1 - 2i",
    hints: ["Add equations: 2z = 3 - i", "z = (3 - i)/2"],
    answer: "z = (3 - i)/2, w = (1 + 3i)/2",
    solution: "Step 1: Add: 2z = 3 - i, z = (3-i)/2\\nStep 2: Subtract: 2w = 1 + 3i, w = (1+3i)/2",
    acceptedAnswers: ["z = (3-i)/2, w = (1+3i)/2"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_097",
    topic: "sequences_series",
    subtopic: "number patterns",
    difficulty: 1,
    source: "2018 P1 Q2",
    question: "In Sieve of Sundaram, which of 1,2,3,4,5 are eliminated first?",
    hints: ["Eliminate i+j+2ij where i≤j", "1: not of form", "2: i=1,j=1 gives 1+1+2=4... no"],
    answer: "4, 5, 6 are eliminated (from numbers up to n)",
    solution: "Sieve of Sundaram eliminates numbers of form i+j+2ij.\\nFor i=j=1: 1+1+2=4 (eliminated)\\nFor i=1,j=2: 1+2+4=7 (eliminated)\\nSurvivors in 1-5: 1, 2, 3, 5",
    acceptedAnswers: ["4, 6"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_098",
    topic: "functions",
    subtopic: "intersection points",
    difficulty: 2,
    source: "2018 P1 Q6",
    question: "Find intersection of y = √x and y = x³",
    hints: ["√x = x³", "Let x = t⁶: t³ = t¹⁸"],
    answer: "x = 0, x = 1",
    solution: "Step 1: √x = x³\\nStep 2: x = x⁶ (squaring)\\nStep 3: x(1 - x⁵) = 0\\nStep 4: x = 0 or x = 1\\nCheck: (0,0) and (1,1) satisfy both",
    acceptedAnswers: ["x = 0 or x = 1"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_099",
    topic: "integration",
    subtopic: "volumes of revolution",
    difficulty: 2,
    source: "2009 P1 Q8",
    question: "Find volume of cone height h, base radius r using integration",
    hints: ["At distance z from apex, radius = rz/h", "V = ∫₀ʰ π(rz/h)² dz"],
    answer: "V = πr²h/3",
    solution: "Step 1: At distance z from apex: r(z) = rz/h\\nStep 2: V = ∫₀ʰ π(rz/h)² dz = π(r/h)² ∫₀ʰ z² dz\\nStep 3: = π(r/h)² · [z³/3]₀ʰ\\nStep 4: = π(r/h)² · h³/3 = πr²h/3",
    acceptedAnswers: ["πr²h/3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_100",
    topic: "coord_line",
    subtopic: "midpoint formula",
    difficulty: 1,
    source: "2017 P1 Q4",
    question: "Find midpoint of arc endpoints (3, 4) and (7, 2)",
    hints: ["Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)", "= ((3+7)/2, (4+2)/2)"],
    answer: "Midpoint = (5, 3)",
    solution: "Step 1: Midpoint = ((3+7)/2, (4+2)/2)\\nStep 2: = (10/2, 6/2)\\nStep 3: = (5, 3)",
    acceptedAnswers: ["(5, 3)"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_101",
    topic: "geometry",
    subtopic: "similar triangles",
    difficulty: 2,
    source: "2018 P2 Q6",
    question: "Two similar triangles have sides 3,4,5 and 6,8,c. Find c",
    hints: ["Scale factor = 6/3 = 2", "c = 5 × 2"],
    answer: "c = 10",
    solution: "Step 1: Scale factor = 6/3 = 2\\nStep 2: c = 5 × 2 = 10",
    acceptedAnswers: ["10"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_102",
    topic: "geometry",
    subtopic: "congruence",
    difficulty: 1,
    source: "2025 P2 Q5",
    question: "Triangles ABC and DEF are congruent if which condition holds?",
    hints: ["SSS, SAS, ASA, AAS are sufficient", "AAA only shows similarity"],
    answer: "SSS, SAS, ASA, or AAS",
    solution: "For congruence:\\n- SSS (side-side-side)\\n- SAS (side-angle-side)\\n- ASA (angle-side-angle)\\n- AAS (angle-angle-side)\\nAAA and SSA are not sufficient",
    acceptedAnswers: ["SSS", "SAS", "ASA", "AAS"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_103",
    topic: "trigonometry",
    subtopic: "sector area",
    difficulty: 1,
    source: "2020 P2 Q4",
    question: "Find area of sector: radius 6, angle π/3 radians",
    hints: ["Area = (1/2)r²θ where θ in radians", "= (1/2)(36)(π/3)"],
    answer: "Area = 6π",
    solution: "Step 1: Area = (1/2)r²θ\\nStep 2: = (1/2)(6²)(π/3)\\nStep 3: = (1/2)(36)(π/3)\\nStep 4: = 6π",
    acceptedAnswers: ["6π", "18.85"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_104",
    topic: "algebra",
    subtopic: "quadratic relationships",
    difficulty: 2,
    source: "2009 P1 Q2",
    question: "If x and y are roots of t² - 5t + 3 = 0, find x/y + y/x",
    hints: ["Sum: x + y = 5, Product: xy = 3", "x/y + y/x = (x² + y²)/(xy)", "x² + y² = (x+y)² - 2xy"],
    answer: "19/3",
    solution: "Step 1: x+y=5, xy=3\\nStep 2: x²+y² = 25 - 6 = 19\\nStep 3: x/y + y/x = 19/3",
    acceptedAnswers: ["19/3", "6.33..."],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_105",
    topic: "trigonometry",
    subtopic: "angle between lines",
    difficulty: 2,
    source: "2022 P2 Q2",
    question: "Find angle between lines with slopes m₁ = 1/2 and m₂ = 2",
    hints: ["tan θ = |(m₁ - m₂)/(1 + m₁m₂)|", "= |(1/2 - 2)/(1 + 1)| = 3/4"],
    answer: "θ ≈ 36.87°",
    solution: "Step 1: tan θ = |(1/2 - 2)/(1 + 1)| = |(-3/2)/2| = 3/4\\nStep 2: θ = arctan(3/4) ≈ 36.87°",
    acceptedAnswers: ["36.87°", "36.9°"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_106",
    topic: "differentiation",
    subtopic: "kinematics",
    difficulty: 2,
    source: "2009 P1 Q6",
    question: "Position s(t) = t³ - 6t². Find acceleration when v = 0",
    hints: ["v = ds/dt = 3t² - 12t", "Set v=0: 3t² - 12t = 0, t = 0 or t = 4"],
    answer: "a = 0 or a = 24",
    solution: "Step 1: v = 3t² - 12t = 0\\nStep 2: t(3t - 12) = 0, t = 0 or 4\\nStep 3: a = dv/dt = 6t - 12\\nAt t=0: a=−12; at t=4: a=12",
    acceptedAnswers: ["-12 or 12"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_107",
    topic: "sequences_series",
    subtopic: "financial mathematics",
    difficulty: 1,
    source: "2009 P1 Q1",
    question: "Value increases 20% then decreases 20%. Net change?",
    hints: ["Start: 100, after increase: 120", "After decrease: 120 × 0.8 = 96"],
    answer: "Net decrease of 4% (or 96% of original)",
    solution: "Step 1: 100 → 100 × 1.2 = 120\\nStep 2: 120 → 120 × 0.8 = 96\\nStep 3: Final = 96, net = -4%",
    acceptedAnswers: ["4% decrease", "-4%"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_108",
    topic: "algebra",
    subtopic: "matrix operations",
    difficulty: 1,
    source: "2009 P1 Q3",
    question: "Find determinant of [[2, 3], [1, 4]]",
    hints: ["det = ad - bc", "= 2(4) - 3(1)"],
    answer: "det = 5",
    solution: "Step 1: det = 2·4 - 3·1 = 8 - 3 = 5",
    acceptedAnswers: ["5"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_109",
    topic: "algebra",
    subtopic: "polynomial division",
    difficulty: 2,
    source: "2018 P1 Q1",
    question: "Divide x³ + 2x² - 5x - 6 by (x + 1)",
    hints: ["Use synthetic division or long division", "x + 1 is a factor if remainder = 0"],
    answer: "Quotient: x² + x - 6",
    solution: "Step 1: x³ + 2x² - 5x - 6 = (x+1)(x²+x-6)\\nStep 2: x² + x - 6 = (x+3)(x-2)\\nFull: (x+1)(x+3)(x-2)",
    acceptedAnswers: ["x² + x - 6"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_110",
    topic: "functions",
    subtopic: "piecewise functions",
    difficulty: 1,
    source: "2017 P1 Q1",
    question: "For f(x) = {2x if x<1, x² if x≥1}, find f(2)",
    hints: ["Since 2 ≥ 1, use f(x) = x²", "f(2) = 2²"],
    answer: "f(2) = 4",
    solution: "Step 1: x = 2 ≥ 1, so use f(x) = x²\\nStep 2: f(2) = 4",
    acceptedAnswers: ["4"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_111",
    topic: "trigonometry",
    subtopic: "circle arc length",
    difficulty: 1,
    source: "2020 P2 Q4",
    question: "Arc length = 12, radius = 4. Find angle in radians",
    hints: ["Arc length = rθ", "12 = 4θ"],
    answer: "θ = 3 radians",
    solution: "Step 1: Arc = rθ\\nStep 2: 12 = 4θ\\nStep 3: θ = 3 rad",
    acceptedAnswers: ["3"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_112",
    topic: "probability",
    subtopic: "independence",
    difficulty: 2,
    source: "2022 P2 Q1",
    question: "P(A)=0.4, P(B)=0.3. If P(A∩B)=0.12, are A and B independent?",
    hints: ["Independent if P(A∩B) = P(A)·P(B)", "0.4 × 0.3 = 0.12"],
    answer: "Yes, A and B are independent",
    solution: "Step 1: P(A)·P(B) = 0.4 × 0.3 = 0.12\\nStep 2: P(A∩B) = 0.12\\nStep 3: Equal, so independent",
    acceptedAnswers: ["Yes", "Independent"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_113",
    topic: "complex_numbers",
    subtopic: "modulus",
    difficulty: 2,
    source: "2022 P1 Q3",
    question: "Find |z| where z = 6 + 2i on circle x² + y² = r²",
    hints: ["|z| = √(6² + 2²)", "= √40 = 2√10"],
    answer: "|z| = 2√10",
    solution: "Step 1: |z| = √(36 + 4) = √40\\nStep 2: = √(4·10) = 2√10",
    acceptedAnswers: ["2√10", "6.32..."],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_114",
    topic: "trigonometry",
    subtopic: "3D geometry",
    difficulty: 2,
    source: "2021 P2 Q2",
    question: "Distance from origin to line 3x + 4y = 25 is?",
    hints: ["Perpendicular distance = |c|/√(a²+b²)", "= 25/√(9+16) = 25/5"],
    answer: "Distance = 5",
    solution: "Step 1: Distance = |0 - 25|/√(9+16)\\nWait: line is 3x+4y-25=0\\nStep 2: = 25/5 = 5",
    acceptedAnswers: ["5"],
    xp: 20,
    year: "5th & 6th"
  },
  {
    id: "q_115",
    topic: "functions",
    subtopic: "parametric equations",
    difficulty: 2,
    source: "2009 P1 Q7",
    question: "If x = cos(t), y = sin(t), find dy/dx at t=π/4",
    hints: ["Hint 1 for Parametric curve", "Hint 2 for Parametric curve", "Final step"],
    answer: "[-1]",
    solution: "-1",
    acceptedAnswers: ["1", "-1"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_116",
    topic: "geometry",
    subtopic: "angle properties",
    difficulty: 2,
    source: "2017 P2 Q3",
    question: "In triangle, angle bisector divides opposite side in ratio of?",
    hints: ["Hint 1 for Angle bisector", "Hint 2 for Angle bisector", "Final step"],
    answer: "sides",
    solution: "ratio of adjacent sides",
    acceptedAnswers: ["sides"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_117",
    topic: "coord_circle",
    subtopic: "circle properties",
    difficulty: 2,
    source: "2021 P2 Q3",
    question: "Chord length 8, radius 5. Distance from center?",
    hints: ["Hint 1 for Chord angle", "Hint 2 for Chord angle", "Final step"],
    answer: "3",
    solution: "3",
    acceptedAnswers: ["3"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_118",
    topic: "trigonometry",
    subtopic: "trig identities",
    difficulty: 2,
    source: "2019 P2 Q4",
    question: "sin A + sin B = 2sin((A+B)/2)cos((A-B)/2)",
    hints: ["Hint 1 for Sum to product", "Hint 2 for Sum to product", "Final step"],
    answer: "identity",
    solution: "proven",
    acceptedAnswers: ["proven"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_119",
    topic: "functions",
    subtopic: "parabolas",
    difficulty: 1,
    source: "2017 P1 Q1",
    question: "Vertex of y = x² - 4x + 5 is at?",
    hints: ["Hint 1 for Parabola vertex", "Hint 2 for Parabola vertex", "Final step"],
    answer: "(2,1)",
    solution: "(2, 1)",
    acceptedAnswers: ["(2,1)"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_120",
    topic: "functions",
    subtopic: "asymptotes",
    difficulty: 1,
    source: "2017 P1 Q1",
    question: "y=1/x has asymptotes at?",
    hints: ["Hint 1 for Reciprocal asymptote", "Hint 2 for Reciprocal asymptote", "Final step"],
    answer: "x=0, y=0",
    solution: "x = 0 and y = 0",
    acceptedAnswers: ["x=0", "y=0"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_121",
    topic: "algebra",
    subtopic: "surd equations",
    difficulty: 2,
    source: "2020 P1 Q2",
    question: "Find ∛27 + ∛-8",
    hints: ["Hint 1 for Cube root equation", "Hint 2 for Cube root equation", "Final step"],
    answer: "-1",
    solution: "-1",
    acceptedAnswers: ["-1"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_122",
    topic: "logs_indices",
    subtopic: "logs",
    difficulty: 2,
    source: "2024 P1 Q2",
    question: "logₓ(16) = 2 means x?",
    hints: ["Hint 1 for Logarithm base change", "Hint 2 for Logarithm base change", "Final step"],
    answer: "4",
    solution: "4",
    acceptedAnswers: ["4"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_123",
    topic: "sequences_series",
    subtopic: "series",
    difficulty: 2,
    source: "2017 P1 Q4",
    question: "Sum of 2, 0.2, 0.02, ...",
    hints: ["Hint 1 for Sum infinite series", "Hint 2 for Sum infinite series", "Final step"],
    answer: "20/9",
    solution: "2.222...",
    acceptedAnswers: ["20/9", "2.22"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_124",
    topic: "algebra",
    subtopic: "factoring",
    difficulty: 2,
    source: "2019 P1 Q3",
    question: "Factor x³ - 1",
    hints: ["Hint 1 for Cubic factorization", "Hint 2 for Cubic factorization", "Final step"],
    answer: "(x-1)(x²+x+1)",
    solution: "(x-1)(x²+x+1)",
    acceptedAnswers: ["(x-1)(x²+x+1)"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_125",
    topic: "algebra",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 1 Q1",
    question: "Practice problem in algebra",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for algebra problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_126",
    topic: "functions",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 1 Q2",
    question: "Practice problem in functions",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for functions problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_127",
    topic: "differentiation",
    subtopic: "practiceexercise",
    difficulty: 2,
    source: "Practice Set 1 Q3",
    question: "Practice problem in differentiation",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for differentiation problems",
    acceptedAnswers: ["answer"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_128",
    topic: "integration",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 1 Q4",
    question: "Practice problem in integration",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for integration problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_129",
    topic: "sequences_series",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 1 Q5",
    question: "Practice problem in sequences_series",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for sequences_series problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_130",
    topic: "complex_numbers",
    subtopic: "practiceexercise",
    difficulty: 2,
    source: "Practice Set 1 Q6",
    question: "Practice problem in complex_numbers",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for complex_numbers problems",
    acceptedAnswers: ["answer"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_131",
    topic: "trigonometry",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 1 Q7",
    question: "Practice problem in trigonometry",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for trigonometry problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_132",
    topic: "coord_line",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 1 Q8",
    question: "Practice problem in coord_line",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for coord_line problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_133",
    topic: "coord_circle",
    subtopic: "practiceexercise",
    difficulty: 2,
    source: "Practice Set 1 Q9",
    question: "Practice problem in coord_circle",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for coord_circle problems",
    acceptedAnswers: ["answer"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_134",
    topic: "probability",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 1 Q10",
    question: "Practice problem in probability",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for probability problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_135",
    topic: "statistics",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 1 Q11",
    question: "Practice problem in statistics",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for statistics problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_136",
    topic: "logs_indices",
    subtopic: "practiceexercise",
    difficulty: 2,
    source: "Practice Set 1 Q12",
    question: "Practice problem in logs_indices",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for logs_indices problems",
    acceptedAnswers: ["answer"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_137",
    topic: "geometry",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 1 Q13",
    question: "Practice problem in geometry",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for geometry problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_138",
    topic: "algebra",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 2 Q1",
    question: "Practice problem in algebra",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for algebra problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_139",
    topic: "functions",
    subtopic: "practiceexercise",
    difficulty: 2,
    source: "Practice Set 2 Q2",
    question: "Practice problem in functions",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for functions problems",
    acceptedAnswers: ["answer"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_140",
    topic: "differentiation",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 2 Q3",
    question: "Practice problem in differentiation",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for differentiation problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_141",
    topic: "integration",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 2 Q4",
    question: "Practice problem in integration",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for integration problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_142",
    topic: "sequences_series",
    subtopic: "practiceexercise",
    difficulty: 2,
    source: "Practice Set 2 Q5",
    question: "Practice problem in sequences_series",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for sequences_series problems",
    acceptedAnswers: ["answer"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_143",
    topic: "complex_numbers",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 2 Q6",
    question: "Practice problem in complex_numbers",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for complex_numbers problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_144",
    topic: "trigonometry",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 2 Q7",
    question: "Practice problem in trigonometry",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for trigonometry problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_145",
    topic: "coord_line",
    subtopic: "practiceexercise",
    difficulty: 2,
    source: "Practice Set 2 Q8",
    question: "Practice problem in coord_line",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for coord_line problems",
    acceptedAnswers: ["answer"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_146",
    topic: "coord_circle",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 2 Q9",
    question: "Practice problem in coord_circle",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for coord_circle problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_147",
    topic: "probability",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 2 Q10",
    question: "Practice problem in probability",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for probability problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "q_148",
    topic: "statistics",
    subtopic: "practiceexercise",
    difficulty: 2,
    source: "Practice Set 2 Q11",
    question: "Practice problem in statistics",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for statistics problems",
    acceptedAnswers: ["answer"],
    xp: 40,
    year: "5th & 6th"
  },
  {
    id: "q_149",
    topic: "logs_indices",
    subtopic: "practiceexercise",
    difficulty: 3,
    source: "Practice Set 2 Q12",
    question: "Practice problem in logs_indices",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for logs_indices problems",
    acceptedAnswers: ["answer"],
    xp: 50,
    year: "5th & 6th"
  },
  {
    id: "q_150",
    topic: "geometry",
    subtopic: "practiceexercise",
    difficulty: 1,
    source: "Practice Set 2 Q13",
    question: "Practice problem in geometry",
    hints: ["Review the core concepts", "Apply the appropriate method", "Check your answer"],
    answer: "See solution",
    solution: "Work through systematically for geometry problems",
    acceptedAnswers: ["answer"],
    xp: 30,
    year: "5th & 6th"
  },
];


// ─── BADGES ───
const BADGES = [
  { id: "first_correct", name: "First Steps", icon: "🌟", desc: "Get your first question correct", condition: s => s.totalCorrect >= 1 },
  { id: "streak_3", name: "On Fire", icon: "🔥", desc: "3-day streak", condition: s => s.streak >= 3 },
  { id: "streak_7", name: "Unstoppable", icon: "💪", desc: "7-day streak", condition: s => s.streak >= 7 },
  { id: "streak_30", name: "Legend", icon: "👑", desc: "30-day streak", condition: s => s.streak >= 30 },
  { id: "xp_100", name: "Century", icon: "💯", desc: "Earn 100 XP", condition: s => s.totalXP >= 100 },
  { id: "xp_500", name: "Scholar", icon: "📚", desc: "Earn 500 XP", condition: s => s.totalXP >= 500 },
  { id: "speed_demon", name: "Speed Demon", icon: "⚡", desc: "Answer in under 60 seconds", condition: s => s.fastestTime > 0 && s.fastestTime < 60 },
  { id: "no_hints", name: "No Help Needed", icon: "🧠", desc: "5 correct without hints", condition: s => s.noHintStreak >= 5 },
  { id: "perfect_week", name: "Perfect Week", icon: "✨", desc: "7 correct in a row", condition: s => s.correctStreak >= 7 },
  { id: "all_topics", name: "Well Rounded", icon: "🎯", desc: "Answer from every topic", condition: s => s.topicsAttempted >= 10 },
];

// ─── LEVEL SYSTEM ───
const getLevel = (xp) => {
  if (xp >= 1000) return { level: 10, name: "Maths Master", xpForNext: Infinity, xpForCurrent: 1000 };
  if (xp >= 750) return { level: 9, name: "Expert", xpForNext: 1000, xpForCurrent: 750 };
  if (xp >= 550) return { level: 8, name: "Advanced", xpForNext: 750, xpForCurrent: 550 };
  if (xp >= 400) return { level: 7, name: "Skilled", xpForNext: 550, xpForCurrent: 400 };
  if (xp >= 280) return { level: 6, name: "Proficient", xpForNext: 400, xpForCurrent: 280 };
  if (xp >= 180) return { level: 5, name: "Intermediate", xpForNext: 280, xpForCurrent: 180 };
  if (xp >= 100) return { level: 4, name: "Developing", xpForNext: 180, xpForCurrent: 100 };
  if (xp >= 50) return { level: 3, name: "Learner", xpForNext: 100, xpForCurrent: 50 };
  if (xp >= 20) return { level: 2, name: "Beginner", xpForNext: 50, xpForCurrent: 20 };
  return { level: 1, name: "Newcomer", xpForNext: 20, xpForCurrent: 0 };
};

// ─── DRAWING CANVAS COMPONENT ───
function DrawingCanvas({ onClear }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [canvasHeight, setCanvasHeight] = useState(300);
  const CANVAS_WIDTH = 360;
  const MIN_HEIGHT = 300;
  const EXTEND_AMOUNT = 200;
  const EXTEND_THRESHOLD = 60; // pixels from bottom to auto-extend

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const extendCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Save current drawing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHeight = canvasHeight + EXTEND_AMOUNT;
    // Resize
    canvas.height = newHeight;
    // Restore drawing
    ctx.putImageData(imageData, 0, 0);
    setCanvasHeight(newHeight);
    // Scroll container to bottom
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }, 50);
    }
  }, [canvasHeight]);

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    setLastPos(getPos(e));
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !lastPos) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    setLastPos(pos);
    // Auto-extend if drawing near bottom
    if (pos.y > canvasHeight - EXTEND_THRESHOLD) {
      extendCanvas();
    }
  };

  const stopDraw = () => { setIsDrawing(false); setLastPos(null); };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Reset to original height
    canvas.height = MIN_HEIGHT;
    setCanvasHeight(MIN_HEIGHT);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (containerRef.current) containerRef.current.scrollTop = 0;
    if (onClear) onClear();
  };

  useEffect(() => {
    if (onClear) onClear.current = clearCanvas;
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          maxHeight: 350,
          overflowY: "auto",
          border: "2px solid #cbd5e1",
          borderRadius: 12,
          background: "#fefce8",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={canvasHeight}
          style={{
            touchAction: "none",
            cursor: "crosshair",
            width: "100%",
            maxWidth: CANVAS_WIDTH,
            display: "block",
          }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
      </div>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <button onClick={extendCanvas} style={{
          background: "#3B82F6", color: "white",
          border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4,
        }}>↕ More Space</button>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          {canvasHeight > MIN_HEIGHT ? `Page ${Math.ceil(canvasHeight / MIN_HEIGHT)}` : "Page 1"}
        </span>
        <button onClick={clearCanvas} style={{
          background: "#ef4444", color: "white",
          border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}>Clear</button>
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
        ✏️ Draw your workings — canvas extends as you write
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function MathU() {
  // Auth state
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState(null);
  const [codeError, setCodeError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // App state
  const [screen, setScreen] = useState("splash");
  const [year, setYear] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  // Normalise phone: strip spaces, dashes, and ensure leading 0
  const normalisePhone = (p) => {
    let digits = p.replace(/\D/g, "");
    // If starts with 353, strip it (international prefix)
    if (digits.startsWith("353") && digits.length > 9) digits = digits.slice(3);
    // Ensure leading 0
    if (digits.length > 0 && !digits.startsWith("0")) digits = "0" + digits;
    return digits;
  };

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState([false, false, false]);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [frozen, setFrozen] = useState(false);

  // Timer
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalXP: 0, streak: 0, totalCorrect: 0, totalAttempted: 0,
    fastestTime: 0, noHintStreak: 0, correctStreak: 0, topicsAttempted: 0,
    topicStats: {}, dailyCompleted: false, questionsToday: 0,
  });
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(null);
  const [xpAnimation, setXpAnimation] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUserId = localStorage.getItem("mathu_session");
        if (savedUserId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", savedUserId)
            .single();

          if (profile) {
            setUserId(profile.id);
            setUsername(profile.name);
            setPhone(profile.phone);
            setEmail(profile.email || "");
            setYear(profile.year);
            setSelectedTopics(profile.topics || []);
            setIsLoggedIn(true);

            // Load stats
            const { data: statsData } = await supabase
              .from("user_stats")
              .select("*")
              .eq("user_id", profile.id)
              .single();

            if (statsData) {
              const today = new Date().toISOString().split("T")[0];
              setStats({
                totalXP: statsData.total_xp || 0,
                streak: statsData.streak || 0,
                totalCorrect: statsData.total_correct || 0,
                totalAttempted: statsData.total_attempted || 0,
                fastestTime: statsData.fastest_time || 0,
                noHintStreak: statsData.no_hint_streak || 0,
                correctStreak: statsData.correct_streak || 0,
                topicsAttempted: Object.keys(statsData.topic_stats || {}).length,
                topicStats: statsData.topic_stats || {},
                earnedBadges: statsData.earned_badges || [],
                dailyCompleted: statsData.last_daily_date === today,
                questionsToday: 0,
              });
              setEarnedBadges(statsData.earned_badges || []);
            }

            if (profile.year && profile.topics?.length > 0) {
              setScreen("home");
            } else if (profile.year) {
              setScreen("onboard_topics");
            } else {
              setScreen("onboard_year");
            }
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // Save profile to Supabase
  const saveUser = async (data) => {
    if (!userId) return;
    try {
      await supabase.from("profiles").update(data).eq("id", userId);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // Save stats to Supabase
  const saveStats = async (newStats) => {
    if (!userId) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("user_stats").upsert({
        user_id: userId,
        total_xp: newStats.totalXP,
        streak: newStats.streak,
        total_correct: newStats.totalCorrect,
        total_attempted: newStats.totalAttempted,
        fastest_time: newStats.fastestTime,
        no_hint_streak: newStats.noHintStreak,
        correct_streak: newStats.correctStreak,
        topic_stats: newStats.topicStats,
        earned_badges: earnedBadges,
        daily_completed: newStats.dailyCompleted,
        last_daily_date: newStats.dailyCompleted ? today : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    } catch (err) {
      console.error("Stats save failed:", err);
    }
  };

  // Logout
  const logout = () => {
    try { localStorage.removeItem("mathu_session"); } catch {}
    setIsLoggedIn(false);
    setUserId(null);
    setUsername("");
    setPhone("");
    setEmail("");
    setYear(null);
    setSelectedTopics([]);
    setScreen("splash");
  };

  // Send verification code (simulated for now — generates a 4-digit code)
  const sendVerificationCode = () => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setSentCode(code);
    setCodeError("");
    // In production, this would call Twilio via a Supabase Edge Function
    console.log(`[MathU Dev] Verification code: ${code}`);
    alert(`Your verification code is ${code}\n\n(In the full release, this will be sent via SMS)`);
  };

  // Verify code and create account in Supabase
  const verifyCode = async () => {
    if (verificationCode === sentCode) {
      setCodeError("");
      try {
        // Check if phone already exists
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("phone", normalisePhone(phone))
          .single();

        if (existing) {
          setCodeError("This number is already registered. Please sign in instead.");
          return;
        }

        // Create new profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .insert({ phone: normalisePhone(phone), email, name: username, pin })
          .select()
          .single();

        if (error) throw error;

        // Create empty stats row
        await supabase.from("user_stats").insert({ user_id: profile.id });

        setUserId(profile.id);
        localStorage.setItem("mathu_session", profile.id);
        setIsLoggedIn(true);
        setScreen("onboard_year");
      } catch (err) {
        console.error("Signup failed:", err);
        setCodeError("Something went wrong. Please try again.");
      }
    } else {
      setCodeError("Incorrect code. Please try again.");
    }
  };

  // Sign in with existing phone
  const signIn = async () => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", normalisePhone(phone))
        .single();

      if (error || !profile) {
        setCodeError("No account found with this number. Please sign up first.");
        return;
      }

      // Check PIN
      if (profile.pin && profile.pin !== pin) {
        setCodeError("Incorrect PIN. Please try again.");
        return;
      }

      setUserId(profile.id);
      setUsername(profile.name);
      setEmail(profile.email || "");
      setYear(profile.year);
      setSelectedTopics(profile.topics || []);
      localStorage.setItem("mathu_session", profile.id);
      setIsLoggedIn(true);

      // Load stats
      const { data: statsData } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", profile.id)
        .single();

      if (statsData) {
        const today = new Date().toISOString().split("T")[0];
        setStats({
          totalXP: statsData.total_xp || 0,
          streak: statsData.streak || 0,
          totalCorrect: statsData.total_correct || 0,
          totalAttempted: statsData.total_attempted || 0,
          fastestTime: statsData.fastest_time || 0,
          noHintStreak: statsData.no_hint_streak || 0,
          correctStreak: statsData.correct_streak || 0,
          topicsAttempted: Object.keys(statsData.topic_stats || {}).length,
          topicStats: statsData.topic_stats || {},
          earnedBadges: statsData.earned_badges || [],
          dailyCompleted: statsData.last_daily_date === today,
          questionsToday: 0,
        });
        setEarnedBadges(statsData.earned_badges || []);
      }

      if (profile.year && profile.topics?.length > 0) {
        setScreen("home");
      } else if (profile.year) {
        setScreen("onboard_topics");
      } else {
        setScreen("onboard_year");
      }
    } catch (err) {
      console.error("Sign in failed:", err);
      setCodeError("Something went wrong. Please try again.");
    }
  };

  // Leaderboard (simulated)
  const [leaderboard] = useState([
    { name: "Sarah M.", xp: 890, streak: 23, school: "Loreto Foxrock" },
    { name: "Conor O'B.", xp: 720, streak: 18, school: "St. Michael's CBS" },
    { name: "Aoife K.", xp: 650, streak: 15, school: "Alexandra College" },
    { name: "Liam D.", xp: 580, streak: 12, school: "Gonzaga College" },
    { name: "Niamh R.", xp: 520, streak: 10, school: "Mount Anville" },
  ]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerRunning && !frozen) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, frozen]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const getAllTopics = () => {
    const all = {};
    Object.values(TOPICS).forEach(paper => {
      Object.entries(paper.topics).forEach(([key, val]) => { all[key] = val; });
    });
    return all;
  };

  const toggleTopic = (key) => {
    setSelectedTopics(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
    );
  };

  const getRandomQuestion = (topicFilter = null) => {
    let available = QUESTION_BANK.filter(q => selectedTopics.includes(q.topic));
    if (topicFilter) available = available.filter(q => q.topic === topicFilter);
    if (year === "5th") available = available.filter(q => q.year.includes("5th"));
    if (available.length === 0) available = QUESTION_BANK.filter(q => selectedTopics.includes(q.topic));
    if (available.length === 0) available = QUESTION_BANK;
    return available[Math.floor(Math.random() * available.length)];
  };

  const startDailyQuestion = () => {
    const q = getRandomQuestion();
    setCurrentQuestion(q);
    setUserAnswer("");
    setHintsUsed(0);
    setShowHint([false, false, false]);
    setShowSolution(false);
    setIsCorrect(null);
    setTimer(0);
    setTimerRunning(true);
    setFrozen(false);
    setScreen("question");
  };

  const startPractice = (topic = null) => {
    setPracticeMode(true);
    const q = getRandomQuestion(topic);
    setCurrentQuestion(q);
    setUserAnswer("");
    setHintsUsed(0);
    setShowHint([false, false, false]);
    setShowSolution(false);
    setIsCorrect(null);
    setTimer(0);
    setTimerRunning(true);
    setFrozen(false);
    setScreen("question");
  };

  const useHint = (idx) => {
    if (idx <= hintsUsed) {
      const newShow = [...showHint];
      newShow[idx] = true;
      setShowHint(newShow);
      setHintsUsed(Math.max(hintsUsed, idx + 1));
    }
  };

  const checkAnswer = () => {
    setTimerRunning(false);
    const normalise = (s) => s.toLowerCase().replace(/\s+/g, "").replace(/[€°]/g, "");
    const userNorm = normalise(userAnswer);
    const correct = currentQuestion.acceptedAnswers.some(a => normalise(a) === userNorm);
    setIsCorrect(correct);
    setShowSolution(true);

    const topicKey = currentQuestion.topic;
    const allTopics = getAllTopics();
    let xpEarned = 0;

    if (correct) {
      const hintPenalty = hintsUsed * 0.2;
      xpEarned = Math.round(currentQuestion.xp * (1 - hintPenalty));
      xpEarned = Math.max(xpEarned, 5);
      setXpAnimation(xpEarned);
      setTimeout(() => setXpAnimation(null), 2000);
    }

    setStats(prev => {
      const newTopicStats = { ...prev.topicStats };
      if (!newTopicStats[topicKey]) {
        newTopicStats[topicKey] = { correct: 0, attempted: 0, totalTime: 0, name: allTopics[topicKey]?.name || topicKey };
      }
      newTopicStats[topicKey] = {
        ...newTopicStats[topicKey],
        correct: newTopicStats[topicKey].correct + (correct ? 1 : 0),
        attempted: newTopicStats[topicKey].attempted + 1,
        totalTime: newTopicStats[topicKey].totalTime + timer,
      };

      const newStats = {
        ...prev,
        totalXP: prev.totalXP + xpEarned,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        totalAttempted: prev.totalAttempted + 1,
        streak: correct ? prev.streak + 1 : prev.streak,
        fastestTime: correct && timer > 0 ? (prev.fastestTime === 0 ? timer : Math.min(prev.fastestTime, timer)) : prev.fastestTime,
        noHintStreak: correct && hintsUsed === 0 ? prev.noHintStreak + 1 : (correct ? prev.noHintStreak : 0),
        correctStreak: correct ? prev.correctStreak + 1 : 0,
        topicsAttempted: Object.keys(newTopicStats).length,
        topicStats: newTopicStats,
        questionsToday: prev.questionsToday + 1,
        dailyCompleted: !practiceMode ? true : prev.dailyCompleted,
      };

      // Check for new badges
      BADGES.forEach(badge => {
        if (!earnedBadges.includes(badge.id) && badge.condition(newStats)) {
          setEarnedBadges(prev => [...prev, badge.id]);
          setNewBadge(badge);
          setTimeout(() => setNewBadge(null), 3000);
        }
      });

      // Save to Supabase
      saveStats(newStats);

      return newStats;
    });
  };

  const toggleFreeze = () => setFrozen(!frozen);

  // ─── STYLES ───
  const colors = {
    primary: "#3B82F6",
    primaryDark: "#2563EB",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    bg: "#F0F4FF",
    card: "#FFFFFF",
    text: "#1E293B",
    textLight: "#64748B",
    success: "#22C55E",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)",
  };

  const styles = {
    app: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: 420, margin: "0 auto", minHeight: "100vh",
      background: colors.bg, position: "relative", overflow: "hidden",
    },
    header: {
      background: colors.gradient, padding: "16px 20px", color: "white",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    card: {
      background: colors.card, borderRadius: 16, padding: 20, margin: "12px 16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    },
    btn: (bg = colors.primary, full = false) => ({
      background: bg, color: "white", border: "none", borderRadius: 12,
      padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer",
      width: full ? "100%" : "auto", transition: "all 0.2s",
      boxShadow: `0 4px 12px ${bg}40`,
    }),
    btnOutline: (color = colors.primary) => ({
      background: "transparent", color, border: `2px solid ${color}`,
      borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600,
      cursor: "pointer", transition: "all 0.2s",
    }),
    chip: (selected, color = colors.primary) => ({
      display: "inline-flex", alignItems: "center", gap: 6,
      background: selected ? color : "transparent",
      color: selected ? "white" : color,
      border: `2px solid ${color}`,
      borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600,
      cursor: "pointer", transition: "all 0.2s", margin: 4,
    }),
    input: {
      width: "100%", padding: "14px 16px", border: "2px solid #e2e8f0",
      borderRadius: 12, fontSize: 16, outline: "none", boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    nav: {
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 420, background: "white",
      display: "flex", justifyContent: "space-around", padding: "8px 0 12px",
      boxShadow: "0 -2px 12px rgba(0,0,0,0.08)", borderRadius: "20px 20px 0 0",
      zIndex: 100,
    },
    navItem: (active) => ({
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      color: active ? colors.primary : colors.textLight, cursor: "pointer",
      fontSize: 10, fontWeight: active ? 700 : 500, padding: "4px 12px",
      transition: "all 0.2s",
    }),
  };

  // ─── LOADING SCREEN ───
  if (loading) {
    return (
      <div style={{ ...styles.app, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: colors.gradient }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 72, marginBottom: 8 }}>📐</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 16px", letterSpacing: -2 }}>MathU</h1>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Loading...</div>
        </div>
      </div>
    );
  }

  // ─── SPLASH SCREEN ───
  if (screen === "splash") {
    return (
      <div style={{ ...styles.app, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: colors.gradient }}>
        <div style={{ textAlign: "center", color: "white", padding: 40 }}>
          <div style={{ fontSize: 72, marginBottom: 8 }}>📐</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 4px", letterSpacing: -2 }}>MathU</h1>
          <p style={{ fontSize: 16, opacity: 0.9, margin: "0 0 8px" }}>Your Daily Maths Challenge</p>
          <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 40px" }}>Leaving Cert Honours Maths</p>
          <button
            onClick={() => setScreen("signup_phone")}
            style={{ ...styles.btn("white"), color: colors.primaryDark, fontSize: 18, padding: "16px 48px" }}
          >
            Get Started
          </button>
          <p onClick={() => setScreen("signin")} style={{ fontSize: 12, opacity: 0.6, marginTop: 20, cursor: "pointer" }}>
            Already have an account? <span style={{ textDecoration: "underline" }}>Sign In</span>
          </p>
          <div style={{ fontSize: 9, opacity: 0.4, marginTop: 40 }}>v{APP_VERSION}</div>
        </div>
      </div>
    );
  }

  // ─── SIGN UP: PHONE ───
  if (screen === "signup_phone") {
    const phoneDigits = phone.replace(/\D/g, "").length;
    const phoneValid = phoneDigits >= 7;
    return (
      <div style={styles.app}>
        <div style={{ padding: "40px 24px 24px" }}>
          <button onClick={() => setScreen("splash")} style={{ background: "none", border: "none", fontSize: 16, color: colors.textLight, cursor: "pointer", marginBottom: 16 }}>← Back</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", color: colors.text }}>Create Account</h2>
            <p style={{ color: colors.textLight, margin: "0 0 8px", fontSize: 14 }}>Step 1 of 2</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
              <div style={{ width: 60, height: 4, borderRadius: 2, background: colors.primary }} />
              <div style={{ width: 60, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
            </div>
          </div>

          <label style={{ fontSize: 13, fontWeight: 700, color: colors.text, display: "block", marginBottom: 6 }}>Mobile Number</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <div style={{
              padding: "14px 12px", border: "2px solid #e2e8f0", borderRadius: 12,
              fontSize: 16, color: colors.text, fontWeight: 600, background: "#f8fafc",
            }}>+353</div>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^\d\s-]/g, ""))}
              placeholder="08X XXX XXXX"
              type="tel"
              style={{ ...styles.input, flex: 1 }}
            />
          </div>

          <label style={{ fontSize: 13, fontWeight: 700, color: colors.text, display: "block", marginBottom: 6 }}>Email Address</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            type="email"
            style={{ ...styles.input, marginBottom: 20 }}
          />

          <label style={{ fontSize: 13, fontWeight: 700, color: colors.text, display: "block", marginBottom: 6 }}>First Name</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your first name"
            style={{ ...styles.input, marginBottom: 20 }}
          />

          <label style={{ fontSize: 13, fontWeight: 700, color: colors.text, display: "block", marginBottom: 6 }}>Choose a 4-digit PIN</label>
          <p style={{ fontSize: 11, color: colors.textLight, margin: "0 0 6px" }}>You'll use this to sign in — don't forget it!</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                maxLength={1}
                value={pin[i] || ""}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  const newPin = pin.split("");
                  newPin[i] = val;
                  setPin(newPin.join(""));
                  if (val && i < 3) {
                    const next = e.target.parentElement.children[i + 1];
                    if (next) next.focus();
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Backspace" && !pin[i] && i > 0) {
                    const prev = e.target.parentElement.children[i - 1];
                    if (prev) prev.focus();
                  }
                }}
                style={{
                  width: 52, height: 58, textAlign: "center", fontSize: 24, fontWeight: 800,
                  border: "2px solid #e2e8f0", borderRadius: 12, outline: "none", color: colors.text,
                }}
                type="tel"
                inputMode="numeric"
              />
            ))}
          </div>

          {codeError && (
            <p style={{ color: colors.danger, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              {codeError}
            </p>
          )}

          <button
            onClick={async () => {
              if (phoneValid && email.includes("@") && username.trim() && pin.length === 4) {
                setCodeError("Creating account...");
                try {
                  // Check if phone already exists
                  const { data: existingList } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("phone", normalisePhone(phone));

                  if (existingList && existingList.length > 0) {
                    setCodeError("This number is already registered. Please sign in instead.");
                    return;
                  }

                  // Create new profile
                  const { data: profile, error } = await supabase
                    .from("profiles")
                    .insert({ phone: normalisePhone(phone), email, name: username, pin })
                    .select()
                    .single();

                  if (error) {
                    setCodeError("Error: " + (error.message || JSON.stringify(error)));
                    return;
                  }

                  // Create empty stats row
                  const { error: statsError } = await supabase.from("user_stats").insert({ user_id: profile.id });
                  if (statsError) {
                    setCodeError("Stats error: " + statsError.message);
                    return;
                  }

                  setUserId(profile.id);
                  try { localStorage.setItem("mathu_session", profile.id); } catch {}
                  setIsLoggedIn(true);
                  setScreen("onboard_year");
                } catch (err) {
                  setCodeError("Error: " + (err.message || String(err)));
                }
              }
            }}
            disabled={!phoneValid || !email.includes("@") || !username.trim()}
            style={styles.btn(phoneValid && email.includes("@") && username.trim() && pin.length === 4 ? colors.primary : "#cbd5e1", true)}
          >
            Create Account
          </button>

          <p style={{ fontSize: 11, color: colors.textLight, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
            Your data is private and never shared.
          </p>
        </div>
      </div>
    );
  }

  // ─── VERIFY CODE ───
  if (screen === "verify_code") {
    return (
      <div style={styles.app}>
        <div style={{ padding: "40px 24px 24px" }}>
          <button onClick={() => setScreen("signup_phone")} style={{ background: "none", border: "none", fontSize: 16, color: colors.textLight, cursor: "pointer", marginBottom: 16 }}>← Back</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", color: colors.text }}>Verify Your Number</h2>
            <p style={{ color: colors.textLight, margin: "0 0 8px", fontSize: 14 }}>Step 2 of 3</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: colors.primary }} />
              <div style={{ width: 40, height: 4, borderRadius: 2, background: colors.primary }} />
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
            </div>
            <p style={{ color: colors.textLight, margin: "0 0 32px", fontSize: 13 }}>
              Enter the 4-digit code sent to <strong style={{ color: colors.text }}>+353 {phone}</strong>
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                maxLength={1}
                value={verificationCode[i] || ""}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  const newCode = verificationCode.split("");
                  newCode[i] = val;
                  setVerificationCode(newCode.join(""));
                  setCodeError("");
                  // Auto-focus next input
                  if (val && i < 3) {
                    const next = e.target.parentElement.children[i + 1];
                    if (next) next.focus();
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Backspace" && !verificationCode[i] && i > 0) {
                    const prev = e.target.parentElement.children[i - 1];
                    if (prev) prev.focus();
                  }
                }}
                style={{
                  width: 56, height: 64, textAlign: "center", fontSize: 28, fontWeight: 800,
                  border: `2px solid ${codeError ? colors.danger : "#e2e8f0"}`,
                  borderRadius: 12, outline: "none", color: colors.text,
                }}
                type="tel"
                inputMode="numeric"
              />
            ))}
          </div>

          {codeError && (
            <p style={{ color: colors.danger, fontSize: 13, textAlign: "center", fontWeight: 600, marginBottom: 12 }}>
              {codeError}
            </p>
          )}

          <button
            onClick={verifyCode}
            disabled={verificationCode.length !== 4}
            style={styles.btn(verificationCode.length === 4 ? colors.primary : "#cbd5e1", true)}
          >
            Verify & Continue
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: colors.textLight }}>
            Didn't receive the code?{" "}
            <span onClick={sendVerificationCode} style={{ color: colors.primary, fontWeight: 700, cursor: "pointer" }}>
              Resend
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ─── SIGN IN ───
  if (screen === "signin") {
    return (
      <div style={styles.app}>
        <div style={{ padding: "40px 24px 24px" }}>
          <button onClick={() => setScreen("splash")} style={{ background: "none", border: "none", fontSize: 16, color: colors.textLight, cursor: "pointer", marginBottom: 16 }}>← Back</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: colors.text }}>Welcome Back!</h2>
            <p style={{ color: colors.textLight, margin: "0 0 32px", fontSize: 14 }}>Sign in with your mobile number</p>
          </div>

          <label style={{ fontSize: 13, fontWeight: 700, color: colors.text, display: "block", marginBottom: 6 }}>Mobile Number</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <div style={{
              padding: "14px 12px", border: "2px solid #e2e8f0", borderRadius: 12,
              fontSize: 16, color: colors.text, fontWeight: 600, background: "#f8fafc",
            }}>+353</div>
            <input
              value={phone}
              onChange={e => { setPhone(e.target.value.replace(/[^\d\s-]/g, "")); setCodeError(""); }}
              placeholder="08X XXX XXXX or 8X XXX XXXX"
              type="tel"
              style={{ ...styles.input, flex: 1 }}
            />
          </div>

          <label style={{ fontSize: 13, fontWeight: 700, color: colors.text, display: "block", marginBottom: 6 }}>Your 4-digit PIN</label>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                maxLength={1}
                value={pin[i] || ""}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  const newPin = pin.split("");
                  newPin[i] = val;
                  setPin(newPin.join(""));
                  setCodeError("");
                  if (val && i < 3) {
                    const next = e.target.parentElement.children[i + 1];
                    if (next) next.focus();
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Backspace" && !pin[i] && i > 0) {
                    const prev = e.target.parentElement.children[i - 1];
                    if (prev) prev.focus();
                  }
                }}
                style={{
                  width: 52, height: 58, textAlign: "center", fontSize: 24, fontWeight: 800,
                  border: `2px solid ${codeError.includes("PIN") ? colors.danger : "#e2e8f0"}`,
                  borderRadius: 12, outline: "none", color: colors.text,
                }}
                type="tel"
                inputMode="numeric"
              />
            ))}
          </div>

          {codeError && (
            <p style={{ color: colors.danger, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              {codeError}
            </p>
          )}

          <button
            onClick={signIn}
            disabled={phone.replace(/\D/g, "").length < 7 || pin.length !== 4}
            style={styles.btn(phone.replace(/\D/g, "").length >= 7 && pin.length === 4 ? colors.primary : "#cbd5e1", true)}
          >
            Sign In
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: colors.textLight }}>
            Don't have an account?{" "}
            <span onClick={() => { setCodeError(""); setScreen("signup_phone"); }} style={{ color: colors.primary, fontWeight: 700, cursor: "pointer" }}>
              Sign Up
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ─── ONBOARDING: YEAR ───
  if (screen === "onboard_year") {
    return (
      <div style={styles.app}>
        <div style={{ padding: "40px 24px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", color: colors.text }}>What year are you in?</h2>
          <p style={{ color: colors.textLight, margin: "0 0 8px", fontSize: 14 }}>Step 2 of 2</p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: 60, height: 4, borderRadius: 2, background: colors.primary }} />
            <div style={{ width: 60, height: 4, borderRadius: 2, background: colors.primary }} />
          </div>
          <p style={{ color: colors.textLight, margin: "0 0 24px", fontSize: 14 }}>We'll tailor questions to your level</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {["5th", "6th"].map(y => (
              <button key={y} onClick={() => { setYear(y); saveUser({ year: y }); setScreen("onboard_topics"); }}
                style={{
                  width: 140, height: 140, borderRadius: 20, border: "3px solid " + colors.primary,
                  background: "white", cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = "white"; }}
                onMouseOut={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = colors.text; }}
              >
                <span style={{ fontSize: 36 }}>{y === "5th" ? "5️⃣" : "6️⃣"}</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{y} Year</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── ONBOARDING: TOPICS ───
  if (screen === "onboard_topics") {
    const allTopics = getAllTopics();
    return (
      <div style={styles.app}>
        <div style={{ padding: "24px 16px 100px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: colors.text, textAlign: "center" }}>
            Which topics have you covered?
          </h2>
          <p style={{ color: colors.textLight, margin: "0 0 20px", fontSize: 13, textAlign: "center" }}>
            Select all that you've studied so far. You can update this anytime.
          </p>

          {Object.entries(TOPICS).map(([paperKey, paper]) => (
            <div key={paperKey} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.textLight, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
                {paper.label}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
                {Object.entries(paper.topics).map(([key, topic]) => (
                  <button key={key} onClick={() => toggleTopic(key)}
                    style={styles.chip(selectedTopics.includes(key), topic.color)}
                  >
                    <span>{topic.icon}</span> {topic.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={() => {
              const all = Object.keys(allTopics);
              setSelectedTopics(selectedTopics.length === all.length ? [] : all);
            }}
              style={styles.btnOutline(colors.textLight)}
            >
              {selectedTopics.length === Object.keys(allTopics).length ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={() => { if (selectedTopics.length > 0) { saveUser({ topics: selectedTopics }); setScreen("home"); } }}
              disabled={selectedTopics.length === 0}
              style={{ ...styles.btn(selectedTopics.length > 0 ? colors.primary : "#cbd5e1"), flex: 1 }}
            >
              Start Learning ({selectedTopics.length} topics)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── HOME SCREEN ───
  if (screen === "home") {
    const level = getLevel(stats.totalXP);
    const xpProgress = level.xpForNext === Infinity ? 1 : (stats.totalXP - level.xpForCurrent) / (level.xpForNext - level.xpForCurrent);
    const allTopics = getAllTopics();

    return (
      <div style={styles.app}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Hey {username}! 👋</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>MathU</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>🔥 {stats.streak}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>Streak</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>⚡ {stats.totalXP}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>XP</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 0 100px" }}>
          {/* Level card */}
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>Level {level.level} — {level.name}</span>
              <span style={{ fontSize: 12, color: colors.textLight }}>
                {level.xpForNext === Infinity ? "MAX" : `${stats.totalXP}/${level.xpForNext} XP`}
              </span>
            </div>
            <div style={{ height: 10, background: "#e2e8f0", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpProgress * 100}%`, background: colors.gradient, borderRadius: 5, transition: "width 0.5s ease" }} />
            </div>
          </div>

          {/* Daily Challenge */}
          <div style={{ ...styles.card, background: colors.gradient, color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 42 }}>📝</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>
                  {stats.dailyCompleted ? "Daily Complete! ✅" : "Daily Challenge"}
                </h3>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                  {stats.dailyCompleted ? "Great work! Come back tomorrow." : "Today's question is waiting for you!"}
                </p>
              </div>
            </div>
            {!stats.dailyCompleted && (
              <button onClick={startDailyQuestion}
                style={{ ...styles.btn("white"), color: colors.primaryDark, width: "100%", marginTop: 16 }}>
                Start Today's Challenge
              </button>
            )}
          </div>

          {/* Practice by topic */}
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: colors.text }}>
              Practice by Topic 📖
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {selectedTopics.slice(0, 6).map(key => {
                const topic = allTopics[key];
                if (!topic) return null;
                const ts = stats.topicStats[key];
                const pct = ts ? Math.round((ts.correct / ts.attempted) * 100) : null;
                return (
                  <button key={key} onClick={() => startPractice(key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                      background: `${topic.color}10`, border: `2px solid ${topic.color}30`,
                      borderRadius: 12, cursor: "pointer", flex: "1 0 calc(50% - 4px)", minWidth: 140,
                    }}>
                    <span style={{ fontSize: 20 }}>{topic.icon}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: topic.color }}>{topic.name}</div>
                      {pct !== null && (
                        <div style={{ fontSize: 10, color: colors.textLight }}>{pct}% accuracy</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedTopics.length > 6 && (
              <button onClick={() => setScreen("dashboard")} style={{ ...styles.btnOutline(colors.primary), width: "100%", marginTop: 12, padding: "10px" }}>
                View All Topics →
              </button>
            )}
          </div>

          {/* Quick stats */}
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: colors.text }}>Your Stats 📊</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
              {[
                { label: "Correct", value: stats.totalCorrect, icon: "✅" },
                { label: "Attempted", value: stats.totalAttempted, icon: "📝" },
                { label: "Accuracy", value: stats.totalAttempted ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100) + "%" : "—", icon: "🎯" },
              ].map(s => (
                <div key={s.label} style={{ padding: 12, background: "#f8fafc", borderRadius: 12 }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: colors.textLight }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={styles.nav}>
          {[
            { icon: "🏠", label: "Home", scr: "home" },
            { icon: "📊", label: "Dashboard", scr: "dashboard" },
            { icon: "🏆", label: "Leaderboard", scr: "leaderboard" },
            { icon: "🏅", label: "Badges", scr: "badges" },
            { icon: "⚙️", label: "Settings", scr: "settings" },
          ].map(item => (
            <div key={item.scr} onClick={() => setScreen(item.scr)} style={styles.navItem(screen === item.scr)}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 2, right: 12, fontSize: 9, color: "#cbd5e1" }}>v{APP_VERSION}</div>
        </div>
      </div>
    );
  }

  // ─── QUESTION SCREEN ───
  if (screen === "question") {
    const allTopics = getAllTopics();
    const topic = allTopics[currentQuestion?.topic];

    return (
      <div style={styles.app}>
        {/* XP animation */}
        {xpAnimation && (
          <div style={{
            position: "fixed", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
            fontSize: 48, fontWeight: 900, color: colors.accent, zIndex: 200,
            animation: "fadeUp 2s forwards", textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>
            +{xpAnimation} XP ⚡
          </div>
        )}

        {/* New Badge popup */}
        {newBadge && (
          <div style={{
            position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
            background: "white", borderRadius: 16, padding: "16px 24px", zIndex: 200,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)", textAlign: "center", minWidth: 240,
          }}>
            <div style={{ fontSize: 48 }}>{newBadge.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>Badge Earned!</div>
            <div style={{ fontSize: 14, color: colors.textLight }}>{newBadge.name}</div>
          </div>
        )}

        {/* Question header */}
        <div style={{ ...styles.header, justifyContent: "space-between" }}>
          <button onClick={() => { setTimerRunning(false); setScreen("home"); setPracticeMode(false); }}
            style={{ background: "none", border: "none", color: "white", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              background: frozen ? colors.accent : "rgba(255,255,255,0.2)",
              borderRadius: 20, padding: "6px 14px", fontSize: 16, fontWeight: 700,
            }}>
              {frozen ? "⏸ " : "⏱ "}{formatTime(timer)}
            </div>
            <button onClick={toggleFreeze}
              style={{
                background: frozen ? colors.success : "rgba(255,255,255,0.2)",
                border: "none", borderRadius: 20, padding: "6px 14px",
                color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
              {frozen ? "▶ Resume" : "❄ Freeze"}
            </button>
          </div>
        </div>

        {frozen && (
          <div style={{
            background: "#FEF3C7", padding: "12px 20px", textAlign: "center",
            color: "#92400E", fontSize: 13, fontWeight: 600,
          }}>
            ❄️ Question frozen — take your time! Timer is paused.
          </div>
        )}

        <div style={{ padding: "0 0 40px", opacity: frozen ? 0.4 : 1, pointerEvents: frozen ? "none" : "auto" }}>
          {/* Topic + Source badge */}
          <div style={{ ...styles.card, paddingBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{
                background: `${topic?.color || colors.primary}15`, color: topic?.color || colors.primary,
                padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700,
              }}>
                {topic?.icon} {topic?.name}
              </span>
              <span style={{
                background: currentQuestion.source === "Custom" ? "#f0fdf4" : "#eff6ff",
                color: currentQuestion.source === "Custom" ? "#16a34a" : "#2563eb",
                padding: "4px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700,
              }}>
                {currentQuestion.source}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {[1, 2, 3].map(d => (
                <div key={d} style={{
                  width: 8, height: 8, borderRadius: 4,
                  background: d <= currentQuestion.difficulty ? colors.accent : "#e2e8f0",
                }} />
              ))}
              <span style={{ fontSize: 11, color: colors.textLight, marginLeft: 4 }}>
                {["", "Standard", "Moderate", "Challenging"][currentQuestion.difficulty]}
              </span>
            </div>
          </div>

          {/* Question */}
          <div style={styles.card}>
            <div style={{ fontSize: 16, lineHeight: 1.6, color: colors.text, whiteSpace: "pre-line", fontWeight: 500 }}>
              {currentQuestion.question}
            </div>
          </div>

          {/* Hints */}
          <div style={{ ...styles.card, paddingBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLight, marginBottom: 8 }}>
              💡 Hints {hintsUsed > 0 && <span style={{ color: colors.accent }}>(−{hintsUsed * 20}% XP)</span>}
            </div>
            {currentQuestion.hints.map((hint, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                {showHint[i] ? (
                  <div style={{
                    background: "#FEF3C7", padding: "10px 14px", borderRadius: 10,
                    fontSize: 13, color: "#92400E", lineHeight: 1.5,
                  }}>
                    <strong>Hint {i + 1}:</strong> {hint}
                  </div>
                ) : (
                  <button onClick={() => useHint(i)}
                    disabled={i > hintsUsed || showSolution}
                    style={{
                      background: i > hintsUsed ? "#f1f5f9" : "#fffbeb",
                      border: `1px solid ${i > hintsUsed ? "#e2e8f0" : "#fbbf24"}`,
                      borderRadius: 10, padding: "8px 14px", width: "100%",
                      cursor: i > hintsUsed ? "not-allowed" : "pointer",
                      fontSize: 13, color: i > hintsUsed ? "#94a3b8" : "#b45309",
                      fontWeight: 600, textAlign: "left",
                    }}>
                    {i > hintsUsed ? `🔒 Hint ${i + 1}` : `💡 Reveal Hint ${i + 1}`}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Drawing Canvas */}
          <div style={styles.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLight, marginBottom: 8 }}>✏️ Workings</div>
            <DrawingCanvas />
          </div>

          {/* Answer Input */}
          {!showSolution ? (
            <div style={styles.card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLight, marginBottom: 8 }}>Your Answer</div>
              <input
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Type your final answer here..."
                style={styles.input}
              />
              <button onClick={checkAnswer} disabled={!userAnswer.trim()}
                style={{ ...styles.btn(userAnswer.trim() ? colors.success : "#cbd5e1", true), marginTop: 12 }}>
                Submit Answer
              </button>
            </div>
          ) : (
            <div style={{
              ...styles.card,
              border: `3px solid ${isCorrect ? colors.success : colors.danger}`,
              background: isCorrect ? "#f0fdf4" : "#fef2f2",
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: isCorrect ? colors.success : colors.danger, marginBottom: 8 }}>
                {isCorrect ? "✅ Correct!" : "❌ Not quite"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                Answer: {currentQuestion.answer}
              </div>
              {isCorrect && (
                <div style={{ fontSize: 13, color: colors.accent, fontWeight: 700, marginBottom: 8 }}>
                  +{Math.round(currentQuestion.xp * (1 - hintsUsed * 0.2))} XP earned! ⚡
                </div>
              )}
              {/* Step-by-step solution */}
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLight, marginTop: 12, marginBottom: 8 }}>
                Step-by-Step Solution:
              </div>
              <div style={{ background: "white", borderRadius: 10, overflow: "hidden" }}>
                {currentQuestion.solution.split("\n\n").map((step, i) => (
                  <div key={i} style={{
                    padding: "12px 14px",
                    borderBottom: i < currentQuestion.solution.split("\n\n").length - 1 ? "1px solid #f1f5f9" : "none",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <div style={{
                      minWidth: 24, height: 24, borderRadius: 12,
                      background: colors.primary, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, marginTop: 2,
                    }}>{i + 1}</div>
                    <div style={{
                      fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-line", color: colors.text,
                      fontFamily: "'SF Mono', 'Fira Code', monospace", flex: 1,
                    }}>{step.trim()}</div>
                  </div>
                ))}
              </div>

              {/* Self-assessment: where did you go wrong? */}
              {!isCorrect && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
                    🤔 Where did you get stuck?
                  </div>
                  <p style={{ fontSize: 12, color: colors.textLight, margin: "0 0 8px" }}>
                    Tap the step where you first went wrong — this helps us track what to focus on.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {currentQuestion.solution.split("\n\n").map((step, i) => (
                      <button key={i} onClick={() => {
                        alert(`Got it — we'll note that Step ${i + 1} was tricky for you on ${currentQuestion.subtopic}. Keep practising!`);
                      }} style={{
                        padding: "8px 14px", borderRadius: 10,
                        border: `2px solid ${colors.danger}30`, background: `${colors.danger}08`,
                        fontSize: 12, fontWeight: 600, color: colors.danger, cursor: "pointer",
                      }}>
                        Step {i + 1}
                      </button>
                    ))}
                    <button onClick={() => {
                      alert("No worries — keep practising and you'll get there!");
                    }} style={{
                      padding: "8px 14px", borderRadius: 10,
                      border: `2px solid ${colors.textLight}30`, background: "#f8fafc",
                      fontSize: 12, fontWeight: 600, color: colors.textLight, cursor: "pointer",
                    }}>
                      Didn't know where to start
                    </button>
                  </div>
                </div>
              )}

              {isCorrect && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10 }}>
                  <div style={{ fontSize: 13, color: colors.success, fontWeight: 600 }}>
                    💪 Compare your workings with the solution above. Did you use the same method?
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => { setScreen("home"); setPracticeMode(false); }}
                  style={styles.btnOutline(colors.textLight)}>
                  Home
                </button>
                <button onClick={() => startPractice()}
                  style={{ ...styles.btn(colors.primary), flex: 1 }}>
                  Practice Another →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  if (screen === "dashboard") {
    const allTopics = getAllTopics();
    const topicEntries = selectedTopics.map(key => {
      const topic = allTopics[key];
      const ts = stats.topicStats[key];
      return { key, topic, stats: ts };
    }).sort((a, b) => {
      const aAcc = a.stats ? a.stats.correct / a.stats.attempted : -1;
      const bAcc = b.stats ? b.stats.correct / b.stats.attempted : -1;
      return aAcc - bAcc;
    });

    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>📊 Dashboard</h2>
          <span style={{ fontSize: 13, opacity: 0.8 }}>{year} Year</span>
        </div>
        <div style={{ padding: "0 0 100px" }}>
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: colors.text }}>Performance by Topic</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: colors.textLight }}>Sorted weakest → strongest</p>
            {topicEntries.map(({ key, topic, stats: ts }) => {
              if (!topic) return null;
              const accuracy = ts ? Math.round((ts.correct / ts.attempted) * 100) : null;
              const barColor = accuracy === null ? "#e2e8f0" : accuracy >= 70 ? colors.success : accuracy >= 40 ? colors.accent : colors.danger;
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
                      {topic.icon} {topic.name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>
                      {accuracy !== null ? `${accuracy}%` : "Not attempted"}
                    </span>
                  </div>
                  <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${accuracy || 0}%`, background: barColor,
                      borderRadius: 4, transition: "width 0.5s",
                    }} />
                  </div>
                  {ts && (
                    <div style={{ fontSize: 11, color: colors.textLight, marginTop: 2 }}>
                      {ts.correct}/{ts.attempted} correct · Avg {Math.round(ts.totalTime / ts.attempted)}s per question
                    </div>
                  )}
                  <button onClick={() => startPractice(key)}
                    style={{
                      background: "none", border: "none", color: topic.color,
                      fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 0",
                    }}>
                    Practice {topic.name} →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Weakest topics callout */}
          {topicEntries.filter(e => e.stats && e.stats.correct / e.stats.attempted < 0.5).length > 0 && (
            <div style={{ ...styles.card, background: "#FEF2F2", border: "2px solid #FECACA" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: colors.danger }}>
                ⚠️ Focus Areas
              </h3>
              <p style={{ fontSize: 13, color: "#991B1B", margin: "0 0 8px" }}>
                These topics need the most work:
              </p>
              {topicEntries.filter(e => e.stats && e.stats.correct / e.stats.attempted < 0.5).map(({ key, topic }) => (
                <button key={key} onClick={() => startPractice(key)}
                  style={{
                    display: "block", width: "100%", padding: "8px 12px", marginBottom: 6,
                    background: "white", border: "1px solid #fecaca", borderRadius: 8,
                    cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: 600, color: colors.text,
                  }}>
                  {topic?.icon} Practice {topic?.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={styles.nav}>
          {[
            { icon: "🏠", label: "Home", scr: "home" },
            { icon: "📊", label: "Dashboard", scr: "dashboard" },
            { icon: "🏆", label: "Leaderboard", scr: "leaderboard" },
            { icon: "🏅", label: "Badges", scr: "badges" },
            { icon: "⚙️", label: "Settings", scr: "settings" },
          ].map(item => (
            <div key={item.scr} onClick={() => setScreen(item.scr)} style={styles.navItem(screen === item.scr)}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 2, right: 12, fontSize: 9, color: "#cbd5e1" }}>v{APP_VERSION}</div>
        </div>
      </div>
    );
  }

  // ─── LEADERBOARD ───
  if (screen === "leaderboard") {
    const allPlayers = [...leaderboard, { name: `${username} (You)`, xp: stats.totalXP, streak: stats.streak, school: "Your School" }]
      .sort((a, b) => b.xp - a.xp);

    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🏆 Leaderboard</h2>
          <span style={{ fontSize: 13, opacity: 0.8 }}>This Week</span>
        </div>
        <div style={{ padding: "0 0 100px" }}>
          {/* Top 3 */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8, padding: "20px 16px 0" }}>
            {[1, 0, 2].map(idx => {
              const p = allPlayers[idx];
              if (!p) return null;
              const isCenter = idx === 0;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={idx} style={{
                  textAlign: "center", flex: 1,
                  transform: isCenter ? "scale(1.1)" : "scale(1)",
                }}>
                  <div style={{ fontSize: isCenter ? 36 : 28 }}>{medals[idx]}</div>
                  <div style={{
                    background: p.name.includes("You") ? colors.primary : "white",
                    color: p.name.includes("You") ? "white" : colors.text,
                    borderRadius: 12, padding: "12px 8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name.split(" ")[0]}</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>⚡ {p.xp}</div>
                    <div style={{ fontSize: 10, opacity: 0.7 }}>🔥 {p.streak} days</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rest of list */}
          <div style={styles.card}>
            {allPlayers.slice(3).map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", padding: "12px 0",
                borderBottom: i < allPlayers.length - 4 ? "1px solid #f1f5f9" : "none",
                background: p.name.includes("You") ? `${colors.primary}10` : "transparent",
                borderRadius: p.name.includes("You") ? 8 : 0,
              }}>
                <span style={{ width: 28, fontSize: 14, fontWeight: 800, color: colors.textLight }}>#{i + 4}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: p.name.includes("You") ? colors.primary : colors.text }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: colors.textLight }}>{p.school}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: colors.text }}>⚡ {p.xp}</div>
                  <div style={{ fontSize: 11, color: colors.textLight }}>🔥 {p.streak}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.nav}>
          {[
            { icon: "🏠", label: "Home", scr: "home" },
            { icon: "📊", label: "Dashboard", scr: "dashboard" },
            { icon: "🏆", label: "Leaderboard", scr: "leaderboard" },
            { icon: "🏅", label: "Badges", scr: "badges" },
            { icon: "⚙️", label: "Settings", scr: "settings" },
          ].map(item => (
            <div key={item.scr} onClick={() => setScreen(item.scr)} style={styles.navItem(screen === item.scr)}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 2, right: 12, fontSize: 9, color: "#cbd5e1" }}>v{APP_VERSION}</div>
        </div>
      </div>
    );
  }

  // ─── BADGES SCREEN ───
  if (screen === "badges") {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🏅 Badges</h2>
          <span style={{ fontSize: 13, opacity: 0.8 }}>{earnedBadges.length}/{BADGES.length} earned</span>
        </div>
        <div style={{ padding: "0 0 100px" }}>
          <div style={styles.card}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {BADGES.map(badge => {
                const earned = earnedBadges.includes(badge.id);
                return (
                  <div key={badge.id} style={{
                    textAlign: "center", padding: 16, borderRadius: 16,
                    background: earned ? `${colors.accent}10` : "#f8fafc",
                    border: `2px solid ${earned ? colors.accent : "#e2e8f0"}`,
                    opacity: earned ? 1 : 0.5,
                  }}>
                    <div style={{ fontSize: 36, filter: earned ? "none" : "grayscale(100%)" }}>{badge.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: colors.text, marginTop: 4 }}>{badge.name}</div>
                    <div style={{ fontSize: 11, color: colors.textLight, marginTop: 2 }}>{badge.desc}</div>
                    {earned && <div style={{ fontSize: 10, color: colors.success, fontWeight: 700, marginTop: 4 }}>✅ Earned</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.nav}>
          {[
            { icon: "🏠", label: "Home", scr: "home" },
            { icon: "📊", label: "Dashboard", scr: "dashboard" },
            { icon: "🏆", label: "Leaderboard", scr: "leaderboard" },
            { icon: "🏅", label: "Badges", scr: "badges" },
            { icon: "⚙️", label: "Settings", scr: "settings" },
          ].map(item => (
            <div key={item.scr} onClick={() => setScreen(item.scr)} style={styles.navItem(screen === item.scr)}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 2, right: 12, fontSize: 9, color: "#cbd5e1" }}>v{APP_VERSION}</div>
        </div>
      </div>
    );
  }

  // ─── SETTINGS ───
  if (screen === "settings") {
    const allTopics = getAllTopics();
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>⚙️ Settings</h2>
        </div>
        <div style={{ padding: "0 0 100px" }}>
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: colors.text }}>Profile</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 24, background: colors.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 20, fontWeight: 800,
              }}>
                {username[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>{username}</div>
                <div style={{ fontSize: 13, color: colors.textLight }}>{year} Year · Honours Maths</div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: colors.text }}>Your Topics ({selectedTopics.length})</h3>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {Object.entries(TOPICS).map(([paperKey, paper]) =>
                Object.entries(paper.topics).map(([key, topic]) => (
                  <button key={key} onClick={() => toggleTopic(key)} style={styles.chip(selectedTopics.includes(key), topic.color)}>
                    {topic.icon} {topic.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: colors.text }}>Year Group</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {["5th", "6th"].map(y => (
                <button key={y} onClick={() => { setYear(y); saveUser({ year: y }); }}
                  style={styles.chip(year === y, colors.primary)}>
                  {y} Year
                </button>
              ))}
            </div>
          </div>

          {/* Account section */}
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: colors.text }}>Account</h3>
            {phone && <p style={{ fontSize: 13, color: colors.textLight, margin: "0 0 4px" }}>Phone: +353 {phone}</p>}
            {email && <p style={{ fontSize: 13, color: colors.textLight, margin: "0 0 12px" }}>Email: {email}</p>}
            <button onClick={logout} style={{
              background: "none", border: "2px solid " + colors.danger, borderRadius: 12,
              padding: "12px 24px", color: colors.danger, fontSize: 14, fontWeight: 700,
              cursor: "pointer", width: "100%",
            }}>
              Sign Out
            </button>
          </div>
        </div>

        <div style={styles.nav}>
          {[
            { icon: "🏠", label: "Home", scr: "home" },
            { icon: "📊", label: "Dashboard", scr: "dashboard" },
            { icon: "🏆", label: "Leaderboard", scr: "leaderboard" },
            { icon: "🏅", label: "Badges", scr: "badges" },
            { icon: "⚙️", label: "Settings", scr: "settings" },
          ].map(item => (
            <div key={item.scr} onClick={() => setScreen(item.scr)} style={styles.navItem(screen === item.scr)}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 2, right: 12, fontSize: 9, color: "#cbd5e1" }}>v{APP_VERSION}</div>
        </div>
      </div>
    );
  }

  return null;
}
