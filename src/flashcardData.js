// ─── FLASHCARD DATA ───
// Each topic has a set of "catch-up" cards: concept, method, worked example, exam tip

export const FLASHCARDS = {
  algebra: [
    {
      front: "Solving Quadratic Equations",
      back: "Three methods:\n\n1. Factorise: Find two numbers that multiply to give c and add to give b\n   x² + 5x + 6 = 0 → (x+2)(x+3) = 0\n\n2. Quadratic Formula:\n   x = (-b ± √(b²-4ac)) / 2a\n\n3. Complete the Square:\n   x² + 6x = (x+3)² - 9",
      color: "#4F46E5",
    },
    {
      front: "Worked Example\nSolve 2x² - 7x + 3 = 0",
      back: "Using the quadratic formula:\na=2, b=-7, c=3\n\nx = (7 ± √(49-24)) / 4\nx = (7 ± √25) / 4\nx = (7 ± 5) / 4\n\nx = 3  or  x = ½\n\nAlways check: 2(3)² - 7(3) + 3 = 18-21+3 = 0 ✓",
      color: "#4F46E5",
    },
    {
      front: "Simultaneous Equations\n(3 unknowns)",
      back: "Method: Substitution + Elimination\n\n1. Label equations (1), (2), (3)\n2. From (1), express x in terms of y\n3. Substitute into (2) and (3)\n4. Now you have 2 equations in 2 unknowns\n5. Solve those, then back-substitute\n\nTip: Always check your answer in ALL three original equations",
      color: "#4F46E5",
    },
    {
      front: "Inequalities",
      back: "Linear: Solve like an equation BUT flip the sign when multiplying/dividing by negative\n\n-2x > 6  →  x < -3\n\nQuadratic: Solve = 0 first, then test regions\nx² - 5x + 6 ≤ 0\n(x-2)(x-3) ≤ 0\nRoots: x=2, x=3\nTest regions: answer is 2 ≤ x ≤ 3\n\nExam tip: Draw a number line!",
      color: "#4F46E5",
    },
    {
      front: "Exam Tip: Algebra",
      back: "• Always show your substitution step\n• 'Solve' means find the value — give exact answers unless told otherwise\n• 'Verify' or 'Check' = substitute back in\n• Watch for: rejecting invalid solutions (e.g. negative lengths, n∈ℕ)\n• If stuck on a cubic, try x=1, x=-1, x=2 as potential factors",
      color: "#4F46E5",
    },
  ],

  complex_numbers: [
    {
      front: "What is a Complex Number?",
      back: "z = a + bi where i² = -1\n\na = real part, b = imaginary part\n\nConjugate: z̄ = a - bi\n\nKey property: z × z̄ = a² + b² (always real!)\n\nThis is how you divide complex numbers — multiply top and bottom by the conjugate of the denominator",
      color: "#7C3AED",
    },
    {
      front: "Modulus & Argument",
      back: "|z| = √(a² + b²)  — distance from origin\n\narg(z) = tan⁻¹(b/a)  — angle from positive x-axis\n\nPolar form: z = |z|(cos θ + i sin θ)\n\nCAREFUL with quadrants:\n• Q1: θ = tan⁻¹(b/a)\n• Q2: θ = π - tan⁻¹(|b/a|)\n• Q3: θ = -(π - tan⁻¹(|b/a|))\n• Q4: θ = -tan⁻¹(|b/a|)",
      color: "#7C3AED",
    },
    {
      front: "De Moivre's Theorem",
      back: "[cos θ + i sin θ]ⁿ = cos(nθ) + i sin(nθ)\n\nUsed for:\n• Finding powers of complex numbers\n• Finding nth roots\n\nFor roots: ⁿ√z gives n roots spaced 2π/n apart\nzₖ = ⁿ√|z| [cos((θ+2kπ)/n) + i sin((θ+2kπ)/n)]\nwhere k = 0, 1, 2, ..., n-1",
      color: "#7C3AED",
    },
    {
      front: "Worked Example\nExpress (1+i)⁶ in a+bi form",
      back: "First convert to polar:\n|1+i| = √2,  arg = π/4\n\nSo 1+i = √2(cos π/4 + i sin π/4)\n\nBy De Moivre's:\n(√2)⁶(cos 6π/4 + i sin 6π/4)\n= 8(cos 3π/2 + i sin 3π/2)\n= 8(0 + i(-1))\n= -8i",
      color: "#7C3AED",
    },
  ],

  sequences_series: [
    {
      front: "Arithmetic vs Geometric",
      back: "Arithmetic: add a constant (d)\na, a+d, a+2d, a+3d, ...\nTₙ = a + (n-1)d\nSₙ = n/2[2a + (n-1)d]\n\nGeometric: multiply by a constant (r)\na, ar, ar², ar³, ...\nTₙ = arⁿ⁻¹\nSₙ = a(1-rⁿ)/(1-r)   [r≠1]",
      color: "#2563EB",
    },
    {
      front: "Sum to Infinity",
      back: "Only works for geometric series where |r| < 1\n\nS∞ = a / (1-r)\n\nExample: 1 + ½ + ¼ + ⅛ + ...\na=1, r=½\nS∞ = 1/(1-½) = 2\n\nIf |r| ≥ 1, the series diverges (no finite sum)",
      color: "#2563EB",
    },
    {
      front: "Worked Example\nFind S₂₀ of 3, 7, 11, 15, ...",
      back: "This is arithmetic: a=3, d=4\n\nSₙ = n/2[2a + (n-1)d]\nS₂₀ = 20/2[2(3) + 19(4)]\nS₂₀ = 10[6 + 76]\nS₂₀ = 10 × 82\nS₂₀ = 820\n\nAlternative: S₂₀ = 20/2[first + last]\n= 10[3 + 79] = 820 ✓",
      color: "#2563EB",
    },
    {
      front: "Exam Tip: Sequences",
      back: "• First thing: decide if it's arithmetic or geometric\n  → Subtract consecutive terms: constant = arithmetic\n  → Divide consecutive terms: constant = geometric\n\n• 'nth term' = Tₙ formula\n• 'sum of first n terms' = Sₙ formula\n• Tₙ = Sₙ - Sₙ₋₁ (useful trick!)\n• Sigma notation: just means 'add up'",
      color: "#2563EB",
    },
  ],

  financial_maths: [
    {
      front: "Compound Interest\n& Depreciation",
      back: "Future Value:\nF = P(1 + i)ᵗ\n\nDepreciation:\nF = P(1 - i)ᵗ\n\nP = principal (starting amount)\ni = interest rate as decimal\nt = number of years\n\nFor monthly compounding:\ni = annual rate / 12\nt = number of months",
      color: "#059669",
    },
    {
      front: "Present Value",
      back: "How much do I need to invest NOW to have F in the future?\n\nP = F / (1+i)ᵗ  =  F(1+i)⁻ᵗ\n\nExample: Need €10,000 in 5 years at 3%?\nP = 10000 / (1.03)⁵\nP = 10000 / 1.1593\nP = €8,626.09",
      color: "#059669",
    },
    {
      front: "Amortisation\n(Loan Repayments)",
      back: "Equal repayments formula:\n\nA = P × i(1+i)ⁿ / [(1+i)ⁿ - 1]\n\nA = repayment amount\nP = loan amount\ni = interest rate per period\nn = number of periods\n\nOr use: P = A × [1-(1+i)⁻ⁿ] / i\n\nThis is on the formula sheet — know how to use it!",
      color: "#059669",
    },
  ],

  functions: [
    {
      front: "Key Function Types",
      back: "Linear: f(x) = mx + c  (straight line)\nQuadratic: f(x) = ax² + bx + c  (parabola)\nCubic: f(x) = ax³ + ...  (S-shape)\nExponential: f(x) = aˣ  (rapid growth)\nLog: f(x) = logₐx  (inverse of exponential)\n\nTo find where graphs cross:\nSet f(x) = g(x) and solve",
      color: "#0891B2",
    },
    {
      front: "Transformations of Graphs",
      back: "f(x) + c → shift UP by c\nf(x) - c → shift DOWN by c\nf(x+c) → shift LEFT by c\nf(x-c) → shift RIGHT by c\n-f(x) → reflect in x-axis\nf(-x) → reflect in y-axis\n2f(x) → stretch vertically ×2\nf(2x) → compress horizontally ×½\n\nRemember: inside the bracket = opposite direction!",
      color: "#0891B2",
    },
    {
      front: "Injective, Surjective, Bijective",
      back: "Injective (one-to-one):\nEvery output has at most one input\nTest: Horizontal line hits graph at most once\n\nSurjective (onto):\nEvery element in codomain is mapped to\nTest: Horizontal line hits graph at least once\n\nBijective = Both injective AND surjective\nTest: Every horizontal line hits graph exactly once\n\nBijective functions have inverses!",
      color: "#0891B2",
    },
  ],

  differentiation: [
    {
      front: "Basic Differentiation Rules",
      back: "Power Rule: d/dx(xⁿ) = nxⁿ⁻¹\n\nConstant: d/dx(c) = 0\n\nSum: d/dx(f+g) = f'+g'\n\nMultiple: d/dx(cf) = cf'\n\nExamples:\nd/dx(x³) = 3x²\nd/dx(5x²) = 10x\nd/dx(√x) = d/dx(x^½) = ½x^(-½) = 1/(2√x)",
      color: "#DC2626",
    },
    {
      front: "Chain / Product / Quotient",
      back: "Chain Rule: d/dx[f(g(x))] = f'(g(x)) × g'(x)\n→ \"Differentiate outside, multiply by derivative of inside\"\n\nProduct Rule: d/dx[uv] = u'v + uv'\n\nQuotient Rule: d/dx[u/v] = (u'v - uv') / v²\n\nTip: For quotient, remember \"low d-high minus high d-low, over low squared\"",
      color: "#DC2626",
    },
    {
      front: "Max & Min Problems",
      back: "1. Find f'(x)\n2. Set f'(x) = 0 and solve\n3. Find f''(x)\n4. Substitute critical points:\n   f''(x) > 0 → MINIMUM\n   f''(x) < 0 → MAXIMUM\n   f''(x) = 0 → check further\n\nFor word problems:\n• Set up the function from the question\n• Differentiate, set = 0, solve\n• Answer the actual question asked!",
      color: "#DC2626",
    },
    {
      front: "Worked Example\nDifferentiate (3x+1)⁵",
      back: "Chain Rule: differentiate outside, multiply by inside derivative\n\nf(x) = (3x+1)⁵\n\nOutside: ( )⁵ → 5( )⁴\nInside: 3x+1 → derivative is 3\n\nf'(x) = 5(3x+1)⁴ × 3\nf'(x) = 15(3x+1)⁴\n\nAlways multiply by the derivative of what's inside the brackets!",
      color: "#DC2626",
    },
  ],

  integration: [
    {
      front: "Integration = Reverse of Differentiation",
      back: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C   [n ≠ -1]\n\n\"Add 1 to the power, divide by new power, add C\"\n\nExamples:\n∫x³ dx = x⁴/4 + C\n∫5x² dx = 5x³/3 + C\n∫1/x² dx = ∫x⁻² dx = -x⁻¹ + C = -1/x + C\n\nC = constant of integration (don't forget for indefinite!)",
      color: "#E11D48",
    },
    {
      front: "Definite Integrals & Area",
      back: "∫ₐᵇ f(x)dx = [F(x)]ₐᵇ = F(b) - F(a)\n\nNo +C needed for definite integrals!\n\nArea under curve = ∫ₐᵇ f(x)dx\n\nCAREFUL: If curve goes below x-axis, the integral is negative.\nFor actual area: split at roots and take |each part|\n\nArea between curves: ∫ₐᵇ [f(x) - g(x)]dx",
      color: "#E11D48",
    },
    {
      front: "Trapezoidal Rule",
      back: "∫ₐᵇ f(x)dx ≈ h/2[first + last + 2(sum of rest)]\n\nwhere h = (b-a)/n\nn = number of intervals (NOT number of points)\n\nExample: 5 points = 4 intervals\n\nThis is an approximation — more intervals = more accurate\n\nExam tip: Set up a table of x and y values first",
      color: "#E11D48",
    },
  ],

  induction: [
    {
      front: "Proof by Induction\n3-Step Method",
      back: "Step 1: PROVE for n=1\nShow LHS = RHS when n=1\n\nStep 2: ASSUME true for n=k\nWrite down P(k) — \"Assume true for n=k\"\n\nStep 3: PROVE for n=k+1\nStart with LHS of P(k+1)\nManipulate until you can use P(k)\nShow it equals RHS of P(k+1)\n\nConclusion: \"True for n=1, and if true for n=k then true for n=k+1. By induction, true for all n∈ℕ\"",
      color: "#9333EA",
    },
    {
      front: "Worked Example\nProve Σr = n(n+1)/2",
      back: "n=1: LHS=1, RHS=1(2)/2=1 ✓\n\nAssume: 1+2+...+k = k(k+1)/2\n\nProve for k+1:\n1+2+...+k+(k+1)\n= k(k+1)/2 + (k+1)     [using assumption]\n= k(k+1)/2 + 2(k+1)/2\n= [k(k+1) + 2(k+1)] / 2\n= (k+1)(k+2) / 2\n= (k+1)((k+1)+1) / 2  ✓\n\nThis is P(k+1). QED by induction.",
      color: "#9333EA",
    },
    {
      front: "Exam Tip: Induction",
      back: "• Always state your assumption clearly\n• The key step is using your assumption — make it obvious\n• For divisibility: show P(k+1) - P(k) or factor out\n• Common mistake: forgetting the conclusion sentence\n• Write the full conclusion every time\n• Practice: series sums, divisibility (9ⁿ-1 divisible by 8), inequalities",
      color: "#9333EA",
    },
  ],

  logs_indices: [
    {
      front: "Laws of Indices",
      back: "aᵐ × aⁿ = aᵐ⁺ⁿ\naᵐ ÷ aⁿ = aᵐ⁻ⁿ\n(aᵐ)ⁿ = aᵐⁿ\na⁰ = 1\na⁻ⁿ = 1/aⁿ\na^(1/n) = ⁿ√a\na^(m/n) = ⁿ√(aᵐ)\n\nThese are on the formula sheet but you need to know them cold!",
      color: "#C026D3",
    },
    {
      front: "Laws of Logarithms",
      back: "log is the inverse of exponents:\nif aˣ = b then logₐb = x\n\nlog(AB) = logA + logB\nlog(A/B) = logA - logB\nlog(Aⁿ) = n·logA\nlogₐa = 1\nlogₐ1 = 0\n\nChange of base: logₐb = logb/loga\n\nTo solve aˣ = b: take log of both sides\nx = logb / loga",
      color: "#C026D3",
    },
    {
      front: "Worked Example\nSolve 3ˣ⁺¹ = 5²ˣ",
      back: "Take log of both sides:\n(x+1)log3 = 2x·log5\n\nExpand:\nx·log3 + log3 = 2x·log5\n\nCollect x terms:\nx·log3 - 2x·log5 = -log3\nx(log3 - 2log5) = -log3\n\nx = -log3 / (log3 - 2log5)\nx = -0.477 / (0.477 - 1.398)\nx = -0.477 / -0.921\nx ≈ 0.518",
      color: "#C026D3",
    },
  ],

  coord_line: [
    {
      front: "Key Line Formulae",
      back: "Slope: m = (y₂-y₁)/(x₂-x₁)\n\nEquation: y - y₁ = m(x - x₁)\n\nDistance: d = √[(x₂-x₁)² + (y₂-y₁)²]\n\nMidpoint: ((x₁+x₂)/2, (y₁+y₂)/2)\n\nParallel lines: same slope (m₁ = m₂)\nPerpendicular: m₁ × m₂ = -1\n\nAll on the formula sheet — practice using them!",
      color: "#EA580C",
    },
    {
      front: "Perpendicular Distance\nfrom Point to Line",
      back: "Distance from (x₁,y₁) to ax+by+c=0:\n\nd = |ax₁ + by₁ + c| / √(a²+b²)\n\nIMPORTANT: Line must be in form ax+by+c=0\nIf given y=mx+k, rearrange to mx-y+k=0 first\n\nThis formula is used constantly:\n• Finding height of triangle\n• Distance between parallel lines\n• Proving tangent to circle",
      color: "#EA580C",
    },
  ],

  coord_circle: [
    {
      front: "Circle Equations",
      back: "Centre-radius form:\n(x-h)² + (y-k)² = r²\nCentre (h,k), radius r\n\nGeneral form:\nx² + y² + 2gx + 2fy + c = 0\nCentre (-g,-f), radius √(g²+f²-c)\n\nTo convert: complete the square on x and y\n\nRadius must be > 0, so g²+f²-c > 0",
      color: "#D97706",
    },
    {
      front: "Tangent to a Circle",
      back: "A tangent touches the circle at exactly one point.\n\nMethod 1: Substitute line into circle equation → discriminant = 0\n\nMethod 2: Distance from centre to line = radius\nd = |ax₁+by₁+c| / √(a²+b²) = r\n\nMethod 3: At point of tangency, tangent ⊥ radius\nSlope of tangent × slope of radius = -1\n\nMethod 2 is usually quickest!",
      color: "#D97706",
    },
  ],

  trigonometry: [
    {
      front: "SOHCAHTOA + Sine/Cosine Rules",
      back: "Right-angled triangles:\nSin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj\n\nAny triangle:\nSine Rule: a/sinA = b/sinB = c/sinC\n(use when you have angle + opposite side)\n\nCosine Rule: a² = b² + c² - 2bc·cosA\n(use when you have SAS or SSS)\n\nArea = ½ab·sinC",
      color: "#65A30D",
    },
    {
      front: "Trig Identities to Know",
      back: "sin²θ + cos²θ = 1\ntan θ = sinθ/cosθ\n\nCompound angles:\nsin(A±B) = sinA·cosB ± cosA·sinB\ncos(A±B) = cosA·cosB ∓ sinA·sinB\n\nDouble angle:\nsin2A = 2sinA·cosA\ncos2A = cos²A - sin²A\n       = 2cos²A - 1\n       = 1 - 2sin²A\n\nThese are ALL on the formula sheet!",
      color: "#65A30D",
    },
    {
      front: "Solving Trig Equations",
      back: "Method:\n1. Get trig function alone (e.g. sinθ = 0.5)\n2. Find reference angle from calculator\n3. Use CAST diagram for all solutions:\n   A(all) in Q1: 0°-90°\n   S(sin+) in Q2: 180°-θ\n   T(tan+) in Q3: 180°+θ\n   C(cos+) in Q4: 360°-θ\n4. Add full rotations (±360° or ±2π) if needed\n\nAlways check: is θ in degrees or radians?",
      color: "#65A30D",
    },
  ],

  geometry: [
    {
      front: "Theorems You Must Know",
      back: "• Vertically opposite angles are equal\n• Angles in a triangle sum to 180°\n• Isosceles triangle: base angles equal\n• Angle at centre = 2× angle at circumference\n• Angles in same segment are equal\n• Angle in semicircle = 90°\n• Opposite angles of cyclic quad sum to 180°\n• Tangent ⊥ radius at point of contact\n\nYou need to be able to STATE and USE these",
      color: "#16A34A",
    },
    {
      front: "How to Write a Geometry Proof",
      back: "Structure:\n1. State what you're proving\n2. Draw and label the diagram\n3. Each line: STATEMENT + REASON\n   e.g. '|AB| = |AC| (given)'\n4. Build logically to the conclusion\n\nKey phrases:\n• 'Given that...'\n• 'Since... (theorem X)'\n• 'Therefore...'\n• 'QED' or 'as required'\n\nMarks are given for reasons, not just statements!",
      color: "#16A34A",
    },
  ],

  probability: [
    {
      front: "Counting & Arrangements",
      back: "Fundamental principle: multiply choices\n3 shirts × 4 pants = 12 outfits\n\nPermutations (order matters):\nnPr = n!/(n-r)!\n\nCombinations (order doesn't matter):\nnCr = n!/[r!(n-r)!]\n\nRemember: ⁿCᵣ is on your calculator!\n\nTip: 'Choose' or 'Select' = Combination\n'Arrange' or 'Order' = Permutation",
      color: "#0D9488",
    },
    {
      front: "Bernoulli Trials",
      back: "Conditions: fixed n trials, 2 outcomes, constant p, independent\n\nP(X = r) = ⁿCᵣ × pʳ × qⁿ⁻ʳ\n\nwhere q = 1-p\n\nExample: 10 coin flips, P(exactly 3 heads)?\nn=10, r=3, p=0.5\n= ¹⁰C₃ × (0.5)³ × (0.5)⁷\n= 120 × 0.125 × 0.0078\n= 0.117 or 11.7%\n\nP(at least 1) = 1 - P(none) is a KEY trick!",
      color: "#0D9488",
    },
    {
      front: "Expected Value",
      back: "E(X) = Σ[x × P(x)]\n\nMultiply each outcome by its probability and add up\n\nExample: Roll a die\nE(X) = 1(1/6) + 2(1/6) + 3(1/6) + 4(1/6) + 5(1/6) + 6(1/6)\nE(X) = 21/6 = 3.5\n\nFair game: E(X) = 0\nIf E(X) > 0, game favours the player\nIf E(X) < 0, game favours the house",
      color: "#0D9488",
    },
  ],

  statistics: [
    {
      front: "Normal Distribution",
      back: "Bell-shaped, symmetric about the mean μ\n\nStandardise: z = (x - μ) / σ\n\nKey values:\n• 68% within 1σ of mean\n• 95% within 2σ\n• 99.7% within 3σ\n\nUse z-tables to find probabilities\nP(X < a) = P(Z < (a-μ)/σ)\n\nExam: they usually give you z-table values",
      color: "#0284C7",
    },
    {
      front: "Hypothesis Testing",
      back: "Steps:\n1. State H₀ (null) and H₁ (alternative)\n2. State significance level (usually 5%)\n3. Calculate test statistic: z = (p̂ - p₀)/√[p₀(1-p₀)/n]\n4. Find critical value from tables\n5. Compare: |z| > critical value → reject H₀\n\nKey terms:\n• p̂ = sample proportion\n• p₀ = hypothesised proportion\n• One-tail vs two-tail test",
      color: "#0284C7",
    },
    {
      front: "Confidence Intervals",
      back: "For a proportion:\np̂ ± z* × √[p̂(1-p̂)/n]\n\n95% CI: z* = 1.96\n99% CI: z* = 2.576\n\nFor a mean:\nx̄ ± z* × σ/√n\n\nMargin of error = z* × standard error\n\nInterpretation: \"We are 95% confident the true proportion lies between [lower, upper]\"",
      color: "#0284C7",
    },
  ],

  length_area_volume: [
    {
      front: "Key Area & Volume Formulae",
      back: "Areas:\nCircle: πr²\nTriangle: ½bh or ½ab·sinC\nTrapezium: ½(a+b)h\n\nVolumes:\nCylinder: πr²h\nCone: ⅓πr²h\nSphere: ⁴⁄₃πr³\n\nSurface Areas:\nCylinder: 2πr² + 2πrh\nCone: πr² + πrl  (l = slant height)\nSphere: 4πr²\n\nAll on the formula sheet — practise using them!",
      color: "#6D28D9",
    },
    {
      front: "Exam Tip: Area & Volume",
      back: "• Draw a diagram and label everything\n• Watch for composite shapes — break into simpler parts\n• Units matter: cm² for area, cm³ for volume\n• 'Exact form' means leave as π, don't use 3.14\n• For maximisation: set up formula, differentiate, set = 0\n• Common trick: express one variable in terms of another using a constraint",
      color: "#6D28D9",
    },
  ],
};
