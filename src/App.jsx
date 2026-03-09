import { useState, useEffect, useRef, useCallback } from "react";

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

// ─── QUESTION BANK (Real past paper Qs + custom variations, all verified) ───
const QUESTION_BANK = [
  // ALGEBRA
  {
    id: "alg_2019_p1_q1",
    topic: "algebra",
    subtopic: "Simultaneous Equations",
    difficulty: 2,
    source: "2019 Paper 1 Q1",
    question: "Solve the simultaneous equations:\n\nx - y = 2\nxy = 3",
    hints: [
      "Rearrange the linear equation to express x in terms of y: x = y + 2",
      "Substitute into xy = 3: (y + 2)y = 3 → y² + 2y - 3 = 0",
      "Factorise: (y + 3)(y - 1) = 0"
    ],
    answer: "x = 3, y = 1  OR  x = -1, y = -3",
    solution: "From x - y = 2 → x = y + 2\n\nSubstitute into xy = 3:\n(y + 2)y = 3\ny² + 2y - 3 = 0\n(y + 3)(y - 1) = 0\n\ny = 1 → x = 1 + 2 = 3\ny = -3 → x = -3 + 2 = -1\n\nCheck: (3)(1) = 3 ✓ and 3-1 = 2 ✓\n(-1)(-3) = 3 ✓ and -1-(-3) = 2 ✓\n\nSolutions: (x,y) = (3, 1) or (-1, -3)",
    acceptedAnswers: ["x=3,y=1", "(3,1)", "x=-1,y=-3", "(-1,-3)", "3,1", "-1,-3"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "alg_custom_1",
    topic: "algebra",
    subtopic: "Factoring",
    difficulty: 1,
    source: "Custom",
    question: "Factorise fully:\n\n2x³ - 8x² - 10x",
    hints: [
      "Start by taking out the common factor of 2x",
      "You'll get 2x(x² - 4x - 5)",
      "Now factorise the quadratic: what two numbers multiply to -5 and add to -4?"
    ],
    answer: "2x(x - 5)(x + 1)",
    solution: "2x³ - 8x² - 10x\n= 2x(x² - 4x - 5)\n= 2x(x - 5)(x + 1)\n\nCheck: 2x(x-5)(x+1) = 2x(x² + x - 5x - 5) = 2x(x² - 4x - 5) = 2x³ - 8x² - 10x ✓",
    acceptedAnswers: ["2x(x-5)(x+1)", "2x(x+1)(x-5)"],
    xp: 20,
    year: "5th & 6th"
  },
  // COMPLEX NUMBERS
  {
    id: "cn_2022_p1_q3",
    topic: "complex_numbers",
    subtopic: "Operations",
    difficulty: 2,
    source: "2022 Paper 1 Q3",
    question: "Given z₁ = 3 + 2i and z₂ = 1 - i\n\nFind z₁z₂ and express in the form a + bi.\nHence find |z₁z₂|.",
    hints: [
      "Multiply using FOIL: (3+2i)(1-i)",
      "Remember that i² = -1",
      "The modulus |a+bi| = √(a² + b²)"
    ],
    answer: "z₁z₂ = 5 - i, |z₁z₂| = √26",
    solution: "z₁z₂ = (3 + 2i)(1 - i)\n= 3(1) + 3(-i) + 2i(1) + 2i(-i)\n= 3 - 3i + 2i - 2i²\n= 3 - i - 2(-1)\n= 3 - i + 2\n= 5 - i\n\n|z₁z₂| = |5 - i| = √(5² + (-1)²) = √(25 + 1) = √26",
    acceptedAnswers: ["5-i", "5 - i", "√26", "sqrt(26)", "root26"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "cn_custom_1",
    topic: "complex_numbers",
    subtopic: "Argand Diagram",
    difficulty: 2,
    source: "Custom",
    question: "The complex number w = -1 + √3 i.\n\nExpress w in polar form r(cos θ + i sin θ), where 0 ≤ θ < 2π.",
    hints: [
      "Find r = |w| = √((-1)² + (√3)²)",
      "r = √(1+3) = 2. Now find θ using tan θ = √3/(-1)",
      "Since w is in the 2nd quadrant (negative real, positive imaginary), θ = π - π/3 = 2π/3"
    ],
    answer: "w = 2(cos(2π/3) + i sin(2π/3))",
    solution: "r = |w| = √((-1)² + (√3)²) = √(1 + 3) = √4 = 2\n\ntan α = |√3/(-1)| = √3, so α = π/3\n\nSince w is in the 2nd quadrant:\nθ = π - π/3 = 2π/3\n\nw = 2(cos(2π/3) + i sin(2π/3))",
    acceptedAnswers: ["2(cos(2π/3)+isin(2π/3))", "2(cos120+isin120)", "2cis(2π/3)", "2cis(120)"],
    xp: 35,
    year: "5th & 6th"
  },
  // DIFFERENTIATION
  {
    id: "diff_2021_p1_q8",
    topic: "differentiation",
    subtopic: "Max & Min Problems",
    difficulty: 3,
    source: "2021 Paper 1 Q8",
    question: "A rectangular box with a square base has no lid. The total surface area is 48 cm².\n\nFind the dimensions that maximise the volume of the box.",
    hints: [
      "Let the base side = x and height = h. Surface area: x² + 4xh = 48",
      "Express h in terms of x: h = (48 - x²)/(4x). Then V = x²h = x(48 - x²)/4",
      "Differentiate V and set dV/dx = 0 to find maximum"
    ],
    answer: "x = 4 cm, h = 2 cm (Volume = 32 cm³)",
    solution: "Let base side = x, height = h\nSurface area (no lid): x² + 4xh = 48\nh = (48 - x²)/(4x)\n\nV = x²h = x²·(48 - x²)/(4x) = x(48 - x²)/4\nV = 12x - x³/4\n\ndV/dx = 12 - 3x²/4\n\nSet dV/dx = 0:\n12 - 3x²/4 = 0\n3x²/4 = 12\nx² = 16\nx = 4 (x > 0)\n\nh = (48 - 16)/(4·4) = 32/16 = 2\n\nd²V/dx² = -3x/2 = -6 < 0 → Maximum ✓\n\nDimensions: 4 cm × 4 cm × 2 cm\nMax volume = 4·4·2 = 32 cm³",
    acceptedAnswers: ["x=4,h=2", "4,4,2", "4cm,4cm,2cm", "32", "32cm3", "32cm³"],
    xp: 50,
    year: "6th"
  },
  {
    id: "diff_custom_1",
    topic: "differentiation",
    subtopic: "Chain/Product/Quotient Rule",
    difficulty: 2,
    source: "Custom",
    question: "Differentiate with respect to x:\n\ny = (3x² + 1)⁴",
    hints: [
      "This is a composite function — use the Chain Rule",
      "If y = u⁴ where u = 3x² + 1, then dy/dx = dy/du · du/dx",
      "dy/du = 4u³ and du/dx = 6x"
    ],
    answer: "dy/dx = 24x(3x² + 1)³",
    solution: "Using the Chain Rule:\nLet u = 3x² + 1\ny = u⁴\n\ndy/du = 4u³\ndu/dx = 6x\n\ndy/dx = dy/du · du/dx\n= 4(3x² + 1)³ · 6x\n= 24x(3x² + 1)³",
    acceptedAnswers: ["24x(3x²+1)³", "24x(3x^2+1)^3", "24x(3x2+1)3"],
    xp: 25,
    year: "6th"
  },
  // INTEGRATION
  {
    id: "int_2020_p1_q9",
    topic: "integration",
    subtopic: "Area Under a Curve",
    difficulty: 3,
    source: "2020 Paper 1 Q9",
    question: "Find the area enclosed between the curve y = x² - 4 and the x-axis.",
    hints: [
      "First find where the curve crosses the x-axis: x² - 4 = 0",
      "x = -2 and x = 2. The curve is below the x-axis between these points",
      "Area = -∫₋₂² (x² - 4) dx (negative because curve is below x-axis)"
    ],
    answer: "32/3 square units",
    solution: "Find x-intercepts: x² - 4 = 0 → x = ±2\n\nBetween x = -2 and x = 2, the curve is below the x-axis.\n\nArea = |∫₋₂² (x² - 4) dx|\n\n= |[x³/3 - 4x]₋₂²|\n\n= |(8/3 - 8) - (-8/3 + 8)|\n\n= |(8/3 - 8 + 8/3 - 8)|\n\n= |16/3 - 16|\n\n= |-32/3|\n\n= 32/3 square units ≈ 10.67 sq. units",
    acceptedAnswers: ["32/3", "10.67", "10.66", "10⅔"],
    xp: 45,
    year: "6th"
  },
  // SEQUENCES & SERIES
  {
    id: "ss_2018_p1_q4",
    topic: "sequences_series",
    subtopic: "Geometric Sequences",
    difficulty: 2,
    source: "2018 Paper 1 Q4",
    question: "The 2nd term of a geometric series is 6 and the 5th term is 162.\n\nFind the common ratio and the first term.",
    hints: [
      "In a geometric series, Tₙ = ar^(n-1). So T₂ = ar = 6 and T₅ = ar⁴ = 162",
      "Divide T₅ by T₂ to eliminate a: ar⁴/ar = 162/6 → r³ = 27",
      "r = 3, then a = 6/r = 2"
    ],
    answer: "r = 3, a = 2",
    solution: "T₂ = ar = 6 ... (1)\nT₅ = ar⁴ = 162 ... (2)\n\nDivide (2) by (1):\nar⁴/ar = 162/6\nr³ = 27\nr = 3\n\nFrom (1): a(3) = 6\na = 2\n\nFirst term = 2, Common ratio = 3",
    acceptedAnswers: ["r=3,a=2", "a=2,r=3", "3,2", "2,3"],
    xp: 30,
    year: "5th & 6th"
  },
  // TRIGONOMETRY
  {
    id: "trig_2023_p2_q7",
    topic: "trigonometry",
    subtopic: "Sine & Cosine Rules",
    difficulty: 2,
    source: "2023 Paper 2 Q7",
    question: "In triangle ABC, |AB| = 8 cm, |AC| = 5 cm, and angle BAC = 60°.\n\nFind |BC|, correct to one decimal place.",
    hints: [
      "You know two sides and the included angle — use the Cosine Rule",
      "a² = b² + c² - 2bc·cos A where a = |BC|, b = 5, c = 8, A = 60°",
      "a² = 25 + 64 - 2(5)(8)cos 60° = 89 - 80(0.5) = 89 - 40 = 49"
    ],
    answer: "|BC| = 7.0 cm",
    solution: "Using the Cosine Rule:\n|BC|² = |AC|² + |AB|² - 2|AC||AB|cos(BAC)\n= 5² + 8² - 2(5)(8)cos 60°\n= 25 + 64 - 80(½)\n= 89 - 40\n= 49\n\n|BC| = √49 = 7.0 cm",
    acceptedAnswers: ["7", "7.0", "7cm", "7.0cm"],
    xp: 30,
    year: "5th & 6th"
  },
  {
    id: "trig_custom_1",
    topic: "trigonometry",
    subtopic: "Solving Trig Equations",
    difficulty: 2,
    source: "Custom",
    question: "Solve for x, where 0° ≤ x ≤ 360°:\n\n2sin²x - sinx - 1 = 0",
    hints: [
      "This is a quadratic in sin x. Let u = sin x: 2u² - u - 1 = 0",
      "Factorise: (2u + 1)(u - 1) = 0, so sin x = -1/2 or sin x = 1",
      "sin x = 1 → x = 90°. sin x = -1/2 → x = 210° or 330°"
    ],
    answer: "x = 90°, 210°, 330°",
    solution: "Let u = sin x:\n2u² - u - 1 = 0\n(2u + 1)(u - 1) = 0\nu = -1/2 or u = 1\n\nsin x = 1:\nx = 90°\n\nsin x = -1/2:\nReference angle = 30°\nx is in 3rd and 4th quadrants\nx = 180° + 30° = 210°\nx = 360° - 30° = 330°\n\nSolutions: x = 90°, 210°, 330°",
    acceptedAnswers: ["90,210,330", "90°,210°,330°", "x=90,210,330"],
    xp: 35,
    year: "5th & 6th"
  },
  // COORDINATE GEOMETRY - LINE
  {
    id: "line_2017_p2_q1",
    topic: "coord_line",
    subtopic: "Slope & Equation of a Line",
    difficulty: 1,
    source: "2017 Paper 2 Q1",
    question: "The line l passes through the points A(2, -1) and B(6, 7).\n\nFind the equation of l in the form ax + by + c = 0.",
    hints: [
      "Find the slope: m = (y₂ - y₁)/(x₂ - x₁) = (7-(-1))/(6-2)",
      "m = 8/4 = 2. Now use y - y₁ = m(x - x₁)",
      "y - (-1) = 2(x - 2) → y + 1 = 2x - 4 → 2x - y - 5 = 0"
    ],
    answer: "2x - y - 5 = 0",
    solution: "Slope m = (7-(-1))/(6-2) = 8/4 = 2\n\nUsing point A(2,-1):\ny - (-1) = 2(x - 2)\ny + 1 = 2x - 4\n0 = 2x - y - 5\n\nEquation: 2x - y - 5 = 0",
    acceptedAnswers: ["2x-y-5=0", "2x - y - 5 = 0", "-2x+y+5=0"],
    xp: 20,
    year: "5th & 6th"
  },
  // COORDINATE GEOMETRY - CIRCLE
  {
    id: "circle_custom_1",
    topic: "coord_circle",
    subtopic: "Equation of a Circle",
    difficulty: 2,
    source: "Custom",
    question: "Find the centre and radius of the circle:\n\nx² + y² - 6x + 4y - 12 = 0",
    hints: [
      "Rewrite in the form (x-h)² + (y-k)² = r² by completing the square",
      "Group x and y terms: (x² - 6x) + (y² + 4y) = 12",
      "(x² - 6x + 9) + (y² + 4y + 4) = 12 + 9 + 4"
    ],
    answer: "Centre (3, -2), Radius = 5",
    solution: "x² + y² - 6x + 4y - 12 = 0\n\nComplete the square:\n(x² - 6x + 9) + (y² + 4y + 4) = 12 + 9 + 4\n(x - 3)² + (y + 2)² = 25\n\nCentre = (3, -2)\nRadius = √25 = 5",
    acceptedAnswers: ["(3,-2),r=5", "centre(3,-2)radius5", "3,-2,5", "(3,-2),5"],
    xp: 25,
    year: "5th & 6th"
  },
  // PROBABILITY
  {
    id: "prob_2022_p2_q8",
    topic: "probability",
    subtopic: "Bernoulli Trials",
    difficulty: 3,
    source: "2022 Paper 2 Q8",
    question: "A biased coin has P(Heads) = 0.6. The coin is tossed 5 times.\n\nFind the probability of getting exactly 3 heads.",
    hints: [
      "This is a Bernoulli trial with n=5, p=0.6, r=3",
      "P(X=r) = ⁿCᵣ · pʳ · (1-p)ⁿ⁻ʳ",
      "P(X=3) = ⁵C₃ · (0.6)³ · (0.4)²"
    ],
    answer: "P(X=3) = 0.3456",
    solution: "Using the Binomial formula:\nP(X = r) = ⁿCᵣ · pʳ · qⁿ⁻ʳ\n\nwhere n=5, r=3, p=0.6, q=0.4\n\nP(X=3) = ⁵C₃ · (0.6)³ · (0.4)²\n= 10 · 0.216 · 0.16\n= 10 · 0.03456\n= 0.3456",
    acceptedAnswers: ["0.3456", ".3456", "0.346", "0.35", "3456/10000", "864/2500"],
    xp: 35,
    year: "5th & 6th"
  },
  // STATISTICS
  {
    id: "stats_custom_1",
    topic: "statistics",
    subtopic: "Normal Distribution",
    difficulty: 2,
    source: "Custom",
    question: "The heights of students in a school are normally distributed with mean 170 cm and standard deviation 8 cm.\n\nWhat percentage of students are taller than 178 cm?",
    hints: [
      "Find the z-score: z = (x - μ)/σ = (178 - 170)/8",
      "z = 1. Use the standard normal tables",
      "P(Z < 1) = 0.8413, so P(Z > 1) = 1 - 0.8413"
    ],
    answer: "15.87%",
    solution: "z = (x - μ)/σ = (178 - 170)/8 = 8/8 = 1\n\nFrom tables: P(Z < 1) = 0.8413\n\nP(Z > 1) = 1 - 0.8413 = 0.1587\n\n= 15.87% of students are taller than 178 cm",
    acceptedAnswers: ["15.87", "15.87%", "0.1587", "15.9", "15.9%", "16%"],
    xp: 30,
    year: "5th & 6th"
  },
  // FUNCTIONS
  {
    id: "func_custom_1",
    topic: "functions",
    subtopic: "Exponential & Log",
    difficulty: 2,
    source: "Custom",
    question: "Solve for x:\n\n3^(2x+1) = 27^(x-1)",
    hints: [
      "Express 27 as a power of 3: 27 = 3³",
      "So 3^(2x+1) = 3^(3(x-1)) = 3^(3x-3)",
      "Since bases are equal: 2x + 1 = 3x - 3"
    ],
    answer: "x = 4",
    solution: "3^(2x+1) = 27^(x-1)\n3^(2x+1) = (3³)^(x-1)\n3^(2x+1) = 3^(3x-3)\n\nSince bases are equal, exponents are equal:\n2x + 1 = 3x - 3\n1 + 3 = 3x - 2x\n4 = x\n\nx = 4\n\nCheck: LHS = 3^(8+1) = 3⁹ = 19683\nRHS = 27^(4-1) = 27³ = 19683 ✓",
    acceptedAnswers: ["4", "x=4"],
    xp: 30,
    year: "5th & 6th"
  },
  // PROOF BY INDUCTION
  {
    id: "ind_custom_1",
    topic: "induction",
    subtopic: "Summation Proofs",
    difficulty: 3,
    source: "Custom",
    question: "Prove by induction that for all n ∈ ℕ:\n\n1 + 2 + 3 + ... + n = n(n+1)/2",
    hints: [
      "Step 1: Show it's true for n = 1: LHS = 1, RHS = 1(2)/2 = 1 ✓",
      "Step 2: Assume true for n = k: 1+2+...+k = k(k+1)/2",
      "Step 3: Prove for n = k+1 by adding (k+1) to both sides"
    ],
    answer: "Proof by induction (see solution for full proof)",
    solution: "Step 1 (Base case): n = 1\nLHS = 1\nRHS = 1(1+1)/2 = 1 ✓\n\nStep 2 (Inductive hypothesis):\nAssume true for n = k:\n1 + 2 + ... + k = k(k+1)/2\n\nStep 3 (Inductive step):\nProve for n = k + 1:\n1 + 2 + ... + k + (k+1)\n= k(k+1)/2 + (k+1)    [using hypothesis]\n= k(k+1)/2 + 2(k+1)/2\n= (k+1)(k+2)/2\n= (k+1)((k+1)+1)/2\n\nThis is the formula with n = k+1 ✓\n\nBy induction, true for all n ∈ ℕ. □",
    acceptedAnswers: ["proven", "proof", "qed", "true"],
    xp: 50,
    year: "6th"
  },
  // FINANCIAL MATHS
  {
    id: "fin_2019_p1_q7",
    topic: "financial_maths",
    subtopic: "Compound Interest",
    difficulty: 2,
    source: "2019 Paper 1 Q7",
    question: "€5,000 is invested at 3.5% per annum compound interest.\n\nHow much will the investment be worth after 6 years? Give your answer to the nearest cent.",
    hints: [
      "Use the compound interest formula: F = P(1 + i)ⁿ",
      "P = 5000, i = 0.035, n = 6",
      "F = 5000(1.035)⁶"
    ],
    answer: "€6,146.28",
    solution: "F = P(1 + i)ⁿ\n= 5000(1 + 0.035)⁶\n= 5000(1.035)⁶\n= 5000 × 1.229255682\n= €6,146.28",
    acceptedAnswers: ["6146.28", "€6146.28", "6146", "6,146.28"],
    xp: 25,
    year: "5th & 6th"
  },
  // GEOMETRY
  {
    id: "geom_custom_1",
    topic: "geometry",
    subtopic: "Theorems & Corollaries",
    difficulty: 2,
    source: "Custom",
    question: "In a circle, a chord AB has length 10 cm. The perpendicular from the centre O to the chord meets it at M.\n\nIf the radius of the circle is 13 cm, find |OM|.",
    hints: [
      "The perpendicular from centre to a chord bisects the chord (Theorem)",
      "So |AM| = |MB| = 5 cm",
      "In right triangle OMA: |OA|² = |OM|² + |AM|² (Pythagoras)"
    ],
    answer: "|OM| = 12 cm",
    solution: "The perpendicular from centre to a chord bisects the chord.\nSo |AM| = 10/2 = 5 cm\n\nIn right triangle OMA:\n|OA|² = |OM|² + |AM|²\n13² = |OM|² + 5²\n169 = |OM|² + 25\n|OM|² = 144\n|OM| = 12 cm",
    acceptedAnswers: ["12", "12cm", "|OM|=12"],
    xp: 25,
    year: "5th & 6th"
  },
  // LENGTH AREA VOLUME
  {
    id: "lav_custom_1",
    topic: "length_area_volume",
    subtopic: "Volume of 3D Solids",
    difficulty: 2,
    source: "Custom",
    question: "A cone has a base radius of 6 cm and a slant height of 10 cm.\n\nFind the volume of the cone, correct to one decimal place.",
    hints: [
      "First find the height using Pythagoras: h² + r² = l²",
      "h² = 10² - 6² = 100 - 36 = 64, so h = 8",
      "V = (1/3)πr²h = (1/3)π(36)(8)"
    ],
    answer: "V = 301.6 cm³",
    solution: "Find height h:\nh² + r² = l²\nh² + 36 = 100\nh² = 64\nh = 8 cm\n\nV = (1/3)πr²h\n= (1/3)π(6²)(8)\n= (1/3)π(288)\n= 96π\n= 301.6 cm³",
    acceptedAnswers: ["301.6", "301.59", "96π", "96pi", "301.6cm³", "301.6cm3"],
    xp: 25,
    year: "5th & 6th"
  },
  // LOGS & INDICES
  {
    id: "log_custom_1",
    topic: "logs_indices",
    subtopic: "Laws of Logarithms",
    difficulty: 2,
    source: "Custom",
    question: "Solve for x:\n\nlog₂(x) + log₂(x - 2) = 3",
    hints: [
      "Use the log rule: log a + log b = log(ab)",
      "log₂(x(x-2)) = 3, so x(x-2) = 2³ = 8",
      "x² - 2x - 8 = 0 → (x-4)(x+2) = 0"
    ],
    answer: "x = 4",
    solution: "log₂(x) + log₂(x - 2) = 3\nlog₂(x(x - 2)) = 3\nx(x - 2) = 2³\nx² - 2x = 8\nx² - 2x - 8 = 0\n(x - 4)(x + 2) = 0\nx = 4 or x = -2\n\nSince log requires positive arguments:\nx > 0 and x - 2 > 0 → x > 2\n\nTherefore x = 4\n\nCheck: log₂(4) + log₂(2) = 2 + 1 = 3 ✓",
    acceptedAnswers: ["4", "x=4"],
    xp: 30,
    year: "5th & 6th"
  }
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

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
  };

  const stopDraw = () => { setIsDrawing(false); setLastPos(null); };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (onClear) onClear();
  };

  useEffect(() => {
    if (onClear) onClear.current = clearCanvas;
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={360}
        height={220}
        style={{
          border: "2px solid #cbd5e1",
          borderRadius: 12,
          background: "#fefce8",
          touchAction: "none",
          cursor: "crosshair",
          width: "100%",
          maxWidth: 360,
        }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
      />
      <button onClick={clearCanvas} style={{
        position: "absolute", top: 8, right: 8, background: "#ef4444", color: "white",
        border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer"
      }}>Clear</button>
      <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
        ✏️ Draw your workings here
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function MathU() {
  // App state
  const [screen, setScreen] = useState("splash");
  const [year, setYear] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [username, setUsername] = useState("");

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
            onClick={() => setScreen("onboard_name")}
            style={{ ...styles.btn("white"), color: colors.primaryDark, fontSize: 18, padding: "16px 48px" }}
          >
            Get Started
          </button>
          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 20 }}>Already have an account? <span style={{ textDecoration: "underline", cursor: "pointer" }}>Sign In</span></p>
        </div>
      </div>
    );
  }

  // ─── ONBOARDING: NAME ───
  if (screen === "onboard_name") {
    return (
      <div style={styles.app}>
        <div style={{ padding: "60px 24px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: colors.text }}>What's your name?</h2>
          <p style={{ color: colors.textLight, margin: "0 0 32px", fontSize: 14 }}>So we can personalise your experience</p>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your first name"
            style={{ ...styles.input, textAlign: "center", fontSize: 20 }}
          />
          <button
            onClick={() => username.trim() && setScreen("onboard_year")}
            disabled={!username.trim()}
            style={{ ...styles.btn(username.trim() ? colors.primary : "#cbd5e1", true), marginTop: 24 }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ─── ONBOARDING: YEAR ───
  if (screen === "onboard_year") {
    return (
      <div style={styles.app}>
        <div style={{ padding: "60px 24px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: colors.text }}>What year are you in?</h2>
          <p style={{ color: colors.textLight, margin: "0 0 32px", fontSize: 14 }}>We'll tailor questions to your level</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {["5th", "6th"].map(y => (
              <button key={y} onClick={() => { setYear(y); setScreen("onboard_topics"); }}
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
              onClick={() => selectedTopics.length > 0 && setScreen("home")}
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
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLight, marginTop: 12, marginBottom: 8 }}>Full Solution:</div>
              <div style={{
                background: "white", padding: 14, borderRadius: 10, fontSize: 13,
                lineHeight: 1.7, whiteSpace: "pre-line", color: colors.text,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}>
                {currentQuestion.solution}
              </div>
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
                <button key={y} onClick={() => setYear(y)}
                  style={styles.chip(year === y, colors.primary)}>
                  {y} Year
                </button>
              ))}
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
        </div>
      </div>
    );
  }

  return null;
}
