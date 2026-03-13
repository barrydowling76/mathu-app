import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";
import { QUESTION_BANK as IMPORTED_QUESTIONS } from "./questionData.js";
import { parse, simplify, rationalize } from "mathjs";

// âââ FLOATING MATH SYMBOLS BACKGROUND âââ
const MATH_SYMBOLS = ["â", "â«", "Ï", "â", "â", "Î", "Î¸", "Â±", "â ", "â", "â", "Î»", "Ï", "Î¼", "â", "â", "â", "â", "âª", "â©", "Î±", "Î²", "Î³", "Ï", "Ï", "â", "â¤", "â", "â¨", "â©"];

const MathSymbolsBackground = ({ variant = "dark" }) => {
  const symbols = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      char: MATH_SYMBOLS[i % MATH_SYMBOLS.length],
      left: Math.random() * 100,
      size: 18 + Math.random() * 28,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * -20,
      reverse: Math.random() > 0.5,
    }))
  ).current;

  const isDark = variant === "dark";

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {symbols.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            bottom: s.reverse ? "auto" : "-40px",
            top: s.reverse ? "-40px" : "auto",
            fontSize: s.size,
            color: isDark ? "rgba(255,255,255,0.08)" : "rgba(139,92,246,0.07)",
            fontWeight: 300,
            animation: `${s.reverse ? "floatSymbolReverse" : "floatSymbol"} ${s.duration}s linear ${s.delay}s infinite`,
            userSelect: "none",
          }}
        >
          {s.char}
        </span>
      ))}
      {/* Static scattered symbols for texture */}
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={`static-${i}`}
          style={{
            position: "absolute",
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 17) % 70}%`,
            fontSize: 32 + (i * 7) % 20,
            color: isDark ? "rgba(255,255,255,0.04)" : "rgba(139,92,246,0.04)",
            fontWeight: 200,
            animation: `gentlePulse ${4 + i * 0.7}s ease-in-out ${i * 0.5}s infinite`,
            userSelect: "none",
          }}
        >
          {MATH_SYMBOLS[(i * 3) % MATH_SYMBOLS.length]}
        </span>
      ))}
    </div>
  );
};

// âââ CUSTOM SVG LOGO âââ
const MathULogo = ({ size = 72 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: "logoGlow 3s ease-in-out infinite" }}>
    {/* Background circle with gradient */}
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#6D28D9" />
      </linearGradient>
      <linearGradient id="symbolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E0D4FF" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="72" height="72" rx="20" fill="url(#logoGrad)" />
    <rect x="4" y="4" width="72" height="72" rx="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    {/* Sigma symbol - stylized */}
    <path d="M24 22h22l-14 18 14 18H24" stroke="url(#symbolGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Small accent dots */}
    <circle cx="56" cy="26" r="3" fill="rgba(255,255,255,0.5)" />
    <circle cx="60" cy="34" r="2" fill="rgba(255,255,255,0.3)" />
  </svg>
);

// âââ SMART ANSWER CHECKING âââ
// Hybrid approach: symbolic math equivalence first, then normalised string fallback
const normaliseString = (s) => s.toLowerCase().replace(/\s+/g, "").replace(/[â¬Â°]/g, "");

// Preprocess expression to add explicit * for implicit multiplication
// e.g. "2x" â "2*x", "3(x+1)" â "3*(x+1)", "x(x+2)" â "x*(x+2)"
const addImplicitMul = (expr) => {
  let s = expr.trim();
  // number followed by letter: 2x â 2*x, 3y â 3*y
  s = s.replace(/(\d)([a-zA-Z])/g, "$1*$2");
  // letter/number followed by (: x( â x*(, 2( â 2*(
  s = s.replace(/([a-zA-Z0-9)])(\()/g, "$1*$2");
  // ) followed by letter/number/(: )x â )*x, )2 â )*2, )( â )*(
  s = s.replace(/(\))([a-zA-Z0-9(])/g, "$1*$2");
  return s;
};

const isSymbolicallyEqual = (userExpr, expectedExpr) => {
  try {
    // Preprocess for implicit multiplication
    const userPrep = addImplicitMul(userExpr);
    const expPrep = addImplicitMul(expectedExpr);

    // Try to parse both as math expressions
    const userNode = parse(userPrep);
    const expectedNode = parse(expPrep);

    // Method 1: Simplify the difference â if it equals 0, they're equivalent
    try {
      const diff = simplify(`(${userPrep}) - (${expPrep})`);
      const diffStr = diff.toString();
      if (diffStr === "0") return true;
    } catch (e) { /* continue to other methods */ }

    // Method 2: Compare simplified string forms
    try {
      const userSimp = simplify(userPrep).toString().replace(/\s+/g, "");
      const expSimp = simplify(expPrep).toString().replace(/\s+/g, "");
      if (userSimp === expSimp) return true;
    } catch (e) { /* continue */ }

    // Method 3: Try rationalizing both (handles fraction equivalence)
    try {
      const userRat = rationalize(userPrep).toString().replace(/\s+/g, "");
      const expRat = rationalize(expPrep).toString().replace(/\s+/g, "");
      if (userRat === expRat) return true;
    } catch (e) { /* continue */ }

    // Method 4: Evaluate numerically at several test points (for single-variable expressions)
    try {
      const userCompiled = userNode.compile();
      const expectedCompiled = expectedNode.compile();
      const testValues = [0, 1, -1, 2, 0.5, -0.5, 3, Math.PI];
      let allMatch = true;
      let evaluated = false;
      for (const val of testValues) {
        try {
          const userVal = userCompiled.evaluate({ x: val, X: val, t: val, n: val });
          const expectedVal = expectedCompiled.evaluate({ x: val, X: val, t: val, n: val });
          if (typeof userVal === "number" && typeof expectedVal === "number") {
            evaluated = true;
            if (Math.abs(userVal - expectedVal) > 1e-9) {
              allMatch = false;
              break;
            }
          }
        } catch (e) { /* skip this test point */ }
      }
      if (evaluated && allMatch) return true;
    } catch (e) { /* continue */ }

    return false;
  } catch (e) {
    // If parsing fails entirely, expressions aren't valid math â skip symbolic check
    return false;
  }
};

const isAnswerCorrect = (userAnswer, acceptedAnswers) => {
  const userNorm = normaliseString(userAnswer);
  if (!userNorm) return false;

  // 1. Exact normalised string match (fast path)
  if (acceptedAnswers.some(a => normaliseString(a) === userNorm)) return true;

  // 2. Numeric equivalence (handles "0.5" vs "1/2" vs ".5")
  const userNum = parseFloat(userAnswer.replace(/\s/g, ""));
  if (!isNaN(userNum)) {
    for (const acc of acceptedAnswers) {
      const accNum = parseFloat(acc.replace(/\s/g, ""));
      if (!isNaN(accNum) && Math.abs(userNum - accNum) < 1e-9) return true;
    }
  }

  // 3. Symbolic math equivalence (handles 3x+5 vs 5+3x, 2(x+1) vs 2x+2, etc.)
  for (const acc of acceptedAnswers) {
    if (isSymbolicallyEqual(userAnswer.trim(), acc.trim())) return true;
  }

  return false;
};

const APP_VERSION = "1.0.0";

// âââ TOPIC DATABASE âââ
const TOPICS = {
  paper1: {
    label: "Paper 1",
    topics: {
      algebra: {
        name: "Algebra",
        icon: "ð¥",
        subtopics: ["Equations & Inequalities", "Polynomials", "Simultaneous Equations", "Algebraic Fractions", "Factoring", "Surds & Indices"],
        color: "#4F46E5"
      },
      complex_numbers: {
        name: "Complex Numbers",
        icon: "â",
        subtopics: ["Operations", "Argand Diagram", "Modulus & Argument", "De Moivre's Theorem", "Roots of Unity"],
        color: "#7C3AED"
      },
      sequences_series: {
        name: "Sequences & Series",
        icon: "Î£",
        subtopics: ["Arithmetic Sequences", "Geometric Sequences", "Series & Sigma Notation", "Sum to Infinity"],
        color: "#2563EB"
      },
      financial_maths: {
        name: "Financial Maths",
        icon: "â¬",
        subtopics: ["Compound Interest", "Depreciation", "Present Value", "Amortisation"],
        color: "#059669"
      },
      functions: {
        name: "Functions",
        icon: "Æ",
        subtopics: ["Linear & Quadratic", "Cubic & Polynomial", "Exponential & Log", "Graphing & Transformations", "Injective/Surjective/Bijective"],
        color: "#0891B2"
      },
      differentiation: {
        name: "Differentiation",
        icon: "â",
        subtopics: ["First Principles", "Rules of Differentiation", "Chain/Product/Quotient Rule", "Max & Min Problems", "Rates of Change", "Curve Sketching"],
        color: "#DC2626"
      },
      integration: {
        name: "Integration",
        icon: "$\int$",
        subtopics: ["Indefinite Integrals", "Definite Integrals", "Area Under a Curve", "Trapezoidal Rule"],
        color: "#E11D48"
      },
      induction: {
        name: "Proof by Induction",
        icon: "â´",
        subtopics: ["Summation Proofs", "Divisibility Proofs", "Inequality Proofs"],
        color: "#9333EA"
      },
      logs_indices: {
        name: "Logarithms & Indices",
        icon: "ã",
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
        icon: "â±",
        subtopics: ["Slope & Equation of a Line", "Parallel & Perpendicular Lines", "Area of a Triangle", "Division of a Line Segment"],
        color: "#EA580C"
      },
      coord_circle: {
        name: "Co-ord Geometry: Circle",
        icon: "â",
        subtopics: ["Equation of a Circle", "Tangent to a Circle", "Intersection of Line & Circle", "Two Circles"],
        color: "#D97706"
      },
      trigonometry: {
        name: "Trigonometry",
        icon: "â³",
        subtopics: ["Trig Ratios & Unit Circle", "Sine & Cosine Rules", "Trig Identities", "Compound Angle Formulae", "Solving Trig Equations", "3D Trigonometry"],
        color: "#65A30D"
      },
      geometry: {
        name: "Geometry (Theorems & Proofs)",
        icon: "â¬¡",
        subtopics: ["Theorems & Corollaries", "Geometric Proofs", "Constructions", "Enlargements & Transformations", "Similar Triangles"],
        color: "#16A34A"
      },
      probability: {
        name: "Probability",
        icon: "ð²",
        subtopics: ["Counting Principles", "Arrangements & Combinations", "Expected Value", "Bernoulli Trials", "Conditional Probability"],
        color: "#0D9488"
      },
      statistics: {
        name: "Statistics",
        icon: "ð",
        subtopics: ["Descriptive Statistics", "Normal Distribution", "Hypothesis Testing", "Confidence Intervals", "Correlation & Regression"],
        color: "#0284C7"
      },
      length_area_volume: {
        name: "Length, Area & Volume",
        icon: "ð",
        subtopics: ["Area of 2D Shapes", "Volume of 3D Solids", "Surface Area", "Composite Shapes"],
        color: "#6D28D9"
      }
    }
  }
};

// âââ QUESTION BANK (from questionData.js â PDF image-based multi-part questions) âââ
const QUESTION_BANK = IMPORTED_QUESTIONS;


// âââ BADGES âââ







// âââ BADGES âââ
const BADGES = [
  { id: "first_correct", name: "First Steps", icon: "ð", desc: "Get your first question correct", condition: s => s.totalCorrect >= 1 },
  { id: "streak_3", name: "On Fire", icon: "ð¥", desc: "3-day streak", condition: s => s.streak >= 3 },
  { id: "streak_7", name: "Unstoppable", icon: "ðª", desc: "7-day streak", condition: s => s.streak >= 7 },
  { id: "streak_30", name: "Legend", icon: "ð", desc: "30-day streak", condition: s => s.streak >= 30 },
  { id: "xp_100", name: "Century", icon: "ð¯", desc: "Earn 100 XP", condition: s => s.totalXP >= 100 },
  { id: "xp_500", name: "Scholar", icon: "ð", desc: "Earn 500 XP", condition: s => s.totalXP >= 500 },
  { id: "xp_1000", name: "Maths Master", icon: "ð", desc: "Earn 1000 XP", condition: s => s.totalXP >= 1000 },
  { id: "speed_demon", name: "Speed Demon", icon: "â¡", desc: "Answer in under 60 seconds", condition: s => s.fastestTime > 0 && s.fastestTime < 60 },
  { id: "speed_30", name: "Lightning", icon: "â¡", desc: "Answer correctly in under 30s", condition: s => s.fastestTime > 0 && s.fastestTime < 30 },
  { id: "no_hints", name: "No Help Needed", icon: "ð§ ", desc: "5 correct without hints", condition: s => s.noHintStreak >= 5 },
  { id: "perfect_week", name: "Perfect Week", icon: "â¨", desc: "7 correct in a row", condition: s => s.correctStreak >= 7 },
  { id: "all_topics", name: "Well Rounded", icon: "ð¯", desc: "Answer from every topic", condition: s => s.topicsAttempted >= 10 },
  { id: "q_50", name: "Half Century", icon: "ð", desc: "Answer 50 questions", condition: s => s.totalAttempted >= 50 },
  { id: "q_100", name: "Centurion", icon: "ð¡ï¸", desc: "Answer 100 questions", condition: s => s.totalAttempted >= 100 },
  { id: "daily_7", name: "Dedicated", icon: "ð", desc: "Complete 7 daily challenges", condition: s => s.dailyChallengesCompleted >= 7 },
  { id: "bookmark_5", name: "Collector", icon: "ð", desc: "Bookmark 5 questions", condition: s => s.bookmarkCount >= 5 },
];

// âââ LEVEL SYSTEM âââ
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

// âââ MATH TEXT RENDERER âââ
function MathText({ text, style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !text) return;

    // Split text by $...$ for inline math AND [diagram:...] for SVG diagrams
    const parts = text.split(/(\$[^$]+\$|\[diagram:[^\]]+\])/g);
    ref.current.innerHTML = '';

    parts.forEach(part => {
      if (part.startsWith('$') && part.endsWith('$')) {
        // Render LaTeX
        const mathSpan = document.createElement('span');
        try {
          if (window.katex) {
            window.katex.render(part.slice(1, -1), mathSpan, {
              throwOnError: false,
              displayMode: false
            });
          } else {
            mathSpan.textContent = part.slice(1, -1);
          }
        } catch (e) {
          mathSpan.textContent = part.slice(1, -1);
        }
        ref.current.appendChild(mathSpan);
      } else if (part.startsWith('[diagram:') && part.endsWith(']')) {
        // SVG diagram â render inline from DIAGRAMS library
        const diagramName = part.slice(9, -1);
        const container = document.createElement('div');
        container.style.margin = '16px 0';
        container.style.textAlign = 'center';
        if (DIAGRAMS[diagramName]) {
          const svg = typeof DIAGRAMS[diagramName] === 'function' ? DIAGRAMS[diagramName]() : DIAGRAMS[diagramName];
          container.innerHTML = svg;
        }
        ref.current.appendChild(container);
      } else {
        // Regular text â preserve newlines and format question parts
        const lines = part.split('\n');
        lines.forEach((line, i) => {
          // Detect question part labels like (a), (b), (c), (i), (ii), (iii), (iv)
          const partMatch = line.match(/^\s*\(([a-d]|i{1,3}|iv|v|vi)\)\s*/);
          if (partMatch) {
            // Add extra spacing before parts (a), (b), (c), (d)
            const partLetter = partMatch[1];
            if (/^[a-d]$/.test(partLetter)) {
              const spacer = document.createElement('div');
              spacer.style.height = '12px';
              ref.current.appendChild(spacer);
              // Bold the part label
              const labelSpan = document.createElement('span');
              labelSpan.style.fontWeight = '700';
              labelSpan.textContent = `(${partLetter}) `;
              ref.current.appendChild(labelSpan);
              // Rest of the line
              const restText = line.slice(partMatch[0].length);
              if (restText) {
                ref.current.appendChild(document.createTextNode(restText));
              }
            } else {
              // Sub-parts (i), (ii), etc. â indent slightly
              const subDiv = document.createElement('div');
              subDiv.style.paddingLeft = '20px';
              subDiv.style.marginTop = '4px';
              const labelSpan = document.createElement('span');
              labelSpan.style.fontWeight = '600';
              labelSpan.textContent = `(${partLetter}) `;
              subDiv.appendChild(labelSpan);
              const restText = line.slice(partMatch[0].length);
              if (restText) {
                subDiv.appendChild(document.createTextNode(restText));
              }
              ref.current.appendChild(subDiv);
            }
          } else {
            const textNode = document.createTextNode(line);
            ref.current.appendChild(textNode);
          }
          if (i < lines.length - 1) {
            ref.current.appendChild(document.createElement('br'));
          }
        });
      }
    });
  }, [text]);

  return <div ref={ref} style={{ lineHeight: 1.8, ...style }} />;
}

// âââ DIAGRAMS LIBRARY âââ
const DIAGRAMS = {
  // Right-angled triangle with sides a, b, c
  right_triangle: (a="a", b="b", c="c", angle="Î¸") => `
    <svg viewBox="0 0 200 160" style="max-width:200px;margin:8px auto;display:block">
      <polygon points="20,140 180,140 20,20" fill="none" stroke="#1e293b" stroke-width="2"/>
      <rect x="20" y="120" width="20" height="20" fill="none" stroke="#1e293b" stroke-width="1.5"/>
      <text x="100" y="158" text-anchor="middle" font-size="14" fill="#3B82F6" font-weight="700">${a}</text>
      <text x="6" y="80" text-anchor="middle" font-size="14" fill="#3B82F6" font-weight="700">${b}</text>
      <text x="110" y="72" text-anchor="middle" font-size="14" fill="#3B82F6" font-weight="700">${c}</text>
      <text x="155" y="136" text-anchor="middle" font-size="13" fill="#EF4444" font-weight="600">${angle}</text>
    </svg>`,

  // General triangle ABC with sides a, b, c
  triangle_abc: (A="A", B="B", C="C", a="a", b="b", c="c") => `
    <svg viewBox="0 0 220 180" style="max-width:220px;margin:8px auto;display:block">
      <polygon points="110,15 20,160 200,160" fill="none" stroke="#1e293b" stroke-width="2"/>
      <text x="110" y="12" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="700">${A}</text>
      <text x="12" y="175" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="700">${B}</text>
      <text x="208" y="175" text-anchor="middle" font-size="14" fill="#1e293b" font-weight="700">${C}</text>
      <text x="110" y="175" text-anchor="middle" font-size="13" fill="#3B82F6" font-weight="600">${a}</text>
      <text x="160" y="85" text-anchor="middle" font-size="13" fill="#3B82F6" font-weight="600">${b}</text>
      <text x="58" y="85" text-anchor="middle" font-size="13" fill="#3B82F6" font-weight="600">${c}</text>
    </svg>`,

  // Unit circle
  unit_circle: () => `
    <svg viewBox="0 0 240 240" style="max-width:220px;margin:8px auto;display:block">
      <line x1="20" y1="120" x2="220" y2="120" stroke="#cbd5e1" stroke-width="1"/>
      <line x1="120" y1="20" x2="120" y2="220" stroke="#cbd5e1" stroke-width="1"/>
      <circle cx="120" cy="120" r="90" fill="none" stroke="#1e293b" stroke-width="2"/>
      <line x1="120" y1="120" x2="198" y2="68" stroke="#3B82F6" stroke-width="2"/>
      <circle cx="198" cy="68" r="3" fill="#3B82F6"/>
      <text x="165" y="60" font-size="12" fill="#3B82F6" font-weight="600">(cos Î¸, sin Î¸)</text>
      <text x="155" y="105" font-size="12" fill="#EF4444" font-weight="600">Î¸</text>
      <text x="225" y="118" font-size="11" fill="#64748B">0Â°</text>
      <text x="115" y="15" font-size="11" fill="#64748B">90Â°</text>
      <text x="2" y="118" font-size="11" fill="#64748B">180Â°</text>
      <text x="112" y="235" font-size="11" fill="#64748B">270Â°</text>
    </svg>`,

  // Coordinate axes with point
  coord_axes: () => `
    <svg viewBox="0 0 200 200" style="max-width:180px;margin:8px auto;display:block">
      <line x1="20" y1="180" x2="20" y2="10" stroke="#1e293b" stroke-width="1.5" marker-end="url(#arrow)"/>
      <line x1="10" y1="170" x2="190" y2="170" stroke="#1e293b" stroke-width="1.5" marker-end="url(#arrow)"/>
      <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1e293b"/></marker></defs>
      <text x="195" y="175" font-size="12" fill="#1e293b" font-weight="600">x</text>
      <text x="25" y="12" font-size="12" fill="#1e293b" font-weight="600">y</text>
      <text x="12" y="182" font-size="11" fill="#64748B">O</text>
    </svg>`,

  // Circle with centre and radius
  circle_cr: (h="h", k="k", r="r") => `
    <svg viewBox="0 0 200 200" style="max-width:180px;margin:8px auto;display:block">
      <line x1="20" y1="180" x2="20" y2="10" stroke="#cbd5e1" stroke-width="1"/>
      <line x1="10" y1="170" x2="190" y2="170" stroke="#cbd5e1" stroke-width="1"/>
      <circle cx="110" cy="90" r="60" fill="none" stroke="#1e293b" stroke-width="2"/>
      <circle cx="110" cy="90" r="3" fill="#3B82F6"/>
      <line x1="110" y1="90" x2="170" y2="90" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="4,3"/>
      <text x="110" y="108" text-anchor="middle" font-size="12" fill="#3B82F6" font-weight="600">(${h},${k})</text>
      <text x="140" y="85" text-anchor="middle" font-size="12" fill="#EF4444" font-weight="600">${r}</text>
    </svg>`,

  // Normal distribution curve
  normal_dist: () => `
    <svg viewBox="0 0 240 120" style="max-width:220px;margin:8px auto;display:block">
      <path d="M20,100 Q60,100 80,80 Q100,40 120,20 Q140,40 160,80 Q180,100 220,100" fill="none" stroke="#1e293b" stroke-width="2"/>
      <line x1="20" y1="100" x2="220" y2="100" stroke="#cbd5e1" stroke-width="1"/>
      <line x1="120" y1="100" x2="120" y2="18" stroke="#3B82F6" stroke-width="1" stroke-dasharray="3,3"/>
      <text x="120" y="115" text-anchor="middle" font-size="11" fill="#3B82F6" font-weight="600">Î¼</text>
      <text x="80" y="115" text-anchor="middle" font-size="10" fill="#64748B">Î¼-Ï</text>
      <text x="160" y="115" text-anchor="middle" font-size="10" fill="#64748B">Î¼+Ï</text>
    </svg>`,


  // isosceles_triangle_45 - for q_326
  isosceles_triangle_45: () => `<svg viewBox='0 0 300 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Grid background -->
  <defs>
    <pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'>
      <path d='M 20 0 L 0 0 0 20' fill='none' stroke='#e5e7eb' stroke-width='0.5'/>
    </pattern>
  </defs>
  <rect width='300' height='280' fill='url(#grid)'/>
  
  <!-- Triangle ABC -->
  <!-- A at bottom left, B at bottom right, C at top -->
  <polygon points='50,220 250,220 150,70' fill='#f0f9ff' stroke='#1f2937' stroke-width='2'/>
  
  <!-- Vertices -->
  <circle cx='50' cy='220' r='5' fill='#1f2937'/>
  <circle cx='250' cy='220' r='5' fill='#1f2937'/>
  <circle cx='150' cy='70' r='5' fill='#1f2937'/>
  
  <!-- Labels -->
  <text x='35' y='240' font-size='16' font-weight='bold' fill='#1f2937'>A</text>
  <text x='255' y='240' font-size='16' font-weight='bold' fill='#1f2937'>B</text>
  <text x='150' y='45' font-size='16' font-weight='bold' fill='#1f2937'>C</text>
  
  <!-- Angle mark at C -->
  <path d='M 150,100 L 140,115 L 150,118 L 160,115 Z' fill='none' stroke='#dc2626' stroke-width='1.5'/>
  <text x='135' y='125' font-size='14' fill='#dc2626'>45Â°</text>
  
  <!-- Side label AB -->
  <text x='150' y='245' font-size='13' fill='#0891b2' text-anchor='middle'>$|AB| = 10(\\sqrt{2} - \\sqrt{2})$</text>
  
  <!-- Equal sides indicator -->
  <line x1='80' y1='150' x2='80' y2='155' stroke='#059669' stroke-width='2'/>
  <line x1='220' y1='150' x2='220' y2='155' stroke='#059669' stroke-width='2'/>
  <text x='15' y='155' font-size='12' fill='#059669'>|AC|=|BC|</text>
</svg>`,

  // circle_inscribed_angle - for q_328
  circle_inscribed_angle: () => `<svg viewBox='0 0 300 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Circle -->
  <circle cx='150' cy='140' r='100' fill='#f0f9ff' stroke='#1f2937' stroke-width='2'/>
  
  <!-- Points on circle -->
  <!-- A at left, B at right (diameter) -->
  <circle cx='50' cy='140' r='5' fill='#1f2937'/>
  <circle cx='250' cy='140' r='5' fill='#1f2937'/>
  <!-- D at top -->
  <circle cx='150' cy='45' r='5' fill='#1f2937'/>
  <!-- C at bottom right -->
  <circle cx='210' cy='210' r='5' fill='#1f2937'/>
  
  <!-- Diameter AB -->
  <line x1='50' y1='140' x2='250' y2='140' stroke='#1f2937' stroke-width='2'/>
  
  <!-- Chords -->
  <line x1='50' y1='140' x2='150' y2='45' stroke='#0891b2' stroke-width='1.5'/>
  <line x1='150' y1='45' x2='210' y2='210' stroke='#0891b2' stroke-width='1.5'/>
  <line x1='210' y1='210' x2='50' y2='140' stroke='#0891b2' stroke-width='1.5'/>
  <line x1='150' y1='45' x2='210' y2='210' stroke='#7c3aed' stroke-width='1.5' stroke-dasharray='3,3'/>
  
  <!-- Labels -->
  <text x='30' y='160' font-size='16' font-weight='bold'>A</text>
  <text x='260' y='160' font-size='16' font-weight='bold'>B</text>
  <text x='150' y='25' font-size='16' font-weight='bold'>D</text>
  <text x='225' y='230' font-size='16' font-weight='bold'>C</text>
  
  <!-- Angle mark at A (40 degrees) -->
  <path d='M 80,140 Q 95,125 105,115' fill='none' stroke='#dc2626' stroke-width='1.5'/>
  <text x='95' y='120' font-size='12' fill='#dc2626'>40Â°</text>
  
  <!-- Right angle mark at D -->
  <rect x='135' y='55' width='10' height='10' fill='none' stroke='#059669' stroke-width='1.5'/>
</svg>`,

  // rectangle_abc_p - for q_341
  rectangle_abc_p: () => `<svg viewBox='0 0 350 200' xmlns='http://www.w3.org/2000/svg'>
  <!-- Rectangle ADEC -->
  <rect x='50' y='80' width='210' height='80' fill='#f0f9ff' stroke='#1f2937' stroke-width='2'/>
  
  <!-- Points -->
  <circle cx='50' cy='160' r='4' fill='#1f2937'/>
  <circle cx='260' cy='160' r='4' fill='#1f2937'/>
  <circle cx='260' cy='80' r='4' fill='#1f2937'/>
  <circle cx='50' cy='80' r='4' fill='#1f2937'/>
  
  <!-- Point B on AC -->
  <circle cx='228' cy='160' r='4' fill='#059669'/>
  
  <!-- Point P on DE -->
  <circle cx='150' cy='80' r='4' fill='#dc2626'/>
  
  <!-- Labels for rectangle vertices -->
  <text x='30' y='180' font-size='14' font-weight='bold'>A</text>
  <text x='280' y='180' font-size='14' font-weight='bold'>C</text>
  <text x='280' y='65' font-size='14' font-weight='bold'>E</text>
  <text x='30' y='65' font-size='14' font-weight='bold'>D</text>
  
  <!-- Point labels -->
  <text x='220' y='180' font-size='12' fill='#059669'>B</text>
  <text x='150' y='55' font-size='12' fill='#dc2626'>P</text>
  
  <!-- Dimensions -->
  <text x='155' y='200' font-size='12' fill='#0891b2' text-anchor='middle'>$|AC| = 7$ m</text>
  <text x='15' y='125' font-size='12' fill='#0891b2' text-anchor='middle'>$|AD| = 2$ m</text>
  <text x='175' y='45' font-size='11' fill='#dc2626'>$x$ m</text>
  
  <!-- Distance lines -->
  <line x1='50' y1='160' x2='150' y2='80' stroke='#7c3aed' stroke-width='1' stroke-dasharray='2,2'/>
  <line x1='228' y1='160' x2='150' y2='80' stroke='#7c3aed' stroke-width='1' stroke-dasharray='2,2'/>
  <line x1='260' y1='160' x2='150' y2='80' stroke='#7c3aed' stroke-width='1' stroke-dasharray='2,2'/>
</svg>`,

  // helicopter_elevation - for q_381
  helicopter_elevation: () => `<svg viewBox='0 0 400 300' xmlns='http://www.w3.org/2000/svg'>
  <!-- Ground line -->
  <line x1='20' y1='200' x2='380' y2='200' stroke='#8b7355' stroke-width='3'/>
  
  <!-- Ground points A, B, C -->
  <circle cx='100' cy='200' r='4' fill='#1f2937'/>
  <circle cx='300' cy='200' r='4' fill='#1f2937'/>
  <circle cx='220' cy='200' r='4' fill='#1f2937'/>
  
  <!-- Helicopter D directly above A -->
  <circle cx='100' cy='80' r='6' fill='#dc2626'/>
  
  <!-- Vertical line from A to D -->
  <line x1='100' y1='200' x2='100' y2='80' stroke='#059669' stroke-width='2'/>
  
  <!-- Line from C to D (line of sight) -->
  <line x1='220' y1='200' x2='100' y2='80' stroke='#0891b2' stroke-width='2'/>
  
  <!-- Line from C to A (ground) -->
  <line x1='220' y1='200' x2='100' y2='200' stroke='#1f2937' stroke-width='1.5'/>
  
  <!-- Ground distances -->
  <line x1='100' y1='215' x2='220' y2='215' stroke='#1f2937' stroke-width='1'/>
  <text x='160' y='235' font-size='12' fill='#0891b2' text-anchor='middle'>900 m</text>
  
  <!-- Angle of elevation mark at C -->
  <path d='M 200,200 L 215,180 L 220,190' fill='none' stroke='#dc2626' stroke-width='1.5'/>
  <text x='200' y='215' font-size='11' fill='#dc2626'>30Â°</text>
  
  <!-- Labels -->
  <text x='85' y='220' font-size='14' font-weight='bold'>A</text>
  <text x='295' y='220' font-size='14' font-weight='bold'>B</text>
  <text x='215' y='220' font-size='14' font-weight='bold'>C</text>
  <text x='85' y='60' font-size='14' font-weight='bold'>D</text>
  
  <!-- Height label -->
  <text x='120' y='140' font-size='11' fill='#059669'>|AD|=?</text>
  
  <!-- Right angle mark at A -->
  <rect x='100' y='190' width='8' height='8' fill='none' stroke='#059669' stroke-width='1'/>
</svg>`,

  // two_circles_external_tangent - for q_437
  two_circles_external_tangent: () => `<svg viewBox='0 0 300 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Circle c1 (center at -3, -2, radius 2) mapped to viewport -->
  <!-- Scaled to fit: center at (80, 180), radius 30 -->
  <circle cx='80' cy='180' r='30' fill='#f0f9ff' stroke='#0891b2' stroke-width='2'/>
  
  <!-- Circle c2 (center at 1, 1, radius 3) -->
  <!-- Scaled to fit: center at (180, 100), radius 50 -->
  <circle cx='180' cy='100' r='50' fill='#f0f9ff' stroke='#7c3aed' stroke-width='2'/>
  
  <!-- Centers -->
  <circle cx='80' cy='180' r='4' fill='#1f2937'/>
  <circle cx='180' cy='100' r='4' fill='#1f2937'/>
  
  <!-- Line joining centers -->
  <line x1='80' y1='180' x2='180' y2='100' stroke='#059669' stroke-width='1.5' stroke-dasharray='3,3'/>
  
  <!-- Point of contact -->
  <circle cx='125' cy='145' r='4' fill='#dc2626'/>
  
  <!-- Tangent line (perpendicular to line of centers) -->
  <line x1='105' y1='125' x2='145' y2='165' stroke='#dc2626' stroke-width='2'/>
  
  <!-- Labels -->
  <text x='60' y='210' font-size='13' font-weight='bold'>$c_1$</text>
  <text x='190' y='60' font-size='13' font-weight='bold'>$c_2$</text>
  <text x='65' y='175' font-size='11' fill='#0891b2'>$(-3,-2)$</text>
  <text x='185' y='70' font-size='11' fill='#7c3aed'>$(1,1)$</text>
  <text x='120' y='130' font-size='11' fill='#dc2626'>$t$</text>
  
  <!-- Tangent label -->
  <text x='150' y='25' font-size='12' fill='#dc2626' text-anchor='middle'>Tangent $t$</text>
</svg>`,

  // wall_point_distance - for q_458
  wall_point_distance: () => `<svg viewBox='0 0 320 300' xmlns='http://www.w3.org/2000/svg'>
  <!-- Ground line -->
  <line x1='20' y1='220' x2='300' y2='220' stroke='#8b7355' stroke-width='3'/>
  
  <!-- Vertical wall -->
  <line x1='60' y1='220' x2='60' y2='40' stroke='#1f2937' stroke-width='4'/>
  
  <!-- Points on ground -->
  <circle cx='60' cy='220' r='5' fill='#1f2937'/>
  <circle cx='120' cy='220' r='5' fill='#059669'/>
  <circle cx='240' cy='220' r='5' fill='#0891b2'/>
  
  <!-- Point on wall -->
  <circle cx='60' cy='110' r='5' fill='#dc2626'/>
  
  <!-- Lines -->
  <line x1='60' y1='110' x2='120' y2='220' stroke='#059669' stroke-width='1.5'/>
  <line x1='60' y1='110' x2='240' y2='220' stroke='#0891b2' stroke-width='1.5'/>
  <line x1='120' y1='220' x2='240' y2='220' stroke='#1f2937' stroke-width='1.5'/>
  
  <!-- Labels -->
  <text x='45' y='240' font-size='12' font-weight='bold'>a</text>
  <text x='110' y='240' font-size='12' font-weight='bold'>f</text>
  <text x='235' y='240' font-size='12' font-weight='bold'>e</text>
  <text x='45' y='95' font-size='12' font-weight='bold'>d</text>
  
  <!-- Dimensions -->
  <text x='55' y='165' font-size='11' fill='#dc2626' text-anchor='end'>72 m</text>
  <text x='85' y='160' font-size='11' fill='#059669'>97 m</text>
  <text x='180' y='235' font-size='11' fill='#1f2937' text-anchor='middle'>35 m</text>
  <text x='160' y='200' font-size='11' fill='#0891b2'>40 m</text>
  
  <!-- Right angle mark at a -->
  <rect x='60' y='210' width='8' height='8' fill='none' stroke='#1f2937' stroke-width='1'/>
  
  <!-- Angle at f -->
  <path d='M 100,220 Q 110,210 120,200' fill='none' stroke='#ea580c' stroke-width='1.5'/>
  <text x='95' y='195' font-size='10' fill='#ea580c'>$\\angle afe$</text>
</svg>`,

  // semicircle_chord - for 2007 P2 Q4(c)
  semicircle_chord: () => `<svg viewBox="0 0 340 190" style="max-width:320px;margin:8px auto;display:block">
    <path d="M 30,150 A 140,140 0 0,1 310,150" fill="none" stroke="#1e293b" stroke-width="2"/>
    <line x1="30" y1="150" x2="310" y2="150" stroke="#1e293b" stroke-width="2"/>
    <line x1="30" y1="150" x2="260" y2="30" stroke="#3B82F6" stroke-width="2"/>
    <line x1="170" y1="150" x2="260" y2="30" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>
    <circle cx="170" cy="150" r="4" fill="#1e293b"/>
    <path d="M 60,150 A 30,30 0 0,1 54,133" fill="none" stroke="#EF4444" stroke-width="1.5"/>
    <text x="65" y="138" font-size="14" fill="#EF4444" font-style="italic">Î±</text>
    <text x="15" y="170" font-size="15" fill="#1e293b" font-style="italic" font-weight="700">a</text>
    <text x="164" y="170" font-size="15" fill="#1e293b" font-style="italic" font-weight="700">o</text>
    <text x="310" y="170" font-size="15" fill="#1e293b" font-style="italic" font-weight="700">b</text>
    <text x="265" y="25" font-size="15" fill="#1e293b" font-style="italic" font-weight="700">c</text>
  </svg>`,

  // argand_q007 - for q_007
  argand_q007: () => `<svg viewBox='0 0 320 320' xmlns='http://www.w3.org/2000/svg'><defs><style>.axis-label { font-size: 14px; font-style: italic; fill: #1e293b; } .point-label { font-size: 13px; font-style: italic; fill: #1e293b; } .value { font-size: 12px; fill: #3B82F6; }</style></defs><g><line x1='160' y1='20' x2='160' y2='300' stroke='#1e293b' stroke-width='2'/><line x1='20' y1='160' x2='300' y2='160' stroke='#1e293b' stroke-width='2'/><text x='285' y='150' class='axis-label'>Re</text><text x='155' y='35' class='axis-label'>Im</text><circle cx='160' cy='160' r='2' fill='#1e293b'/><text x='162' y='173' class='point-label'>O</text><g><circle cx='80' cy='120' r='3' fill='#1e293b'/><text x='70' y='105' class='point-label'>w = -2+2i</text></g><g><circle cx='245' cy='105' r='3' fill='#1e293b'/><text x='235' y='90' class='point-label'>u = 2â3+2i</text></g><g><text x='25' y='165' class='value'>-3</text><text x='50' y='165' class='value'>-2</text><text x='80' y='165' class='value'>-1</text><text x='200' y='165' class='value'>1</text><text x='230' y='165' class='value'>2</text><text x='260' y='165' class='value'>3</text><text x='285' y='165' class='value'>4</text></g><g><text x='155' y='290' class='value'>-1</text><text x='155' y='200' class='value'>1</text><text x='155' y='145' class='value'>2</text><text x='155' y='85' class='value'>3</text></g><g><line x1='155' y1='155' x2='160' y2='160' stroke='#1e293b' stroke-width='1'/><line x1='160' y1='160' x2='165' y2='155' stroke='#1e293b' stroke-width='1'/></g></g></svg>`,

  // graph_q022 - for q_022
  graph_q022: () => `<svg viewBox='0 0 340 300' xmlns='http://www.w3.org/2000/svg'><defs><style>.axis-label { font-size: 13px; font-style: italic; fill: #1e293b; } .region-label { font-size: 11px; fill: #1e293b; font-weight: bold; } .grid-text { font-size: 11px; fill: #666; }</style></defs><g><line x1='40' y1='250' x2='320' y2='250' stroke='#1e293b' stroke-width='2'/><line x1='40' y1='20' x2='40' y2='250' stroke='#1e293b' stroke-width='2'/><text x='310' y='270' class='axis-label'>x</text><text x='20' y='25' class='axis-label'>y</text><g stroke='#1e293b' stroke-width='1' stroke-dasharray='2,2' opacity='0.5'><line x1='80' y1='250' x2='80' y2='20'/><line x1='120' y1='250' x2='120' y2='20'/><line x1='160' y1='250' x2='160' y2='20'/><line x1='200' y1='250' x2='200' y2='20'/><line x1='240' y1='250' x2='240' y2='20'/><line x1='280' y1='250' x2='280' y2='20'/><line x1='40' y1='210' x2='320' y2='210'/><line x1='40' y1='170' x2='320' y2='170'/><line x1='40' y1='130' x2='320' y2='130'/><line x1='40' y1='90' x2='320' y2='90'/><line x1='40' y1='50' x2='320' y2='50'/></g><g><path d='M 80 230 Q 160 100 280 80' stroke='#1e293b' stroke-width='2.5' fill='none'/><text x='85' y='255' class='grid-text'>0</text><text x='155' y='255' class='grid-text'>2</text><text x='195' y='255' class='grid-text'>4</text><text x='235' y='255' class='grid-text'>6</text><text x='35' y='255' class='grid-text'>-1</text><text x='35' y='215' class='grid-text'>1</text><text x='35' y='175' class='grid-text'>2</text><text x='35' y='135' class='grid-text'>3</text><text x='30' y='95' class='grid-text'>4</text></g><g><rect x='80' y='170' width='80' height='80' fill='#3B82F6' opacity='0.15' stroke='#3B82F6' stroke-width='1' stroke-dasharray='3,3'/><text x='100' y='220' class='region-label'>K</text></g><g><rect x='160' y='100' width='80' height='70' fill='#EF4444' opacity='0.15' stroke='#EF4444' stroke-width='1' stroke-dasharray='3,3'/><text x='180' y='145' class='region-label'>L</text></g><g><rect x='240' y='50' width='80' height='50' fill='#10B981' opacity='0.15' stroke='#10B981' stroke-width='1' stroke-dasharray='3,3'/><text x='255' y='85' class='region-label'>N</text></g></g></svg>`,

  // cogs_q179 - for q_179
  cogs_q179: () => `<svg viewBox='0 0 340 280' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 13px; font-style: italic; fill: #1e293b; } .center-point { font-size: 12px; font-style: italic; fill: #1e293b; font-weight: bold; }</style></defs><g><rect x='50' y='50' width='240' height='200' fill='none' stroke='#ddd' stroke-width='1' stroke-dasharray='2,2'/><text x='120' y='35' class='label'>12</text><text x='70' y='125' class='label'>9</text><text x='250' y='125' class='label'>3</text><text x='135' y='250' class='label'>6</text><circle cx='170' cy='120' r='50' fill='none' stroke='#1e293b' stroke-width='2.5'/><text x='140' y='155' class='center-point'>D</text><circle cx='100' cy='155' r='25' fill='none' stroke='#1e293b' stroke-width='2.5'/><text x='85' y='175' class='center-point'>E</text><circle cx='110' cy='120' r='3' fill='#1e293b'/><line x1='170' y1='120' x2='100' y2='155' stroke='#1e293b' stroke-width='1.5' stroke-dasharray='2,2'/><text x='125' y='130' class='label' font-size='11'>distance</text><g stroke='#1e293b' stroke-width='1.5'><line x1='170' y1='65' x2='170' y2='55'/><line x1='170' y1='175' x2='170' y2='185'/><line x1='125' y1='120' x2='115' y2='120'/><line x1='215' y1='120' x2='225' y2='120'/></g><g><path d='M 170 70 L 175 68 L 173 73 Z' fill='#1e293b'/></g></g></svg>`,

  // tree_q180 - for q_180
  tree_q180: () => `<svg viewBox='0 0 360 240' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; fill: #1e293b; } .prob { font-size: 11px; fill: #3B82F6; font-weight: bold; } .event { font-size: 11px; fill: #1e293b; }</style></defs><g><circle cx='30' cy='120' r='8' fill='#1e293b'/><text x='50' y='125' class='label'>Random person</text><line x1='38' y1='110' x2='90' y2='80' stroke='#1e293b' stroke-width='2'/><line x1='38' y1='130' x2='90' y2='160' stroke='#1e293b' stroke-width='2'/><text x='50' y='85' class='prob'>0.003</text><text x='50' y='165' class='prob'>0.997</text><circle cx='100' cy='80' r='6' fill='#1e293b'/><circle cx='100' cy='160' r='6' fill='#1e293b'/><text x='110' y='75' class='event'>Has disease</text><text x='110' y='165' class='event'>No disease</text><line x1='106' y1='75' x2='150' y2='50' stroke='#1e293b' stroke-width='2'/><line x1='106' y1='85' x2='150' y2='110' stroke='#1e293b' stroke-width='2'/><line x1='106' y1='155' x2='150' y2='130' stroke='#1e293b' stroke-width='2'/><line x1='106' y1='165' x2='150' y2='190' stroke='#1e293b' stroke-width='2'/><text x='120' y='55' class='prob'>0.99</text><text x='120' y='105' class='prob'>0.01</text><text x='120' y='140' class='prob'>0.04</text><text x='120' y='185' class='prob'>0.96</text><circle cx='160' cy='50' r='5' fill='#1e293b'/><circle cx='160' cy='110' r='5' fill='#1e293b'/><circle cx='160' cy='130' r='5' fill='#1e293b'/><circle cx='160' cy='190' r='5' fill='#1e293b'/><text x='170' y='53' class='event'>Test +</text><text x='170' y='113' class='event'>Test -</text><text x='170' y='133' class='event'>Test +</text><text x='170' y='193' class='event'>Test -</text></g></svg>`,

  // golf_q191 - for q_191
  golf_q191: () => `<svg viewBox='0 0 340 280' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; font-style: italic; fill: #1e293b; } .measure { font-size: 11px; fill: #3B82F6; font-weight: bold; } .angle { font-size: 11px; fill: #EF4444; font-weight: bold; }</style></defs><g><circle cx='170' cy='150' r='70' fill='none' stroke='#1e293b' stroke-width='2.5'/><circle cx='170' cy='150' r='3' fill='#1e293b'/><text x='175' y='155' class='label'>O (center)</text><line x1='50' y1='150' x2='170' y2='150' stroke='#1e293b' stroke-width='2'/><text x='80' y='140' class='measure'>150 m</text><circle cx='50' cy='150' r='4' fill='#1e293b'/><text x='35' y='155' class='label'>Joan</text><g><path d='M 70 150 A 20 20 0 0 0 78 105' stroke='#EF4444' stroke-width='2' fill='none'/><text x='70' y='120' class='angle'>Î±</text></g><line x1='170' y1='150' x2='160' y2='75' stroke='#1e293b' stroke-width='2'/><line x1='170' y1='150' x2='180' y2='75' stroke='#1e293b' stroke-width='2'/><text x='165' y='65' class='measure'>30 m diam</text><path d='M 160 75 A 20 20 0 0 0 180 75' stroke='#1e293b' stroke-width='2' fill='none'/><g stroke='#1e293b' stroke-width='1' stroke-dasharray='2,2'><line x1='170' y1='150' x2='160' y2='75'/><line x1='170' y1='150' x2='180' y2='75'/></g></g></svg>`,

  // trajectory_q198 - for q_198
  trajectory_q198: () => `<svg viewBox='0 0 360 260' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; font-style: italic; fill: #1e293b; } .coord { font-size: 10px; fill: #3B82F6; } .axis-label { font-size: 12px; font-style: italic; fill: #1e293b; }</style></defs><g><line x1='30' y1='220' x2='340' y2='220' stroke='#1e293b' stroke-width='2'/><line x1='30' y1='220' x2='30' y2='20' stroke='#1e293b' stroke-width='2'/><text x='330' y='240' class='axis-label'>x</text><text x='10' y='25' class='axis-label'>y</text><g stroke='#1e293b' stroke-width='1' opacity='0.3'><line x1='80' y1='220' x2='80' y2='20'/><line x1='130' y1='220' x2='130' y2='20'/><line x1='180' y1='220' x2='180' y2='20'/><line x1='230' y1='220' x2='230' y2='20'/><line x1='280' y1='220' x2='280' y2='20'/><line x1='30' y1='180' x2='340' y2='180'/><line x1='30' y1='140' x2='340' y2='140'/><line x1='30' y1='100' x2='340' y2='100'/><line x1='30' y1='60' x2='340' y2='60'/></g><g><text x='75' y='235' class='coord'>1</text><text x='125' y='235' class='coord'>2</text><text x='175' y='235' class='coord'>3</text><text x='225' y='235' class='coord'>4</text><text x='275' y='235' class='coord'>5</text><text x='10' y='225' class='coord'>0</text><text x='10' y='185' class='coord'>1</text><text x='10' y='145' class='coord'>2</text><text x='10' y='105' class='coord'>3</text><text x='10' y='65' class='coord'>4</text></g><path d='M 25 150 Q 150 50 310 190' stroke='#1e293b' stroke-width='2.5' fill='none'/><circle cx='25' cy='150' r='4' fill='#1e293b'/><circle cx='310' cy='190' r='4' fill='#1e293b'/><text x='15' y='165' class='label'>A</text><text x='310' y='210' class='label'>B</text></g></svg>`,

  // cubic_curve_q211 - for q_211
  cubic_curve_q211: () => `<svg viewBox='0 0 360 300' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; font-style: italic; fill: #1e293b; } .tick { font-size: 10px; fill: #666; } .curve-label { font-size: 11px; fill: #1e293b; font-weight: bold; }</style></defs><g><line x1='40' y1='250' x2='340' y2='250' stroke='#1e293b' stroke-width='2'/><line x1='40' y1='20' x2='40' y2='250' stroke='#1e293b' stroke-width='2'/><text x='330' y='270' class='label'>x</text><text x='20' y='25' class='label'>y</text><g stroke='#1e293b' stroke-width='0.8' opacity='0.2'><line x1='80' y1='250' x2='80' y2='20'/><line x1='120' y1='250' x2='120' y2='20'/><line x1='160' y1='250' x2='160' y2='20'/><line x1='200' y1='250' x2='200' y2='20'/><line x1='240' y1='250' x2='240' y2='20'/><line x1='280' y1='250' x2='280' y2='20'/><line x1='320' y1='250' x2='320' y2='20'/><line x1='40' y1='210' x2='340' y2='210'/><line x1='40' y1='170' x2='340' y2='170'/><line x1='40' y1='130' x2='340' y2='130'/><line x1='40' y1='90' x2='340' y2='90'/><line x1='40' y1='50' x2='340' y2='50'/></g><g><text x='75' y='265' class='tick'>2</text><text x='115' y='265' class='tick'>4</text><text x='155' y='265' class='tick'>6</text><text x='195' y='265' class='tick'>8</text><text x='235' y='265' class='tick'>10</text><text x='30' y='255' class='tick'>-1</text><text x='30' y='215' class='tick'>1</text><text x='30' y='175' class='tick'>2</text><text x='30' y='135' class='tick'>3</text><text x='30' y='95' class='tick'>4</text><text x='30' y='55' class='tick'>5</text></g><path d='M 60 220 Q 120 140 200 130 Q 240 125 280 160' stroke='#1e293b' stroke-width='2.5' fill='none'/><path d='M 280 160 Q 310 190 330 230' stroke='#1e293b' stroke-width='2.5' fill='none'/><line x1='120' y1='250' x2='120' y2='140' stroke='#3B82F6' stroke-width='1.5' stroke-dasharray='2,2'/><line x1='240' y1='250' x2='240' y2='160' stroke='#3B82F6' stroke-width='1.5' stroke-dasharray='2,2'/><line x1='40' y1='140' x2='120' y2='140' stroke='#3B82F6' stroke-width='1.5' stroke-dasharray='2,2'/><line x1='40' y1='160' x2='240' y2='160' stroke='#3B82F6' stroke-width='1.5' stroke-dasharray='2,2'/><text x='100' y='110' class='curve-label'>p(x)</text><text x='260' y='120' class='curve-label'>l(x)</text></g></svg>`,

  // argand_circle_q273 - for q_273
  argand_circle_q273: () => `<svg viewBox='0 0 320 320' xmlns='http://www.w3.org/2000/svg'><defs><style>.axis-label { font-size: 14px; font-style: italic; fill: #1e293b; } .point-label { font-size: 13px; font-style: italic; fill: #1e293b; } .value { font-size: 12px; fill: #3B82F6; }</style></defs><g><line x1='160' y1='20' x2='160' y2='300' stroke='#1e293b' stroke-width='2'/><line x1='20' y1='160' x2='300' y2='160' stroke='#1e293b' stroke-width='2'/><text x='285' y='150' class='axis-label'>Re</text><text x='155' y='35' class='axis-label'>Im</text><circle cx='160' cy='160' r='2' fill='#1e293b'/><text x='162' y='175' class='point-label'>O</text><g><circle cx='120' cy='180' r='3' fill='#1e293b'/><text x='105' y='195' class='point-label'>z = 6+2i</text></g><g><circle cx='200' cy='120' r='3' fill='#1e293b'/><text x='210' y='105' class='point-label'>iz</text></g><circle cx='160' cy='150' r='30' fill='none' stroke='#1e293b' stroke-width='2' stroke-dasharray='2,2'/><text x='150' y='110' class='point-label'>c</text><g><text x='25' y='165' class='value'>-3</text><text x='50' y='165' class='value'>-2</text><text x='80' y='165' class='value'>-1</text><text x='200' y='165' class='value'>1</text><text x='230' y='165' class='value'>2</text><text x='260' y='165' class='value'>3</text></g><g><text x='155' y='290' class='value'>-1</text><text x='155' y='200' class='value'>1</text><text x='155' y='150' class='value'>2</text><text x='155' y='90' class='value'>3</text><text x='155' y='50' class='value'>4</text></g><line x1='160' y1='160' x2='120' y2='180' stroke='#1e293b' stroke-width='1.5' stroke-dasharray='2,2'/><line x1='160' y1='160' x2='200' y2='120' stroke='#1e293b' stroke-width='1.5' stroke-dasharray='2,2'/></g></svg>`,

  // exponential_linear_q282 - for q_282
  exponential_linear_q282: () => `<svg viewBox='0 0 360 300' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; font-style: italic; fill: #1e293b; } .graph-label { font-size: 11px; fill: #1e293b; font-weight: bold; } .tick { font-size: 10px; fill: #666; }</style></defs><g><line x1='40' y1='250' x2='340' y2='250' stroke='#1e293b' stroke-width='2'/><line x1='40' y1='20' x2='40' y2='250' stroke='#1e293b' stroke-width='2'/><text x='330' y='270' class='label'>x</text><text x='15' y='25' class='label'>y</text><g stroke='#1e293b' stroke-width='0.8' opacity='0.2'><line x1='80' y1='250' x2='80' y2='20'/><line x1='120' y1='250' x2='120' y2='20'/><line x1='160' y1='250' x2='160' y2='20'/><line x1='200' y1='250' x2='200' y2='20'/><line x1='240' y1='250' x2='240' y2='20'/><line x1='280' y1='250' x2='280' y2='20'/><line x1='40' y1='200' x2='340' y2='200'/><line x1='40' y1='150' x2='340' y2='150'/><line x1='40' y1='100' x2='340' y2='100'/><line x1='40' y1='50' x2='340' y2='50'/></g><g><text x='75' y='265' class='tick'>0.5</text><text x='115' y='265' class='tick'>1</text><text x='155' y='265' class='tick'>1.5</text><text x='195' y='265' class='tick'>2</text><text x='235' y='265' class='tick'>2.5</text><text x='30' y='255' class='tick'>0</text><text x='25' y='205' class='tick'>1</text><text x='25' y='155' class='tick'>2</text><text x='25' y='105' class='tick'>3</text><text x='25' y='55' class='tick'>4</text></g><path d='M 60 240 Q 120 180 200 100 Q 240 60 280 40' stroke='#1e293b' stroke-width='2.5' fill='none'/><text x='220' y='70' class='graph-label'>f(x) = e^(2x)</text><line x1='60' y1='220' x2='280' y2='100' stroke='#3B82F6' stroke-width='2'/><text x='160' y='180' class='graph-label'>g(x) = 2x - 1</text><circle cx='115' cy='178' r='3' fill='#EF4444'/><text x='110' y='155' class='label'>â1.9</text></g></svg>`,

  // flight_path_q299 - for q_299
  flight_path_q299: () => `<svg viewBox='0 0 360 280' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; font-style: italic; fill: #1e293b; } .point-label { font-size: 11px; fill: #1e293b; font-weight: bold; } .distance { font-size: 10px; fill: #3B82F6; } .angle-text { font-size: 10px; fill: #EF4444; }</style></defs><g><g><circle cx='60' cy='220' r='4' fill='#1e293b'/><text x='40' y='240' class='point-label'>A</text><circle cx='200' cy='100' r='4' fill='#1e293b'/><text x='200' y='80' class='point-label'>B</text><circle cx='320' cy='200' r='4' fill='#1e293b'/><text x='320' y='220' class='point-label'>C</text></g><line x1='60' y1='220' x2='200' y2='100' stroke='#1e293b' stroke-width='2'/><line x1='200' y1='100' x2='320' y2='200' stroke='#1e293b' stroke-width='2'/><line x1='60' y1='220' x2='320' y2='200' stroke='#1e293b' stroke-width='1.5' stroke-dasharray='3,3'/><text x='110' y='140' class='distance'>840 km</text><text x='240' y='130' class='distance'>840 km</text><text x='180' y='220' class='distance'>1450 km</text><g><path d='M 85 195 A 25 25 0 0 0 115 185' stroke='#EF4444' stroke-width='2' fill='none'/><text x='90' y='175' class='angle-text'>8.57Â°</text></g><g><path d='M 210 125 A 20 20 0 0 0 240 110' stroke='#EF4444' stroke-width='2' fill='none'/><text x='215' y='105' class='angle-text'>20Â°</text></g></g></svg>`,

  // norman_window_q300 - for q_300
  norman_window_q300: () => `<svg viewBox='0 0 280 320' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; font-style: italic; fill: #1e293b; } .dimension { font-size: 11px; fill: #3B82F6; }</style></defs><g><g><rect x='50' y='120' width='180' height='120' fill='none' stroke='#1e293b' stroke-width='2'/><path d='M 50 120 A 90 90 0 0 1 230 120' fill='none' stroke='#1e293b' stroke-width='2'/></g><g><line x1='140' y1='240' x2='140' y2='260' stroke='#1e293b' stroke-width='1.5'/><line x1='130' y1='260' x2='150' y2='260' stroke='#1e293b' stroke-width='1.5'/><text x='115' y='280' class='dimension'>y</text><line x1='50' y1='145' x2='230' y2='145' stroke='#1e293b' stroke-width='1.5'/><line x1='50' y1='135' x2='50' y2='155' stroke='#1e293b' stroke-width='1.5'/><line x1='230' y1='135' x2='230' y2='155' stroke='#1e293b' stroke-width='1.5'/><text x='130' y='160' class='dimension'>2x</text></g><g><line x1='140' y1='80' x2='140' y2='120' stroke='#1e293b' stroke-width='1.5' stroke-dasharray='2,2'/><line x1='130' y1='80' x2='150' y2='80' stroke='#1e293b' stroke-width='1.5'/><line x1='130' y1='120' x2='150' y2='120' stroke='#1e293b' stroke-width='1.5'/><text x='150' y='105' class='dimension'>x</text></g><circle cx='140' cy='120' r='3' fill='#1e293b'/><text x='145' y='115' class='label'>C</text><line x1='50' y1='120' x2='140' y2='120' stroke='#1e293b' stroke-width='1' stroke-dasharray='2,2'/><line x1='230' y1='120' x2='140' y2='120' stroke='#1e293b' stroke-width='1' stroke-dasharray='2,2'/></g></svg>`,

  // triangle_geometry_q326 - for q_326
  triangle_geometry_q326: () => `<svg viewBox='0 0 340 300' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; font-style: italic; fill: #1e293b; } .side-label { font-size: 11px; fill: #3B82F6; } .angle-label { font-size: 11px; fill: #EF4444; }</style></defs><g><g><circle cx='80' cy='240' r='3' fill='#1e293b'/><text x='60' y='260' class='label'>A</text><circle cx='280' cy='240' r='3' fill='#1e293b'/><text x='280' y='260' class='label'>B</text><circle cx='180' cy='60' r='3' fill='#1e293b'/><text x='180' y='40' class='label'>C</text></g><line x1='80' y1='240' x2='280' y2='240' stroke='#1e293b' stroke-width='2.5'/><line x1='280' y1='240' x2='180' y2='60' stroke='#1e293b' stroke-width='2.5'/><line x1='180' y1='60' x2='80' y2='240' stroke='#1e293b' stroke-width='2.5'/><text x='170' y='255' class='side-label'>10â2-â2</text><text x='220' y='140' class='side-label'>|AC|</text><text x='100' y='140' class='side-label'>|BC|</text><g><path d='M 95 240 A 15 15 0 0 0 87 225' stroke='#EF4444' stroke-width='2' fill='none'/><text x='85' y='235' class='angle-label'>45Â°</text></g><text x='160' y='200' class='label'>|AC| = |BC|</text></g></svg>`,

  // quadrilateral_circle_q328 - for q_328
  quadrilateral_circle_q328: () => `<svg viewBox='0 0 340 320' xmlns='http://www.w3.org/2000/svg'><defs><style>.label { font-size: 12px; font-style: italic; fill: #1e293b; } .point-label { font-size: 11px; fill: #1e293b; font-weight: bold; }</style></defs><g><circle cx='170' cy='160' r='100' fill='none' stroke='#1e293b' stroke-width='2'/><g><circle cx='80' cy='100' r='3' fill='#1e293b'/><text x='65' y='95' class='point-label'>A</text><circle cx='260' cy='80' r='3' fill='#1e293b'/><text x='265' y='75' class='point-label'>B</text><circle cx='270' cy='220' r='3' fill='#1e293b'/><text x='275' y='220' class='point-label'>C</text><circle cx='60' cy='210' r='3' fill='#1e293b'/><text x='40' y='220' class='point-label'>D</text></g><line x1='80' y1='100' x2='260' y2='80' stroke='#1e293b' stroke-width='2'/><line x1='260' y1='80' x2='270' y2='220' stroke='#1e293b' stroke-width='2'/><line x1='270' y1='220' x2='60' y2='210' stroke='#1e293b' stroke-width='2'/><line x1='60' y1='210' x2='80' y2='100' stroke='#1e293b' stroke-width='2'/><line x1='80' y1='100' x2='270' y2='220' stroke='#1e293b' stroke-width='1.5' stroke-dasharray='3,3'/><line x1='260' y1='80' x2='60' y2='210' stroke='#1e293b' stroke-width='1.5' stroke-dasharray='3,3'/><circle cx='170' cy='160' r='3' fill='#1e293b'/><text x='175' y='165' class='point-label'>O</text></g></svg>`,

  // function_mapping_diagram - for q_332
  function_mapping_diagram: () => `<svg viewBox='0 0 400 250' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='200' y='25' font-size='16' font-weight='bold' text-anchor='middle' fill='#1e293b'>Function Mapping: f: A â B, g: B â C</text>
  
  <!-- Set A (left) -->
  <circle cx='80' cy='130' r='50' fill='none' stroke='#1e293b' stroke-width='2'/>
  <text x='50' y='200' font-size='14' font-weight='bold' fill='#1e293b'>A</text>
  <text x='70' y='120' font-size='12' fill='#1e293b'>1</text>
  <text x='70' y='145' font-size='12' fill='#1e293b'>2</text>
  <text x='75' y='155' font-size='12' fill='#1e293b'>3</text>
  <text x='70' y='170' font-size='12' fill='#1e293b'>4</text>
  
  <!-- Set B (middle) -->
  <circle cx='200' cy='130' r='40' fill='none' stroke='#1e293b' stroke-width='2'/>
  <text x='170' y='200' font-size='14' font-weight='bold' fill='#1e293b'>B</text>
  <text x='190' y='125' font-size='12' fill='#1e293b'>a</text>
  <text x='190' y='145' font-size='12' fill='#1e293b'>b</text>
  <text x='190' y='165' font-size='12' fill='#1e293b'>c</text>
  
  <!-- Set C (right) -->
  <circle cx='320' cy='130' r='50' fill='none' stroke='#1e293b' stroke-width='2'/>
  <text x='340' y='200' font-size='14' font-weight='bold' fill='#1e293b'>C</text>
  <text x='310' y='115' font-size='12' fill='#1e293b'>x</text>
  <text x='310' y='135' font-size='12' fill='#1e293b'>w</text>
  <text x='310' y='155' font-size='12' fill='#1e293b'>y</text>
  <text x='310' y='175' font-size='12' fill='#1e293b'>z</text>
  
  <!-- Arrows f: A â B -->
  <path d='M 120 115 L 165 120' stroke='#1e293b' stroke-width='2' fill='none' marker-end='url(#arrowhead)'/>
  <path d='M 125 130 L 165 130' stroke='#1e293b' stroke-width='2' fill='none' marker-end='url(#arrowhead)'/>
  <path d='M 125 148 L 168 145' stroke='#1e293b' stroke-width='2' fill='none' marker-end='url(#arrowhead)'/>
  <path d='M 120 160 L 165 155' stroke='#1e293b' stroke-width='2' fill='none' marker-end='url(#arrowhead)'/>
  
  <!-- Arrows g: B â C -->
  <path d='M 235 120 L 280 115' stroke='#1e293b' stroke-width='2' fill='none' marker-end='url(#arrowhead)'/>
  <path d='M 238 135 L 280 135' stroke='#1e293b' stroke-width='2' fill='none' marker-end='url(#arrowhead)'/>
  <path d='M 235 150 L 280 160' stroke='#1e293b' stroke-width='2' fill='none' marker-end='url(#arrowhead)'/>
  
  <!-- Labels -->
  <text x='140' y='105' font-size='11' fill='#1e293b'>f</text>
  <text x='260' y='105' font-size='11' fill='#1e293b'>g</text>
  
  <!-- Arrow marker definition -->
  <defs>
    <marker id='arrowhead' markerWidth='10' markerHeight='10' refX='9' refY='3' orient='auto'>
      <polygon points='0 0, 10 3, 0 6' fill='#1e293b'/>
    </marker>
  </defs>
</svg>`,

  // cubic_graph - for q_336
  cubic_graph: () => `<svg viewBox='0 0 360 300' xmlns='http://www.w3.org/2000/svg'>
  <!-- Grid background -->
  <rect width='360' height='300' fill='#f8f9fa'/>
  
  <!-- Axes -->
  <line x1='40' y1='250' x2='340' y2='250' stroke='#1e293b' stroke-width='2'/>
  <line x1='40' y1='30' x2='40' y2='250' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Axis labels -->
  <text x='330' y='270' font-size='12' fill='#1e293b'>x</text>
  <text x='20' y='40' font-size='12' fill='#1e293b'>y</text>
  
  <!-- Tick marks and labels on x-axis -->
  <line x1='60' y1='245' x2='60' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='55' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>-3</text>
  <line x1='100' y1='245' x2='100' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='100' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>-2</text>
  <line x1='140' y1='245' x2='140' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='140' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>-1</text>
  <line x1='180' y1='245' x2='180' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='180' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>0</text>
  <line x1='220' y1='245' x2='220' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='220' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>1</text>
  <line x1='260' y1='245' x2='260' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='260' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>2</text>
  
  <!-- Tick marks and labels on y-axis -->
  <line x1='35' y1='230' x2='45' y2='230' stroke='#1e293b' stroke-width='1'/>
  <text x='28' y='235' font-size='10' text-anchor='end' fill='#1e293b'>5</text>
  <line x1='35' y1='190' x2='45' y2='190' stroke='#1e293b' stroke-width='1'/>
  <line x1='35' y1='150' x2='45' y2='150' stroke='#1e293b' stroke-width='1'/>
  <line x1='35' y1='110' x2='45' y2='110' stroke='#1e293b' stroke-width='1'/>
  <line x1='35' y1='70' x2='45' y2='70' stroke='#1e293b' stroke-width='1'/>
  <text x='28' y='75' font-size='10' text-anchor='end' fill='#1e293b'>-5</text>
  
  <!-- Cubic curve f(x) = xÂ³ + 2xÂ² - 5x - 6 -->
  <!-- Points plotted: (-3,0), (-1,0), (2,0), (0,-6) -->
  <path d='M 60 250 Q 80 160 100 110 Q 120 80 140 250 Q 160 350 180 250 Q 200 180 220 120 Q 240 90 260 130 Q 280 200 300 290' 
        stroke='#1e293b' stroke-width='2' fill='none'/>
  
  <!-- Points where curve crosses x-axis -->
  <circle cx='60' cy='250' r='3' fill='#EF4444'/>
  <text x='60' y='285' font-size='9' text-anchor='middle' fill='#EF4444' font-style='italic'>-3</text>
  
  <circle cx='140' cy='250' r='3' fill='#EF4444'/>
  <text x='140' y='285' font-size='9' text-anchor='middle' fill='#EF4444' font-style='italic'>-1</text>
  
  <circle cx='260' cy='250' r='3' fill='#EF4444'/>
  <text x='260' y='285' font-size='9' text-anchor='middle' fill='#EF4444' font-style='italic'>2</text>
  
  <!-- y-intercept -->
  <circle cx='180' cy='106' r='3' fill='#3B82F6'/>
  <text x='195' y='106' font-size='9' fill='#3B82F6' font-style='italic'>(0,-6)</text>
</svg>`,

  // rectangle_distances - for q_341
  rectangle_distances: () => `<svg viewBox='0 0 360 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Rectangle ADEC -->
  <rect x='80' y='100' width='200' height='100' fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Vertices labels -->
  <text x='70' y='110' font-size='13' font-weight='bold' fill='#1e293b'>A</text>
  <text x='70' y='215' font-size='13' font-weight='bold' fill='#1e293b'>D</text>
  <text x='285' y='215' font-size='13' font-weight='bold' fill='#1e293b'>E</text>
  <text x='285' y='110' font-size='13' font-weight='bold' fill='#1e293b'>C</text>
  
  <!-- Point B on AC, 5m from A -->
  <circle cx='145' cy='100' r='4' fill='#3B82F6'/>
  <text x='145' y='85' font-size='13' font-weight='bold' fill='#1e293b'>B</text>
  
  <!-- Point P on DE, x metres from D -->
  <circle cx='130' cy='200' r='4' fill='#3B82F6'/>
  <text x='130' y='225' font-size='13' font-weight='bold' fill='#1e293b'>P</text>
  
  <!-- Distance labels -->
  <text x='105' y='92' font-size='11' fill='#3B82F6' font-style='italic'>5 m</text>
  <text x='225' y='92' font-size='11' fill='#3B82F6' font-style='italic'>2 m</text>
  <text x='30' y='155' font-size='11' fill='#3B82F6' font-style='italic'>2 m</text>
  <text x='115' y='220' font-size='11' fill='#3B82F6' font-style='italic'>x m</text>
  
  <!-- Dimension annotations -->
  <!-- Top edge: 7m total -->
  <line x1='80' y1='85' x2='280' y2='85' stroke='#3B82F6' stroke-width='1'/>
  <line x1='80' y1='80' x2='80' y2='90' stroke='#3B82F6' stroke-width='1'/>
  <line x1='280' y1='80' x2='280' y2='90' stroke='#3B82F6' stroke-width='1'/>
  <text x='180' y='75' font-size='10' text-anchor='middle' fill='#3B82F6'>|AC| = 7 m</text>
  
  <!-- Right edge: 2m height -->
  <line x1='295' y1='100' x2='295' y2='200' stroke='#3B82F6' stroke-width='1'/>
  <line x1='290' y1='100' x2='300' y2='100' stroke='#3B82F6' stroke-width='1'/>
  <line x1='290' y1='200' x2='300' y2='200' stroke='#3B82F6' stroke-width='1'/>
  <text x='315' y='155' font-size='10' text-anchor='middle' fill='#3B82F6'>|AD| = 2 m</text>
  
  <!-- Bottom edge label -->
  <text x='180' y='250' font-size='10' text-anchor='middle' fill='#3B82F6'>|DE| = 7 m</text>
</svg>`,

  // running_track_arc - for q_343
  running_track_arc: () => `<svg viewBox='0 0 380 220' xmlns='http://www.w3.org/2000/svg'>
  <!-- Center O -->
  <circle cx='190' cy='110' r='3' fill='#1e293b'/>
  <text x='195' y='115' font-size='12' font-weight='bold' fill='#1e293b'>O</text>
  
  <!-- Inner circle (Kate's lane) -->
  <circle cx='190' cy='110' r='60' fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Outer circle (Helen's lane) -->
  <circle cx='190' cy='110' r='78' fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Lane width indicator -->
  <line x1='190' y1='32' x2='190' y2='50' stroke='#3B82F6' stroke-width='2'/>
  <text x='205' y='42' font-size='10' fill='#3B82F6' font-style='italic'>1.2 m</text>
  
  <!-- Arc for Kate: from A to B -->
  <path d='M 250 110 A 60 60 0 0 1 190 50' fill='none' stroke='#1e293b' stroke-width='2' stroke-dasharray='5,5'/>
  <text x='250' y='125' font-size='11' font-weight='bold' fill='#1e293b'>A</text>
  <text x='185' y='45' font-size='11' font-weight='bold' fill='#1e293b'>B</text>
  <text x='225' y='75' font-size='10' fill='#1e293b' font-style='italic'>Kate</text>
  
  <!-- Arc for Helen: from C to D -->
  <path d='M 268 110 A 78 78 0 0 1 190 32' fill='none' stroke='#1e293b' stroke-width='2'/>
  <text x='270' y='130' font-size='11' font-weight='bold' fill='#1e293b'>C</text>
  <text x='180' y='28' font-size='11' font-weight='bold' fill='#1e293b'>D</text>
  <text x='245' y='55' font-size='10' fill='#1e293b' font-style='italic'>Helen</text>
  
  <!-- Radii lines -->
  <line x1='190' y1='110' x2='250' y2='110' stroke='#1e293b' stroke-width='1' stroke-dasharray='3,3'/>
  <line x1='190' y1='110' x2='190' y2='50' stroke='#1e293b' stroke-width='1' stroke-dasharray='3,3'/>
  <line x1='190' y1='110' x2='268' y2='110' stroke='#1e293b' stroke-width='1' stroke-dasharray='3,3'/>
  <line x1='190' y1='110' x2='190' y2='32' stroke='#1e293b' stroke-width='1' stroke-dasharray='3,3'/>
  
  <!-- Angle notation -->
  <path d='M 230 110 A 20 20 0 0 1 210 70' fill='none' stroke='#EF4444' stroke-width='1.5'/>
  <text x='225' y='95' font-size='11' fill='#EF4444' font-style='italic'>Î¸</text>
</svg>`,

  // plane_descent_angle - for q_353
  plane_descent_angle: () => `<svg viewBox='0 0 380 240' xmlns='http://www.w3.org/2000/svg'>
  <!-- Horizontal ground -->
  <line x1='40' y1='180' x2='340' y2='180' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Vertical altitude line -->
  <line x1='80' y1='180' x2='80' y2='60' stroke='#3B82F6' stroke-width='2' stroke-dasharray='4,4'/>
  
  <!-- Descent path from P to O -->
  <line x1='80' y1='60' x2='280' y2='180' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Points -->
  <circle cx='80' cy='60' r='4' fill='#EF4444'/>
  <text x='70' y='50' font-size='13' font-weight='bold' fill='#1e293b'>P</text>
  
  <circle cx='280' cy='180' r='4' fill='#EF4444'/>
  <text x='280' y='200' font-size='13' font-weight='bold' fill='#1e293b'>O</text>
  
  <circle cx='80' cy='180' r='4' fill='#1e293b'/>
  <text x='80' y='200' font-size='13' font-weight='bold' fill='#1e293b'>Base</text>
  
  <!-- Altitude label -->
  <text x='45' y='120' font-size='11' fill='#3B82F6' font-style='italic'>150 m</text>
  
  <!-- Horizontal distance label -->
  <text x='180' y='195' font-size='11' fill='#3B82F6' font-style='italic'>5 km = 5000 m</text>
  
  <!-- Angle at O -->
  <path d='M 240 180 A 40 40 0 0 0 175 140' fill='none' stroke='#EF4444' stroke-width='2'/>
  <text x='210' y='175' font-size='11' fill='#EF4444' font-style='italic'>Î±</text>
  
  <!-- Right angle marker -->
  <rect x='75' y='175' width='8' height='8' fill='none' stroke='#1e293b' stroke-width='1'/>
</svg>`,

  // exponential_graphs - for q_357
  exponential_graphs: () => `<svg viewBox='0 0 380 300' xmlns='http://www.w3.org/2000/svg'>
  <!-- Grid background -->
  <rect width='380' height='300' fill='#f8f9fa'/>
  
  <!-- Axes -->
  <line x1='50' y1='250' x2='360' y2='250' stroke='#1e293b' stroke-width='2'/>
  <line x1='50' y1='30' x2='50' y2='250' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Axis labels -->
  <text x='350' y='270' font-size='12' fill='#1e293b'>x</text>
  <text x='20' y='40' font-size='12' fill='#1e293b'>y</text>
  
  <!-- Tick marks on x-axis -->
  <line x1='100' y1='245' x2='100' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='100' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>1</text>
  <line x1='150' y1='245' x2='150' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='150' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>2</text>
  <line x1='200' y1='245' x2='200' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='200' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>3</text>
  
  <!-- Tick marks on y-axis -->
  <line x1='45' y1='200' x2='55' y2='200' stroke='#1e293b' stroke-width='1'/>
  <text x='35' y='205' font-size='10' text-anchor='end' fill='#1e293b'>2</text>
  <line x1='45' y1='150' x2='55' y2='150' stroke='#1e293b' stroke-width='1'/>
  <text x='35' y='155' font-size='10' text-anchor='end' fill='#1e293b'>4</text>
  <line x1='45' y1='100' x2='55' y2='100' stroke='#1e293b' stroke-width='1'/>
  <text x='35' y='105' font-size='10' text-anchor='end' fill='#1e293b'>6</text>
  
  <!-- Exponential curve 1: e^x (increasing fast) -->
  <path d='M 50 240 Q 75 230 100 200 Q 125 160 150 100 Q 175 60 200 40' 
        stroke='#1e293b' stroke-width='2.5' fill='none'/>
  <text x='210' y='35' font-size='11' fill='#1e293b' font-style='italic'>y = e^x</text>
  
  <!-- Exponential curve 2: e^(2x) (increasing faster) -->
  <path d='M 50 245 Q 70 220 90 170 Q 110 110 130 65 Q 145 45 160 35' 
        stroke='#3B82F6' stroke-width='2.5' fill='none'/>
  <text x='165' y='30' font-size='11' fill='#3B82F6' font-style='italic'>y = e^(2x)</text>
</svg>`,

  // argand_collinear - for q_394
  argand_collinear: () => `<svg viewBox='0 0 360 340' xmlns='http://www.w3.org/2000/svg'>
  <!-- Axes -->
  <line x1='40' y1='180' x2='340' y2='180' stroke='#1e293b' stroke-width='2'/>
  <line x1='180' y1='300' x2='180' y2='20' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Axis labels -->
  <text x='330' y='200' font-size='12' fill='#1e293b'>Re</text>
  <text x='160' y='30' font-size='12' fill='#1e293b'>Im</text>
  
  <!-- Grid lines and tick marks -->
  <!-- Re axis ticks -->
  <line x1='220' y1='175' x2='220' y2='185' stroke='#1e293b' stroke-width='1'/>
  <text x='220' y='200' font-size='10' text-anchor='middle' fill='#1e293b'>1</text>
  <line x1='260' y1='175' x2='260' y2='185' stroke='#1e293b' stroke-width='1'/>
  <text x='260' y='200' font-size='10' text-anchor='middle' fill='#1e293b'>2</text>
  <line x1='300' y1='175' x2='300' y2='185' stroke='#1e293b' stroke-width='1'/>
  <text x='300' y='200' font-size='10' text-anchor='middle' fill='#1e293b'>3</text>
  
  <!-- Im axis ticks -->
  <line x1='175' y1='140' x2='185' y2='140' stroke='#1e293b' stroke-width='1'/>
  <text x='165' y='145' font-size='10' text-anchor='end' fill='#1e293b'>1</text>
  <line x1='175' y1='100' x2='185' y2='100' stroke='#1e293b' stroke-width='1'/>
  <text x='165' y='105' font-size='10' text-anchor='end' fill='#1e293b'>2</text>
  <line x1='175' y1='60' x2='185' y2='60' stroke='#1e293b' stroke-width='1'/>
  <text x='165' y='65' font-size='10' text-anchor='end' fill='#1e293b'>3</text>
  
  <!-- Points - collinear points to show -->
  <!-- z1 = 1 + 2i -->
  <circle cx='220' cy='100' r='4' fill='#EF4444'/>
  <text x='210' y='88' font-size='11' fill='#1e293b' font-style='italic'>zâ</text>
  
  <!-- z2 = 2 + 3i -->
  <circle cx='260' cy='60' r='4' fill='#EF4444'/>
  <text x='250' y='45' font-size='11' fill='#1e293b' font-style='italic'>zâ</text>
  
  <!-- z3 (on the same line, calculated based on collinearity) = 3 + 4i -->
  <circle cx='300' cy='20' r='4' fill='#EF4444'/>
  <text x='290' y='10' font-size='11' fill='#1e293b' font-style='italic'>zâ</text>
  
  <!-- Line connecting the three collinear points -->
  <line x1='220' y1='100' x2='300' y2='20' stroke='#3B82F6' stroke-width='2' stroke-dasharray='4,4'/>
  
  <!-- Label showing they are collinear -->
  <text x='150' y='70' font-size='11' fill='#3B82F6' font-style='italic'>Collinear</text>
</svg>`,

  // triangle_pattern_sequence - for q_429
  triangle_pattern_sequence: () => `<svg viewBox='0 0 380 300' xmlns='http://www.w3.org/2000/svg'>
  <!-- Pattern 1: 1 triangle -->
  <g id='pattern1'>
    <text x='30' y='30' font-size='12' font-weight='bold' fill='#1e293b'>Tâ</text>
    <polygon points='50,80 65,50 80,80' fill='none' stroke='#1e293b' stroke-width='2'/>
    <circle cx='57.5' cy='68' r='2' fill='#1e293b'/>
  </g>
  
  <!-- Pattern 2: 4 triangles (2x2) -->
  <g id='pattern2'>
    <text x='110' y='30' font-size='12' font-weight='bold' fill='#1e293b'>Tâ</text>
    <!-- Top triangle -->
    <polygon points='130,50 145,30 160,50' fill='none' stroke='#1e293b' stroke-width='2'/>
    <!-- Bottom left -->
    <polygon points='130,50 145,70 160,50' fill='none' stroke='#1e293b' stroke-width='2'/>
    <!-- Bottom middle -->
    <polygon points='145,70 160,50 175,70' fill='none' stroke='#1e293b' stroke-width='2'/>
    <!-- Bottom right -->
    <polygon points='160,50 175,70 190,50' fill='none' stroke='#1e293b' stroke-width='2'/>
    <circle cx='145' cy='56' r='1.5' fill='#1e293b'/>
  </g>
  
  <!-- Pattern 3: 9 triangles (3x3) -->
  <g id='pattern3'>
    <text x='220' y='30' font-size='12' font-weight='bold' fill='#1e293b'>Tâ</text>
    <!-- Row 1 -->
    <polygon points='240,50 250,35 260,50' fill='none' stroke='#1e293b' stroke-width='1.5'/>
    <polygon points='260,50 270,35 280,50' fill='none' stroke='#1e293b' stroke-width='1.5'/>
    <polygon points='280,50 290,35 300,50' fill='none' stroke='#1e293b' stroke-width='1.5'/>
    <!-- Row 2 -->
    <polygon points='240,50 250,65 260,50' fill='none' stroke='#1e293b' stroke-width='1.5'/>
    <polygon points='260,50 270,65 280,50' fill='none' stroke='#1e293b' stroke-width='1.5'/>
    <polygon points='280,50 290,65 300,50' fill='none' stroke='#1e293b' stroke-width='1.5'/>
    <!-- Row 3 -->
    <polygon points='250,65 260,80 270,65' fill='none' stroke='#1e293b' stroke-width='1.5'/>
    <polygon points='270,65 280,80 290,65' fill='none' stroke='#1e293b' stroke-width='1.5'/>
    <polygon points='290,65 300,80 310,65' fill='none' stroke='#1e293b' stroke-width='1.5'/>
  </g>
  
  <!-- Table below patterns -->
  <text x='30' y='150' font-size='11' font-weight='bold' fill='#1e293b'>Pattern</text>
  <text x='30' y='175' font-size='11' fill='#1e293b'>1</text>
  <text x='110' y='175' font-size='11' fill='#1e293b'>4</text>
  <text x='220' y='175' font-size='11' fill='#1e293b'>9</text>
  
  <text x='30' y='205' font-size='11' font-weight='bold' fill='#1e293b'>Triangles</text>
  <text x='30' y='230' font-size='11' fill='#1e293b'>1Â² = 1</text>
  <text x='110' y='230' font-size='11' fill='#1e293b'>2Â² = 4</text>
  <text x='220' y='230' font-size='11' fill='#1e293b'>3Â² = 9</text>
  
  <!-- Pattern formula -->
  <text x='30' y='270' font-size='11' fill='#3B82F6' font-style='italic'>Tâ contains nÂ² small triangles</text>
</svg>`,

  // inverse_sin_diagram - for q_430
  inverse_sin_diagram: () => `<svg viewBox='0 0 380 300' xmlns='http://www.w3.org/2000/svg'>
  <!-- Grid background -->
  <rect width='380' height='300' fill='#f8f9fa'/>
  
  <!-- Axes -->
  <line x1='50' y1='250' x2='350' y2='250' stroke='#1e293b' stroke-width='2'/>
  <line x1='50' y1='30' x2='50' y2='250' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Axis labels -->
  <text x='340' y='270' font-size='12' fill='#1e293b'>x</text>
  <text x='20' y='40' font-size='12' fill='#1e293b'>y</text>
  
  <!-- X-axis ticks and labels -->
  <line x1='100' y1='245' x2='100' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='100' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>-1</text>
  <line x1='200' y1='245' x2='200' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='200' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>0</text>
  <line x1='300' y1='245' x2='300' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='300' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>1</text>
  
  <!-- Y-axis ticks and labels -->
  <line x1='45' y1='200' x2='55' y2='200' stroke='#1e293b' stroke-width='1'/>
  <text x='35' y='205' font-size='10' text-anchor='end' fill='#1e293b'>Ï/4</text>
  <line x1='45' y1='150' x2='55' y2='150' stroke='#1e293b' stroke-width='1'/>
  <text x='35' y='155' font-size='10' text-anchor='end' fill='#1e293b'>Ï/2</text>
  <line x1='45' y1='100' x2='55' y2='100' stroke='#1e293b' stroke-width='1'/>
  <text x='25' y='105' font-size='10' text-anchor='end' fill='#1e293b'>3Ï/4</text>
  
  <!-- Inverse sine curve: y = arcsin(x) for -1 â¤ x â¤ 1 -->
  <!-- Domain: [-1, 1], Range: [-Ï/2, Ï/2] or [-1.57, 1.57] -->
  <path d='M 100 270 Q 130 233 150 200 Q 170 165 200 150 Q 230 165 250 200 Q 270 233 300 270' 
        stroke='#1e293b' stroke-width='2.5' fill='none'/>
  
  <!-- Mark key points -->
  <!-- Point: arcsin(-1) = -Ï/2 -->
  <circle cx='100' cy='270' r='3' fill='#3B82F6'/>
  <text x='95' y='285' font-size='9' fill='#3B82F6' font-style='italic'>-Ï/2</text>
  
  <!-- Point: arcsin(0) = 0 -->
  <circle cx='200' cy='250' r='3' fill='#3B82F6'/>
  <text x='200' y='265' font-size='9' text-anchor='middle' fill='#3B82F6' font-style='italic'>0</text>
  
  <!-- Point: arcsin(1) = Ï/2 -->
  <circle cx='300' cy='230' r='3' fill='#3B82F6'/>
  <text x='305' y='235' font-size='9' fill='#3B82F6' font-style='italic'>Ï/2</text>
  
  <!-- Curve label -->
  <text x='250' y='100' font-size='12' fill='#1e293b' font-style='italic'>y = sinâ»Â¹(x)</text>
</svg>`,

  // linear_cubic_intersection - for q_431
  linear_cubic_intersection: () => `<svg viewBox='0 0 380 300' xmlns='http://www.w3.org/2000/svg'>
  <!-- Grid background -->
  <rect width='380' height='300' fill='#f8f9fa'/>
  
  <!-- Axes -->
  <line x1='50' y1='250' x2='350' y2='250' stroke='#1e293b' stroke-width='2'/>
  <line x1='50' y1='30' x2='50' y2='250' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Axis labels -->
  <text x='340' y='270' font-size='12' fill='#1e293b'>x</text>
  <text x='20' y='40' font-size='12' fill='#1e293b'>y</text>
  
  <!-- X-axis ticks and labels -->
  <line x1='100' y1='245' x2='100' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='100' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>-2</text>
  <line x1='150' y1='245' x2='150' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='150' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>-1</text>
  <line x1='200' y1='245' x2='200' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='200' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>0</text>
  <line x1='250' y1='245' x2='250' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='250' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>1</text>
  <line x1='300' y1='245' x2='300' y2='255' stroke='#1e293b' stroke-width='1'/>
  <text x='300' y='270' font-size='10' text-anchor='middle' fill='#1e293b'>2</text>
  
  <!-- Y-axis ticks -->
  <line x1='45' y1='200' x2='55' y2='200' stroke='#1e293b' stroke-width='1'/>
  <text x='35' y='205' font-size='10' text-anchor='end' fill='#1e293b'>4</text>
  <line x1='45' y1='150' x2='55' y2='150' stroke='#1e293b' stroke-width='1'/>
  <text x='35' y='155' font-size='10' text-anchor='end' fill='#1e293b'>8</text>
  
  <!-- Linear function y = 4x (straight line) -->
  <line x1='100' y1='50' x2='300' y2='450' stroke='#3B82F6' stroke-width='2.5'/>
  <text x='310' y='450' font-size='11' fill='#3B82F6' font-style='italic'>y = 4x</text>
  
  <!-- Cubic function y = xÂ³ (curved) -->
  <path d='M 80 310 Q 100 270 120 230 Q 140 160 150 100 Q 160 70 170 50 Q 180 40 200 250 Q 220 240 240 200 Q 260 130 280 70 Q 300 30 320 10' 
        stroke='#1e293b' stroke-width='2.5' fill='none'/>
  <text x='280' y='40' font-size='11' fill='#1e293b' font-style='italic'>y = xÂ³</text>
  
  <!-- Intersection points (approximately x = -2, 0, 2) -->
  <circle cx='100' cy='50' r='4' fill='#EF4444'/>
  <circle cx='200' cy='250' r='4' fill='#EF4444'/>
  <circle cx='300' cy='450' r='4' fill='#EF4444'/>
  
  <!-- Mark intersection points -->
  <text x='90' y='30' font-size='9' fill='#EF4444' font-style='italic'>(-2, -8)</text>
  <text x='200' y='265' font-size='9' text-anchor='middle' fill='#EF4444' font-style='italic'>(0, 0)</text>
  <text x='310' y='460' font-size='9' fill='#EF4444' font-style='italic'>(2, 8)</text>
  
  <!-- Shaded region in first quadrant -->
  <path d='M 200 250 Q 220 245 240 200 L 240 200 L 200 250 Z' 
        fill='#fecaca' opacity='0.4'/>
</svg>`,

  // wall_ground_3d - for q_458
  wall_ground_3d: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Point on Wall Above Ground</text>
  
  <!-- Ground (horizontal) -->
  <line x1='40' y1='220' x2='280' y2='220' stroke='#1e293b' stroke-width='3'/>
  <text x='290' y='225' font-size='11' fill='#1e293b' font-style='italic'>ground</text>
  
  <!-- Wall (vertical) -->
  <line x1='60' y1='220' x2='60' y2='80' stroke='#1e293b' stroke-width='3'/>
  <text x='25' y='140' font-size='11' fill='#1e293b' font-style='italic'>wall</text>
  
  <!-- Point a on ground -->
  <circle cx='60' cy='220' r='4' fill='#1e293b'/>
  <text x='55' y='245' font-size='11' fill='#1e293b' font-style='italic'>a</text>
  
  <!-- Point d on wall -->
  <circle cx='60' cy='90' r='4' fill='#1e293b'/>
  <text x='35' y='85' font-size='11' fill='#1e293b' font-style='italic'>d</text>
  
  <!-- Point e on ground -->
  <circle cx='240' cy='220' r='4' fill='#1e293b'/>
  <text x='240' y='245' font-size='11' fill='#1e293b' font-style='italic'>e</text>
  
  <!-- Point f in space (projection) -->
  <circle cx='240' cy='120' r='4' fill='#1e293b'/>
  <text x='245' y='115' font-size='11' fill='#1e293b' font-style='italic'>f</text>
  
  <!-- Distance ad (vertical) -->
  <line x1='60' y1='90' x2='60' y2='220' stroke='#3B82F6' stroke-width='2'/>
  <text x='70' y='160' font-size='10' fill='#3B82F6' font-weight='bold'>72 m</text>
  
  <!-- Distance ae (horizontal on ground) -->
  <line x1='60' y1='220' x2='240' y2='220' stroke='#3B82F6' stroke-width='2'/>
  <text x='145' y='235' font-size='10' fill='#3B82F6' font-weight='bold'>35 m</text>
  
  <!-- Distance de (hypotenuse) -->
  <line x1='60' y1='90' x2='240' y2='120' stroke='#1e293b' stroke-width='2' stroke-dasharray='3'/>
  <text x='130' y='75' font-size='10' fill='#1e293b' font-weight='bold'>97 m</text>
  
  <!-- Distance fe (height) -->
  <line x1='240' y1='120' x2='240' y2='220' stroke='#3B82F6' stroke-width='2'/>
  <text x='250' y='170' font-size='10' fill='#3B82F6' font-weight='bold'>40 m</text>
</svg>`,

  // area_under_curve - for q_466
  area_under_curve: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Area Under Curve</text>
  
  <!-- Axes -->
  <line x1='50' y1='240' x2='290' y2='240' stroke='#1e293b' stroke-width='2'/>
  <line x1='50' y1='240' x2='50' y2='40' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Axis labels -->
  <text x='295' y='245' font-size='12' fill='#1e293b'>x</text>
  <text x='35' y='35' font-size='12' fill='#1e293b'>y</text>
  
  <!-- Tick marks on x-axis -->
  <line x1='90' y1='235' x2='90' y2='245' stroke='#1e293b' stroke-width='1'/>
  <line x1='130' y1='235' x2='130' y2='245' stroke='#1e293b' stroke-width='1'/>
  <line x1='170' y1='235' x2='170' y2='245' stroke='#1e293b' stroke-width='1'/>
  <line x1='210' y1='235' x2='210' y2='245' stroke='#1e293b' stroke-width='1'/>
  <line x1='250' y1='235' x2='250' y2='245' stroke='#1e293b' stroke-width='1'/>
  
  <!-- Tick marks on y-axis -->
  <line x1='45' y1='200' x2='55' y2='200' stroke='#1e293b' stroke-width='1'/>
  <line x1='45' y1='160' x2='55' y2='160' stroke='#1e293b' stroke-width='1'/>
  <line x1='45' y1='120' x2='55' y2='120' stroke='#1e293b' stroke-width='1'/>
  <line x1='45' y1='80' x2='55' y2='80' stroke='#1e293b' stroke-width='1'/>
  
  <!-- Curve: reciprocal function 1/xÂ² -->
  <path d='M 80 180 Q 100 120 130 95 Q 160 75 200 60 Q 250 48 280 45' 
        fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Shaded area under curve -->
  <path d='M 90 240 L 90 160 Q 110 110 130 80 Q 160 55 200 40 Q 250 30 280 25 L 280 240 Z' 
        fill='#3B82F6' opacity='0.2' stroke='none'/>
  
  <!-- Boundary lines -->
  <line x1='90' y1='160' x2='90' y2='240' stroke='#3B82F6' stroke-width='1' stroke-dasharray='3'/>
  <line x1='280' y1='25' x2='280' y2='240' stroke='#3B82F6' stroke-width='1' stroke-dasharray='3'/>
  
  <!-- Labels -->
  <text x='160' y='265' font-size='10' fill='#1e293b'>shaded area = integral from a to b</text>
</svg>`,

  // curve_with_asymptotes - for q_476
  curve_with_asymptotes: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Curve with Asymptotes</text>
  
  <!-- Axes -->
  <line x1='50' y1='240' x2='290' y2='240' stroke='#1e293b' stroke-width='2'/>
  <line x1='50' y1='240' x2='50' y2='40' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Axis labels -->
  <text x='295' y='245' font-size='12' fill='#1e293b'>x</text>
  <text x='35' y='35' font-size='12' fill='#1e293b'>y</text>
  
  <!-- Vertical asymptote at x = 1 -->
  <line x1='120' y1='40' x2='120' y2='240' stroke='#EF4444' stroke-width='1' stroke-dasharray='3'/>
  <text x='100' y='35' font-size='9' fill='#EF4444'>x = 1</text>
  
  <!-- Horizontal asymptote at y = 0 -->
  <line x1='50' y1='240' x2='290' y2='240' stroke='#EF4444' stroke-width='1' stroke-dasharray='3'/>
  <text x='270' y='255' font-size='9' fill='#EF4444'>y = 0</text>
  
  <!-- Curve: y = x/(x-1) -->
  <!-- Left branch (x < 1) -->
  <path d='M 60 60 Q 80 100 110 200 Q 115 235 119 260' 
        fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Right branch (x > 1) -->
  <path d='M 121 260 Q 125 240 135 160 Q 160 80 200 50 Q 240 45 280 42' 
        fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Label -->
  <text x='160' y='265' font-size='10' fill='#1e293b'>y = x/(x - 1)</text>
</svg>`,

  // sector_in_circle - for q_493
  sector_in_circle: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Sector in Circle</text>
  
  <!-- Circle -->
  <circle cx='160' cy='150' r='80' fill='#3B82F6' opacity='0.15' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Center point -->
  <circle cx='160' cy='150' r='3' fill='#1e293b'/>
  <text x='165' y='155' font-size='11' fill='#1e293b' font-style='italic'>O</text>
  
  <!-- Radius 1 (vertical) -->
  <line x1='160' y1='150' x2='160' y2='70' stroke='#1e293b' stroke-width='2'/>
  <text x='150' y='105' font-size='10' fill='#3B82F6' font-weight='bold'>r</text>
  
  <!-- Radius 2 (at 60 degrees) -->
  <line x1='160' y1='150' x2='220' y2='100' stroke='#1e293b' stroke-width='2'/>
  <text x='195' y='125' font-size='10' fill='#3B82F6' font-weight='bold'>r</text>
  
  <!-- Arc -->
  <path d='M 160 70 A 80 80 0 0 1 220 100' fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Angle marking -->
  <path d='M 165 150 Q 170 135 175 125' fill='none' stroke='#EF4444' stroke-width='1.5'/>
  <text x='180' y='130' font-size='11' fill='#EF4444' font-weight='bold'>60Â°</text>
  
  <!-- Shaded sector -->
  <path d='M 160 150 L 160 70 A 80 80 0 0 1 220 100 Z' 
        fill='#3B82F6' opacity='0.25' stroke='none'/>
  
  <!-- Point on circumference 1 -->
  <circle cx='160' cy='70' r='3' fill='#1e293b'/>
  <text x='155' y='60' font-size='10' fill='#1e293b' font-style='italic'>A</text>
  
  <!-- Point on circumference 2 -->
  <circle cx='220' cy='100' r='3' fill='#1e293b'/>
  <text x='225' y='100' font-size='10' fill='#1e293b' font-style='italic'>B</text>
</svg>`,

  // number_line - for q_503
  number_line: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Number Line: |x + 1| â¤ 2</text>
  
  <!-- Main number line -->
  <line x1='40' y1='150' x2='300' y2='150' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Tick marks and labels -->
  <line x1='50' y1='140' x2='50' y2='160' stroke='#1e293b' stroke-width='1'/>
  <text x='45' y='180' font-size='11' fill='#1e293b' font-weight='bold'>-4</text>
  
  <line x1='90' y1='140' x2='90' y2='160' stroke='#1e293b' stroke-width='1'/>
  <text x='85' y='180' font-size='11' fill='#1e293b' font-weight='bold'>-3</text>
  
  <line x1='130' y1='140' x2='130' y2='160' stroke='#1e293b' stroke-width='1'/>
  <text x='120' y='180' font-size='11' fill='#1e293b' font-weight='bold'>-2</text>
  
  <line x1='170' y1='140' x2='170' y2='160' stroke='#1e293b' stroke-width='1'/>
  <text x='165' y='180' font-size='11' fill='#1e293b' font-weight='bold'>-1</text>
  
  <line x1='210' y1='140' x2='210' y2='160' stroke='#1e293b' stroke-width='1'/>
  <text x='205' y='180' font-size='11' fill='#1e293b' font-weight='bold'>0</text>
  
  <line x1='250' y1='140' x2='250' y2='160' stroke='#1e293b' stroke-width='1'/>
  <text x='245' y='180' font-size='11' fill='#1e293b' font-weight='bold'>1</text>
  
  <line x1='290' y1='140' x2='290' y2='160' stroke='#1e293b' stroke-width='1'/>
  <text x='285' y='180' font-size='11' fill='#1e293b' font-weight='bold'>2</text>
  
  <!-- Solution interval -3 â¤ x â¤ 1 -->
  <line x1='90' y1='150' x2='250' y2='150' stroke='#3B82F6' stroke-width='4'/>
  
  <!-- Closed circles at endpoints -->
  <circle cx='90' cy='150' r='5' fill='#3B82F6'/>
  <circle cx='250' cy='150' r='5' fill='#3B82F6'/>
  
  <!-- Solution label -->
  <text x='160' y='120' font-size='11' fill='#3B82F6' font-weight='bold'>-3 â¤ x â¤ 1</text>
  <text x='160' y='220' font-size='10' fill='#1e293b'>Integer values: {-3, -2, -1, 0, 1}</text>
</svg>`,

  // argand_diagram_515 - for q_515
  argand_diagram_515: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Argand Diagram: z = 1 - i</text>
  
  <!-- Real axis (horizontal) -->
  <line x1='40' y1='150' x2='300' y2='150' stroke='#1e293b' stroke-width='2'/>
  <text x='295' y='145' font-size='12' fill='#1e293b' font-weight='bold'>Re</text>
  
  <!-- Imaginary axis (vertical) -->
  <line x1='160' y1='40' x2='160' y2='260' stroke='#1e293b' stroke-width='2'/>
  <text x='165' y='30' font-size='12' fill='#1e293b' font-weight='bold'>Im</text>
  
  <!-- Grid lines (faint) -->
  <line x1='120' y1='40' x2='120' y2='260' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='200' y1='40' x2='200' y2='260' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='40' y1='110' x2='300' y2='110' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='40' y1='190' x2='300' y2='190' stroke='#e2e8f0' stroke-width='1'/>
  
  <!-- Tick marks on real axis -->
  <line x1='120' y1='145' x2='120' y2='155' stroke='#1e293b' stroke-width='1'/>
  <text x='115' y='170' font-size='10' fill='#1e293b'>-1</text>
  
  <line x1='200' y1='145' x2='200' y2='155' stroke='#1e293b' stroke-width='1'/>
  <text x='195' y='170' font-size='10' fill='#1e293b'>1</text>
  
  <line x1='240' y1='145' x2='240' y2='155' stroke='#1e293b' stroke-width='1'/>
  <text x='235' y='170' font-size='10' fill='#1e293b'>2</text>
  
  <!-- Tick marks on imaginary axis -->
  <line x1='155' y1='110' x2='165' y2='110' stroke='#1e293b' stroke-width='1'/>
  <text x='140' y='115' font-size='10' fill='#1e293b'>i</text>
  
  <line x1='155' y1='190' x2='165' y2='190' stroke='#1e293b' stroke-width='1'/>
  <text x='138' y='195' font-size='10' fill='#1e293b'>-i</text>
  
  <!-- Point z = 1 - i at (1, -1) -->
  <circle cx='200' cy='190' r='5' fill='#3B82F6'/>
  <circle cx='200' cy='190' r='3' fill='none' stroke='#3B82F6' stroke-width='1'/>
  
  <!-- Vector from origin to z -->
  <line x1='160' y1='150' x2='200' y2='190' stroke='#EF4444' stroke-width='2'/>
  
  <!-- Label for point -->
  <text x='205' y='210' font-size='11' fill='#1e293b' font-style='italic'>z = 1 - i</text>
  <text x='180' y='165' font-size='10' fill='#EF4444' font-weight='bold'>|z| = â2</text>
</svg>`,

  // sector_with_arc - for q_522
  sector_with_arc: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Sector with Arc</text>
  
  <!-- Circle -->
  <circle cx='160' cy='150' r='90' fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Center point -->
  <circle cx='160' cy='150' r='3' fill='#1e293b'/>
  <text x='165' y='155' font-size='11' fill='#1e293b' font-style='italic'>O</text>
  
  <!-- Radius 1 (upward) -->
  <line x1='160' y1='150' x2='160' y2='60' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Radius 2 (at angle) -->
  <line x1='160' y1='150' x2='245' y2='185' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Arc -->
  <path d='M 160 60 A 90 90 0 0 1 245 185' fill='none' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Angle marking -->
  <path d='M 165 150 A 25 25 0 0 1 235 168' fill='none' stroke='#EF4444' stroke-width='1.5'/>
  <text x='195' y='135' font-size='11' fill='#EF4444' font-weight='bold'>Î¸</text>
  
  <!-- Shaded sector -->
  <path d='M 160 150 L 160 60 A 90 90 0 0 1 245 185 Z' 
        fill='#3B82F6' opacity='0.2' stroke='none'/>
  
  <!-- Point on arc 1 -->
  <circle cx='160' cy='60' r='3' fill='#1e293b'/>
  <text x='150' y='50' font-size='10' fill='#1e293b' font-style='italic'>A</text>
  
  <!-- Point on arc 2 -->
  <circle cx='245' cy='185' r='3' fill='#1e293b'/>
  <text x='255' y='190' font-size='10' fill='#1e293b' font-style='italic'>B</text>
  
  <!-- Label -->
  <text x='160' y='265' font-size='10' fill='#1e293b'>Sector area = (1/2)rÂ²Î¸</text>
</svg>`,

  // argand_diagram_579 - for q_579
  argand_diagram_579: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Argand Diagram: z = 3 + 4i</text>
  
  <!-- Real axis (horizontal) -->
  <line x1='30' y1='150' x2='310' y2='150' stroke='#1e293b' stroke-width='2'/>
  <text x='310' y='145' font-size='12' fill='#1e293b' font-weight='bold'>Re</text>
  
  <!-- Imaginary axis (vertical) -->
  <line x1='160' y1='30' x2='160' y2='270' stroke='#1e293b' stroke-width='2'/>
  <text x='165' y='20' font-size='12' fill='#1e293b' font-weight='bold'>Im</text>
  
  <!-- Grid lines (faint) -->
  <line x1='80' y1='30' x2='80' y2='270' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='110' y1='30' x2='110' y2='270' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='190' y1='30' x2='190' y2='270' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='240' y1='30' x2='240' y2='270' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='30' y1='80' x2='310' y2='80' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='30' y1='110' x2='310' y2='110' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='30' y1='190' x2='310' y2='190' stroke='#e2e8f0' stroke-width='1'/>
  <line x1='30' y1='220' x2='310' y2='220' stroke='#e2e8f0' stroke-width='1'/>
  
  <!-- Tick marks and labels on real axis -->
  <line x1='80' y1='145' x2='80' y2='155' stroke='#1e293b' stroke-width='1'/>
  <text x='75' y='170' font-size='10' fill='#1e293b'>1</text>
  
  <line x1='110' y1='145' x2='110' y2='155' stroke='#1e293b' stroke-width='1'/>
  <text x='103' y='170' font-size='10' fill='#1e293b'>2</text>
  
  <line x1='190' y1='145' x2='190' y2='155' stroke='#1e293b' stroke-width='1'/>
  <text x='183' y='170' font-size='10' fill='#1e293b'>4</text>
  
  <line x1='240' y1='145' x2='240' y2='155' stroke='#1e293b' stroke-width='1'/>
  <text x='233' y='170' font-size='10' fill='#1e293b'>5</text>
  
  <!-- Tick marks and labels on imaginary axis -->
  <line x1='155' y1='80' x2='165' y2='80' stroke='#1e293b' stroke-width='1'/>
  <text x='140' y='85' font-size='10' fill='#1e293b'>2i</text>
  
  <line x1='155' y1='110' x2='165' y2='110' stroke='#1e293b' stroke-width='1'/>
  <text x='140' y='115' font-size='10' fill='#1e293b'>3i</text>
  
  <line x1='155' y1='190' x2='165' y2='190' stroke='#1e293b' stroke-width='1'/>
  <text x='138' y='195' font-size='10' fill='#1e293b'>-2i</text>
  
  <!-- Point z = 3 + 4i at (3, 4i) -->
  <circle cx='190' cy='80' r='5' fill='#3B82F6'/>
  <circle cx='190' cy='80' r='3' fill='none' stroke='#3B82F6' stroke-width='1'/>
  
  <!-- Vector from origin to z -->
  <line x1='160' y1='150' x2='190' y2='80' stroke='#EF4444' stroke-width='2'/>
  
  <!-- Dashed projections -->
  <line x1='190' y1='80' x2='190' y2='150' stroke='#1e293b' stroke-width='1' stroke-dasharray='3'/>
  <line x1='190' y1='80' x2='160' y2='80' stroke='#1e293b' stroke-width='1' stroke-dasharray='3'/>
  
  <!-- Labels -->
  <text x='195' y='65' font-size='11' fill='#1e293b' font-style='italic'>z = 3 + 4i</text>
  <text x='165' y='110' font-size='10' fill='#EF4444' font-weight='bold'>|z| = 5</text>
</svg>`,

  // cumulative_frequency - for q_615
  cumulative_frequency: () => `<svg viewBox='0 0 320 280' xmlns='http://www.w3.org/2000/svg'>
  <!-- Title -->
  <text x='160' y='20' text-anchor='middle' font-size='14' font-weight='bold' fill='#1e293b'>Cumulative Frequency: Birth Weights</text>
  
  <!-- Axes -->
  <line x1='50' y1='240' x2='300' y2='240' stroke='#1e293b' stroke-width='2'/>
  <line x1='50' y1='240' x2='50' y2='40' stroke='#1e293b' stroke-width='2'/>
  
  <!-- Axis labels -->
  <text x='305' y='245' font-size='11' fill='#1e293b'>Weight (g)</text>
  <text x='15' y='50' font-size='11' fill='#1e293b'>Cumulative</text>
  <text x='25' y='65' font-size='11' fill='#1e293b'>Frequency</text>
  
  <!-- Tick marks on x-axis -->
  <line x1='80' y1='235' x2='80' y2='245' stroke='#1e293b' stroke-width='1'/>
  <text x='70' y='260' font-size='9' fill='#1e293b'>3000</text>
  
  <line x1='130' y1='235' x2='130' y2='245' stroke='#1e293b' stroke-width='1'/>
  <text x='120' y='260' font-size='9' fill='#1e293b'>3200</text>
  
  <line x1='180' y1='235' x2='180' y2='245' stroke='#1e293b' stroke-width='1'/>
  <text x='170' y='260' font-size='9' fill='#1e293b'>3400</text>
  
  <line x1='230' y1='235' x2='230' y2='245' stroke='#1e293b' stroke-width='1'/>
  <text x='220' y='260' font-size='9' fill='#1e293b'>3600</text>
  
  <line x1='280' y1='235' x2='280' y2='245' stroke='#1e293b' stroke-width='1'/>
  <text x='270' y='260' font-size='9' fill='#1e293b'>3800</text>
  
  <!-- Tick marks on y-axis -->
  <line x1='45' y1='200' x2='55' y2='200' stroke='#1e293b' stroke-width='1'/>
  <text x='25' y='205' font-size='9' fill='#1e293b'>0.25</text>
  
  <line x1='45' y1='150' x2='55' y2='150' stroke='#1e293b' stroke-width='1'/>
  <text x='25' y='155' font-size='9' fill='#1e293b'>0.5</text>
  
  <line x1='45' y1='100' x2='55' y2='100' stroke='#1e293b' stroke-width='1'/>
  <text x='25' y='105' font-size='9' fill='#1e293b'>0.75</text>
  
  <!-- Ogive curve -->
  <path d='M 80 220 Q 110 190 155 140 Q 180 120 220 90 Q 245 70 280 55' 
        fill='none' stroke='#1e293b' stroke-width='2.5'/>
  
  <!-- Median line at 3500g -->
  <line x1='215' y1='100' x2='215' y2='240' stroke='#3B82F6' stroke-width='1' stroke-dasharray='3'/>
  <line x1='50' y1='100' x2='215' y2='100' stroke='#3B82F6' stroke-width='1' stroke-dasharray='3'/>
  <circle cx='215' cy='100' r='3' fill='#3B82F6'/>
  <text x='220' y='105' font-size='9' fill='#3B82F6' font-weight='bold'>Medianâ3500</text>
  
  <!-- Q1 marking -->
  <circle cx='150' cy='140' r='3' fill='#EF4444'/>
  <text x='145' y='130' font-size='9' fill='#EF4444' font-weight='bold'>Qâ</text>
  
  <!-- Q3 marking -->
  <circle cx='250' cy='75' r='3' fill='#EF4444'/>
  <text x='255' y='70' font-size='9' fill='#EF4444' font-weight='bold'>Qâ</text>
  
  <!-- IQR label -->
  <text x='160' y='265' font-size='9' fill='#1e293b'>IQR = Qâ - Qâ â 800 g</text>
</svg>`,
};

// âââ DIAGRAM SVG COMPONENT âââ
function DiagramSVG({ name, params = {} }) {
  if (!DIAGRAMS[name]) return null;
  const svg = typeof DIAGRAMS[name] === 'function' ? DIAGRAMS[name](...Object.values(params)) : DIAGRAMS[name];
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

// âââ DRAWING CANVAS COMPONENT âââ
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
        }}>â More Space</button>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          {canvasHeight > MIN_HEIGHT ? `Page ${Math.ceil(canvasHeight / MIN_HEIGHT)}` : "Page 1"}
        </span>
        <button onClick={clearCanvas} style={{
          background: "#ef4444", color: "white",
          border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}>Clear</button>
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
        âï¸ Draw your workings â canvas extends as you write
      </div>
    </div>
  );
}

// âââ MATHS EXPRESSION EVALUATOR âââ
function evaluateMathExpr(expr) {
  try {
    // Clean the expression: replace maths symbols with JS equivalents
    let e = expr.trim();
    // Replace common maths symbols
    e = e.replace(/Ã/g, "*").replace(/Ã·/g, "/").replace(/Â·/g, "*");
    e = e.replace(/Ï/g, `(${Math.PI})`);
    e = e.replace(/â\(([^)]+)\)/g, "Math.sqrt($1)"); // â(x)
    e = e.replace(/â(\d+\.?\d*)/g, "Math.sqrt($1)");  // â9
    e = e.replace(/(\d+\.?\d*)Â²/g, "Math.pow($1,2)");
    e = e.replace(/(\d+\.?\d*)Â³/g, "Math.pow($1,3)");
    e = e.replace(/(\d+\.?\d*)\^(\d+\.?\d*)/g, "Math.pow($1,$2)");
    e = e.replace(/sin\(/g, "Math.sin(").replace(/cos\(/g, "Math.cos(").replace(/tan\(/g, "Math.tan(");
    e = e.replace(/log\(/g, "Math.log10(").replace(/ln\(/g, "Math.log(");
    e = e.replace(/abs\(/g, "Math.abs(");
    // Remove trailing operators
    e = e.replace(/[+\-*/]+$/, "");
    if (!e) return null;
    // Safely evaluate (only allows numbers, operators, Math functions, parentheses)
    if (/[^0-9+\-*/().,%eE\s]/.test(e.replace(/Math\.\w+/g, ""))) return null;
    const result = Function('"use strict"; return (' + e + ')')();
    if (typeof result !== "number" || !isFinite(result)) return null;
    // Round to avoid floating point weirdness (up to 10 decimal places)
    return Math.round(result * 10000000000) / 10000000000;
  } catch {
    return null;
  }
}

// âââ MATHS KEYBOARD COMPONENT âââ
function MathKeyboard({ onInsert, onCalculate, showCalcRow = false }) {
  const numberRow = ["7", "8", "9", "+", "4", "5", "6", "-", "1", "2", "3", ".", "0", "(", ")", "^"];
  const symbolRows = [
    ["Ã", "Ã·", "â", "Ï", "Â²", "Â³", "Â±", "%"],
    ["â¤", "â¥", "â ", "â", "<", ">", "Â°", "â"],
    ["sin(", "cos(", "tan(", "log(", "ln(", "abs(", "â", "â"],
    ["â«", "Î£", "Î", "Î¸", "Î±", "Î²", "Î»", "Î¼"],
    ["â»Â¹", "â¿", "â", "â", "[", "]", "|", "â¦"],
  ];

  const btnStyle = {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "10px 0",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    color: "#1e293b",
    minWidth: 0,
    transition: "all 0.15s",
  };

  const calcBtnStyle = {
    ...btnStyle,
    background: "#22C55E",
    color: "white",
    border: "1px solid #16a34a",
    fontSize: 14,
    fontWeight: 800,
    gridColumn: "span 4",
  };

  return (
    <div style={{ marginTop: 8 }}>
      {/* Number pad + operators */}
      {showCalcRow && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 4 }}>
            {numberRow.map((sym) => (
              <button key={sym} style={btnStyle} onClick={() => onInsert(sym)} type="button">{sym}</button>
            ))}
          </div>
          {onCalculate && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 6 }}>
              <button style={calcBtnStyle} onClick={onCalculate} type="button">= Calculate</button>
            </div>
          )}
        </>
      )}
      {/* Symbol rows */}
      {symbolRows.map((row, ri) => (
        <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: 4, marginBottom: 4 }}>
          {row.map((sym) => (
            <button
              key={sym}
              style={{ ...btnStyle, fontSize: sym.length > 2 ? 11 : 15 }}
              onClick={() => onInsert(sym)}
              type="button"
            >
              {sym.replace(/\($/, "")}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// âââ MAIN APP âââ
export default function MathU() {
  // Auth state
  const [phone, setPhone] = useState(() => {
    try { return localStorage.getItem("mathu_phone") || ""; } catch { return ""; }
  });
  const [phoneSaved, setPhoneSaved] = useState(() => {
    try { const p = localStorage.getItem("mathu_phone"); return !!(p && p.replace(/\D/g, "").length >= 7); } catch { return false; }
  });
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

  // Formulae & Tables refs (must be top-level, not inside conditional)
  const formulaeRefs = useRef({});
  const formulaeScrollRef = useRef(null);

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

  // Workings mode: "pen" (drawing canvas) or "keyboard" (text + maths keyboard)
  const [workingsMode, setWorkingsMode] = useState("pen");
  const [workingsText, setWorkingsText] = useState("");
  const [showAnswerKeyboard, setShowAnswerKeyboard] = useState(false);
  const workingsTextRef = useRef(null);
  const answerInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Timer
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalXP: 0, streak: 0, totalCorrect: 0, totalAttempted: 0,
    fastestTime: 0, noHintStreak: 0, correctStreak: 0, topicsAttempted: 0,
    topicStats: {}, dailyCompleted: false, questionsToday: 0,
    dailyChallengesCompleted: 0, bookmarkCount: 0,
  });
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(null);
  const [xpAnimation, setXpAnimation] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  // Friends system
  const [friends, setFriends] = useState([]);
  const [dailyResults, setDailyResults] = useState([]);
  const [friendCode, setFriendCode] = useState("");
  const [pendingInvite, setPendingInvite] = useState(null);

  // Multi-part question state
  const [activePart, setActivePart] = useState(0); // index of the current active part
  const [partResults, setPartResults] = useState({}); // { 0: {correct: true, answer: "8"}, 1: {correct: false, skipped: true} }
  const [partSolutionVisible, setPartSolutionVisible] = useState({}); // which part solutions are expanded
  const [partHintsUsed, setPartHintsUsed] = useState({}); // { 0: 2, 1: 0 } hints used per part
  const [partHintsRevealed, setPartHintsRevealed] = useState({}); // { 0: [true, true, false] }

  // AI Workings Analysis state
  const [aiFeedback, setAiFeedback] = useState({}); // { partIndex: { mistake, explanation, encouragement } }
  const [aiLoading, setAiLoading] = useState({}); // { partIndex: true/false }

  // FEATURE 1: Explain Differently
  const [simpleExplanation, setSimpleExplanation] = useState(null);

  // FEATURE 2: Weekly Streak Challenges
  const [weeklyChallenge, setWeeklyChallenge] = useState({
    target: 5,
    daysCompleted: 0,
    currentWeekStart: null,
    lastCompletedDate: null
  });

  // FEATURE 3: Sound Effects
  const [soundEnabled, setSoundEnabled] = useState(true);

  // FEATURE 4: Avatar System
  const [avatar, setAvatar] = useState(null);
  const [customPhoto, setCustomPhoto] = useState(null);

  // Check URL for invite code on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get("invite");
      if (invite) {
        setPendingInvite(invite.toUpperCase());
        setFriendCode(invite.toUpperCase());
        // Clean the URL so it doesn't stick around
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch (e) {}
  }, []);

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
                dailyChallengesCompleted: statsData.daily_challenges_completed || 0,
                bookmarkCount: statsData.bookmark_count || 0,
              });
              setEarnedBadges(statsData.earned_badges || []);
            }

            // Load dark mode, bookmarks, wrong answers from localStorage
            const savedDarkMode = localStorage.getItem("mathu_darkMode");
            if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));

            const savedBookmarks = localStorage.getItem("mathu_bookmarks");
            if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

            const savedWrongAnswers = localStorage.getItem("mathu_spaced");
            if (savedWrongAnswers) setWrongAnswers(JSON.parse(savedWrongAnswers));

            // Load FEATURE 2: Weekly Challenge
            const savedWeekly = localStorage.getItem("mathu_weekly");
            if (savedWeekly) setWeeklyChallenge(JSON.parse(savedWeekly));

            // Load FEATURE 3: Sound Effects
            const savedSound = localStorage.getItem("mathu_sound");
            if (savedSound !== null) setSoundEnabled(JSON.parse(savedSound));

            // Load FEATURE 4: Avatar System
            const savedAvatar = localStorage.getItem("mathu_avatar");
            if (savedAvatar) setAvatar(savedAvatar);
            const savedPhoto = localStorage.getItem("mathu_photo");
            if (savedPhoto) setCustomPhoto(savedPhoto);

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


  // If user just landed on home and has a pending invite, go to add_friend
  useEffect(() => {
    if (screen === "home" && pendingInvite && isLoggedIn) {
      setScreen("add_friend");
    }
  }, [screen, pendingInvite, isLoggedIn]);

  // Load and save dark mode preference
  useEffect(() => {
    try {
      localStorage.setItem("mathu_darkMode", JSON.stringify(darkMode));
    } catch (err) {
      console.error("Dark mode save failed:", err);
    }
  }, [darkMode]);

  // FEATURE 2: Save weekly challenge to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mathu_weekly", JSON.stringify(weeklyChallenge));
    } catch (err) {
      console.error("Weekly challenge save failed:", err);
    }
  }, [weeklyChallenge]);

  // FEATURE 3: Save sound preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mathu_sound", JSON.stringify(soundEnabled));
    } catch (err) {
      console.error("Sound preference save failed:", err);
    }
  }, [soundEnabled]);

  // FEATURE 4: Save avatar system to localStorage
  useEffect(() => {
    try {
      if (avatar) localStorage.setItem("mathu_avatar", avatar);
      if (customPhoto) localStorage.setItem("mathu_photo", customPhoto);
    } catch (err) {
      console.error("Avatar save failed:", err);
    }
  }, [avatar, customPhoto]);

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mathu_bookmarks", JSON.stringify(bookmarks));
      setStats(prev => ({ ...prev, bookmarkCount: bookmarks.length }));
    } catch (err) {
      console.error("Bookmarks save failed:", err);
    }
  }, [bookmarks]);

  // Save wrong answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mathu_spaced", JSON.stringify(wrongAnswers));
    } catch (err) {
      console.error("Wrong answers save failed:", err);
    }
  }, [wrongAnswers]);

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

  // Generate invite code from user ID
  const getInviteCode = (uid) => uid.slice(0, 8).toUpperCase();

  // Load friends from Supabase
  const loadFriends = async () => {
    if (!userId) return;
    try {
      const { data: friendsList } = await supabase
        .from("friends")
        .select("friend_id, profiles!friends_friend_id_fkey(name, id)")
        .eq("user_id", userId);

      if (friendsList) {
        setFriends(friendsList.map(f => ({
          id: f.friend_id,
          name: f.profiles?.name || "Unknown"
        })));
      }
    } catch (err) {
      console.error("Load friends failed:", err);
    }
  };

  // Add friend by code
  const addFriend = async (code) => {
    if (!userId || !code) return;
    try {
      // Find user by matching ID prefix with the code
      const { data: users } = await supabase
        .from("profiles")
        .select("id, name")
        .filter("id", "ilike", code.toLowerCase() + "%")
        .limit(1);

      if (!users || users.length === 0) {
        alert("Friend code not found. Please check and try again.");
        return;
      }

      const friendId = users[0].id;
      if (friendId === userId) {
        alert("You cannot add yourself!");
        return;
      }

      // Add bidirectional friendship
      await supabase.from("friends").insert([
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId }
      ]);

      alert(`Added ${users[0].name} as a friend!`);
      setFriendCode("");
      setPendingInvite(null);
      await loadFriends();
      await loadDailyResults();
      // If they came from an invite link, go to home
      if (pendingInvite) setScreen("home");
    } catch (err) {
      console.error("Add friend failed:", err);
      alert("Failed to add friend. Please try again.");
    }
  };

  // Save daily result
  const saveDailyResult = async (questionId, correct, timeTaken) => {
    if (!userId) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("daily_results").upsert({
        user_id: userId,
        question_id: questionId,
        challenge_date: today,
        correct: correct,
        time_taken: timeTaken,
      }, { onConflict: "user_id,challenge_date" });
    } catch (err) {
      console.error("Save daily result failed:", err);
    }
  };

  // Load today's daily results for all friends
  const loadDailyResults = async () => {
    if (!userId || friends.length === 0) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const friendIds = friends.map(f => f.id);

      const { data: results } = await supabase
        .from("daily_results")
        .select("user_id, correct, time_taken, profiles!daily_results_user_id_fkey(name)")
        .eq("challenge_date", today)
        .in("user_id", friendIds);

      if (results) {
        // Map results with friend info and sort by time
        const resultsWithNames = results.map(r => ({
          name: r.profiles?.name || "Unknown",
          correct: r.correct,
          timeTaken: r.time_taken,
          userId: r.user_id
        })).sort((a, b) => a.timeTaken - b.timeTaken);

        setDailyResults(resultsWithNames);
      }
    } catch (err) {
      console.error("Load daily results failed:", err);
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

  // Send verification code (simulated for now â generates a 4-digit code)
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
        try { localStorage.setItem("mathu_phone", phone); } catch {}
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
  const signIn = async (pinOverride) => {
    const pinToCheck = pinOverride || pin;
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
      if (profile.pin && profile.pin !== pinToCheck) {
        setCodeError("Incorrect PIN. Please try again.");
        return;
      }

      setUserId(profile.id);
      setUsername(profile.name);
      setEmail(profile.email || "");
      setYear(profile.year);
      setSelectedTopics(profile.topics || []);
      localStorage.setItem("mathu_session", profile.id);
      try { localStorage.setItem("mathu_phone", phone); } catch {}
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
    // Year filtering â "5th" year students might see easier questions
    // For now, all questions are available to all years
    if (available.length === 0) available = QUESTION_BANK.filter(q => selectedTopics.includes(q.topic));
    if (available.length === 0) available = QUESTION_BANK;

    // 40% of the time, focus on weakest topic (no topicFilter)
    if (!topicFilter && Math.random() < 0.4 && Object.keys(stats.topicStats).length > 0) {
      // Find weakest topic (lowest accuracy)
      let weakestTopic = null;
      let weakestAccuracy = 1;
      Object.entries(stats.topicStats).forEach(([topicKey, stat]) => {
        const accuracy = stat.attempted > 0 ? stat.correct / stat.attempted : 1;
        if (accuracy < weakestAccuracy) {
          weakestAccuracy = accuracy;
          weakestTopic = topicKey;
        }
      });
      if (weakestTopic) {
        const weakAvailable = available.filter(q => q.topic === weakestTopic);
        if (weakAvailable.length > 0) {
          return weakAvailable[Math.floor(Math.random() * weakAvailable.length)];
        }
      }
    }

    return available[Math.floor(Math.random() * available.length)];
  };

  const resetQuestionState = () => {
    setUserAnswer("");
    setHintsUsed(0);
    setShowHint([false, false, false]);
    setShowSolution(false);
    setIsCorrect(null);
    setTimer(0);
    setTimerRunning(true);
    setFrozen(false);
    setSimpleExplanation(null);
    // Multi-part reset
    setActivePart(0);
    setPartResults({});
    setPartSolutionVisible({});
    setPartHintsUsed({});
    setPartHintsRevealed({});
    setAiFeedback({});
    setAiLoading({});
  };

  const startDailyQuestion = () => {
    const today = new Date().toISOString().split("T")[0];
    const seed = today.split("-").reduce((acc, part) => acc + parseInt(part), 0);
    const q = QUESTION_BANK[seed % QUESTION_BANK.length];
    setCurrentQuestion(q);
    resetQuestionState();
    setScreen("question");
  };

  const startPractice = (topic = null) => {
    setPracticeMode(true);
    const q = getRandomQuestion(topic);
    setCurrentQuestion(q);
    resetQuestionState();
    setScreen("question");
  };

  // FEATURE 1: Explain Differently - simplify solution
  const explainSimply = (question) => {
    const steps = question.solution.split("\n\n");
    const simplified = steps.map((step, i) => {
      const prefixes = [
        "First, let's understand what we're being asked:",
        "Now, here's the key idea:",
        "Next step â and this is the important bit:",
        "Nearly there! Now we:",
        "Finally:",
        "And we're done:"
      ];
      const prefix = prefixes[Math.min(i, prefixes.length - 1)];
      return `${prefix}\n${step.trim()}`;
    }).join("\n\n");

    const tips = {
      algebra: "ð¡ Tip: Always check your answer by substituting back into the original equation.",
      differentiation: "ð¡ Tip: Remember â differentiation finds the rate of change. Think of it as 'how fast is y changing as x changes?'",
      integration: "ð¡ Tip: Integration is the reverse of differentiation. Always add +C for indefinite integrals!",
      trigonometry: "ð¡ Tip: Draw a diagram! Trig questions almost always become clearer with a picture.",
      coord_line: "ð¡ Tip: Sketch the points on a rough graph first â it helps you check if your answer makes sense.",
      coord_circle: "ð¡ Tip: The equation of a circle is (x-h)Â² + (y-k)Â² = rÂ². Centre is (h,k), radius is r.",
      complex_numbers: "ð¡ Tip: Plot complex numbers on an Argand diagram to visualise what's happening.",
      sequences_series: "ð¡ Tip: Always identify if it's arithmetic (common difference) or geometric (common ratio) first.",
      probability: "ð¡ Tip: Draw a tree diagram or Venn diagram â it makes the logic much clearer.",
      geometry: "ð¡ Tip: Label all angles and sides you know. Look for similar triangles or known theorems.",
      functions: "ð¡ Tip: Try sketching the graph to get a feel for the function's behaviour.",
      financial_maths: "ð¡ Tip: Write down what each variable represents before plugging into the formula.",
      statistics: "ð¡ Tip: Always state the null hypothesis clearly before starting any test.",
      induction: "ð¡ Tip: The three steps: prove base case, assume true for n=k, prove for n=k+1.",
      logs_indices: "ð¡ Tip: Remember log rules: log(ab) = log(a) + log(b), log(a/b) = log(a) - log(b).",
      length_area_volume: "ð¡ Tip: Always draw the shape and label dimensions. Check units!"
    };

    return simplified + "\n\n" + (tips[question.topic] || "ð¡ Tip: Read the question carefully twice before starting. Underline the key information.");
  };

  // FEATURE 3: Sound Effects using Web Audio API
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        // Happy ascending chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "wrong") {
        // Sad descending tone
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(300, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "applause") {
        // Applause-like sound: multiple short bursts of noise
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5) * 0.3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const applauseGain = ctx.createGain();
        applauseGain.gain.setValueAtTime(0.15, ctx.currentTime);
        applauseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

        // Add a bandpass filter to make it sound more like clapping
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 3000;
        filter.Q.value = 0.5;

        source.connect(filter);
        filter.connect(applauseGain);
        applauseGain.connect(ctx.destination);
        source.start(ctx.currentTime);
      }
    } catch (e) {
      // Silently fail if audio not available
    }
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
    const correct = isAnswerCorrect(userAnswer, currentQuestion.acceptedAnswers);
    setIsCorrect(correct);
    setShowSolution(true);

    // FEATURE 3: Play sound effects
    if (correct) {
      playSound("correct");
      setTimeout(() => playSound("applause"), 300);
    } else {
      playSound("wrong");
    }

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
        dailyChallengesCompleted: !practiceMode && correct ? prev.dailyChallengesCompleted + 1 : prev.dailyChallengesCompleted,
      };

      // Handle spaced repetition: add to wrongAnswers if incorrect
      if (!correct) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setWrongAnswers(prev => [...prev, {
          questionId: currentQuestion.id,
          wrongDate: new Date().toISOString(),
          nextReview: tomorrow.toISOString(),
          interval: 1,
        }]);
      } else {
        // If correct, remove from wrongAnswers if exists
        setWrongAnswers(prev => prev.filter(w => w.questionId !== currentQuestion.id));
      }

      // FEATURE 2: Weekly Challenge logic
      const today = new Date().toISOString().split("T")[0];
      const lastCompleted = weeklyChallenge.lastCompletedDate;
      if (correct && newStats.questionsToday >= weeklyChallenge.target) {
        // Check if it's a new day and we haven't already completed today
        if (lastCompleted !== today) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekStartStr = weekStart.toISOString().split("T")[0];

          let newWeeklyChallenge = { ...weeklyChallenge };
          // If we're starting a new week, reset the counter
          if (!weeklyChallenge.currentWeekStart || weeklyChallenge.currentWeekStart !== weekStartStr) {
            newWeeklyChallenge = {
              target: 5,
              daysCompleted: 1,
              currentWeekStart: weekStartStr,
              lastCompletedDate: today
            };
          } else {
            // Same week, increment days
            newWeeklyChallenge.daysCompleted = Math.min(weeklyChallenge.daysCompleted + 1, 7);
            newWeeklyChallenge.lastCompletedDate = today;
          }

          // Check if week is complete (7 days)
          if (newWeeklyChallenge.daysCompleted >= 7) {
            setXpAnimation((prev) => (prev || 0) + 50); // Add 50 bonus XP
            newStats.totalXP += 50;
          }

          setWeeklyChallenge(newWeeklyChallenge);
        }
      }

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

      // Save daily result if not in practice mode
      if (!practiceMode) {
        saveDailyResult(currentQuestion.id, correct, timer);
        // Reload daily results for friends
        if (friends.length > 0) {
          setTimeout(() => loadDailyResults(), 500);
        }
      }

      return newStats;
    });
  };

  // âââ MULTI-PART ANSWER CHECKING âââ
  const checkPartAnswer = (partIndex) => {
    if (!currentQuestion || !currentQuestion.parts) return;
    const part = currentQuestion.parts[partIndex];
    if (!part) return;

    const correct = isAnswerCorrect(userAnswer, part.acceptedAnswers);

    // Play sound
    if (correct) {
      playSound("correct");
    } else {
      playSound("wrong");
    }

    // Calculate XP for this part
    const hintPenalty = (partHintsUsed[partIndex] || 0) * 0.2;
    const xpEarned = correct ? Math.max(Math.round(part.xp * (1 - hintPenalty)), 2) : 0;

    if (correct && xpEarned > 0) {
      setXpAnimation(xpEarned);
      setTimeout(() => setXpAnimation(null), 2000);
    }

    // Record result for this part
    setPartResults(prev => ({
      ...prev,
      [partIndex]: { correct, answer: userAnswer, xpEarned, skipped: false }
    }));

    // Show solution for this part
    setPartSolutionVisible(prev => ({ ...prev, [partIndex]: true }));

    // Move to next part (or finish question)
    const nextPart = partIndex + 1;
    if (nextPart < currentQuestion.parts.length) {
      setActivePart(nextPart);
    } else {
      // All parts done â stop timer
      setTimerRunning(false);
    }

    // Reset answer input for next part
    setUserAnswer("");

    // Update stats
    const topicKey = currentQuestion.topic;
    const allTopics = getAllTopics();
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
        correctStreak: correct ? prev.correctStreak + 1 : 0,
        noHintStreak: correct && (partHintsUsed[partIndex] || 0) === 0 ? prev.noHintStreak + 1 : (correct ? prev.noHintStreak : 0),
        topicsAttempted: Object.keys(newTopicStats).length,
        topicStats: newTopicStats,
        questionsToday: prev.questionsToday + (nextPart >= currentQuestion.parts.length ? 1 : 0),
      };

      saveStats(newStats);
      return newStats;
    });
  };

  const skipPart = (partIndex) => {
    if (!currentQuestion || !currentQuestion.parts) return;

    playSound("wrong");

    setPartResults(prev => ({
      ...prev,
      [partIndex]: { correct: false, answer: "", xpEarned: 0, skipped: true }
    }));

    setPartSolutionVisible(prev => ({ ...prev, [partIndex]: true }));

    const nextPart = partIndex + 1;
    if (nextPart < currentQuestion.parts.length) {
      setActivePart(nextPart);
    } else {
      setTimerRunning(false);
    }

    setUserAnswer("");
  };

  const usePartHint = (partIndex, hintIndex) => {
    const currentHints = partHintsRevealed[partIndex] || [];
    if (hintIndex <= (partHintsUsed[partIndex] || 0)) {
      const newRevealed = [...currentHints];
      newRevealed[hintIndex] = true;
      setPartHintsRevealed(prev => ({ ...prev, [partIndex]: newRevealed }));
      setPartHintsUsed(prev => ({ ...prev, [partIndex]: Math.max(prev[partIndex] || 0, hintIndex + 1) }));
    }
  };

  // âââ AI WORKINGS ANALYSIS âââ
  const analyseWorkings = async (partIndex) => {
    if (!currentQuestion || !currentQuestion.parts) return;
    const part = currentQuestion.parts[partIndex];
    const result = partResults[partIndex];
    if (!part || !result) return;

    setAiLoading(prev => ({ ...prev, [partIndex]: true }));

    try {
      const response = await supabase.functions.invoke("analyse-workings", {
        body: {
          questionText: `${currentQuestion.source || `LC ${currentQuestion.year} P${currentQuestion.paper}`} Question ${currentQuestion.questionNumber} ${part.label}`,
          partLabel: part.label,
          studentWorkings: workingsText || "",
          studentAnswer: result.answer || "",
          correctAnswer: part.answer,
          correctSolution: part.solution,
          topic: currentQuestion.topic,
          subtopic: part.subtopic,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      if (data?.feedback) {
        setAiFeedback(prev => ({ ...prev, [partIndex]: data.feedback }));
      }
    } catch (err) {
      console.error("AI analysis error:", err);
      setAiFeedback(prev => ({
        ...prev,
        [partIndex]: {
          mistake: "Couldn't analyse your workings",
          explanation: "Compare your workings with the step-by-step solution above to find where you went wrong.",
          encouragement: "Keep practising â you'll get there!",
        },
      }));
    } finally {
      setAiLoading(prev => ({ ...prev, [partIndex]: false }));
    }
  };

  const isQuestionComplete = () => {
    if (!currentQuestion || !currentQuestion.parts) return false;
    return Object.keys(partResults).length >= currentQuestion.parts.length;
  };

  const getTotalXpEarned = () => {
    return Object.values(partResults).reduce((sum, r) => sum + (r.xpEarned || 0), 0);
  };

  const toggleFreeze = () => setFrozen(!frozen);

  // FEATURE 4: Avatar System - preset avatars
  const AVATARS = [
    "ð", "ð§ ", "ð", "ð", "ð", "ð¦", "ð±", "ð¶",
    "ð¦", "ð¼", "ð¦", "ð®", "â½", "ð", "ð¸", "ð¨",
    "ð", "ðª", "ð¥", "ð", "ð¯", "ð", "ð", "âï¸"
  ];

  // FEATURE 4: Avatar Display component
  const AvatarDisplay = ({ size = 48 }) => {
    if (customPhoto) {
      return (
        <div style={{
          width: size, height: size, borderRadius: size / 2,
          backgroundImage: `url(${customPhoto})`,
          backgroundSize: "cover", backgroundPosition: "center",
          border: `3px solid ${colors.primary}`,
        }} />
      );
    }
    if (avatar) {
      return (
        <div style={{
          width: size, height: size, borderRadius: size / 2,
          background: colors.gradient, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: size * 0.6, fontWeight: 800,
        }}>
          {avatar}
        </div>
      );
    }
    return (
      <div style={{
        width: size, height: size, borderRadius: size / 2, background: colors.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: size * 0.4, fontWeight: 800,
      }}>
        {username[0]?.toUpperCase() || "U"}
      </div>
    );
  };

  // âââ STYLES âââ
  const colors = darkMode ? {
    primary: "#8B5CF6",
    primaryDark: "#7C3AED",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    bg: "#0F172A",
    card: "#1E293B",
    text: "#F1F5F9",
    textLight: "#94A3B8",
    success: "#22C55E",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #C084FC 70%, #EC4899 100%)",
  } : {
    primary: "#8B5CF6",
    primaryDark: "#7C3AED",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    bg: "#FAF5FF",
    card: "#FFFFFF",
    text: "#1E293B",
    textLight: "#64748B",
    success: "#22C55E",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #C084FC 70%, #EC4899 100%)",
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
      width: "100%", maxWidth: 420, background: darkMode ? "#1E293B" : "white",
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

  // âââ LOADING SCREEN âââ
  if (loading) {
    return (
      <div style={{ ...styles.app, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: colors.gradient, position: "relative" }}>
        <MathSymbolsBackground variant="dark" />
        <div style={{ textAlign: "center", color: "white", position: "relative", zIndex: 1 }}>
          <MathULogo size={72} />
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: "12px 0 16px", letterSpacing: -2 }}>MathU</h1>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Loading...</div>
        </div>
      </div>
    );
  }

  // âââ SPLASH SCREEN âââ
  if (screen === "splash") {
    return (
      <div style={{ ...styles.app, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: colors.gradient, position: "relative" }}>
        <MathSymbolsBackground variant="dark" />
        <div style={{ textAlign: "center", color: "white", padding: 40, position: "relative", zIndex: 1 }}>
          <MathULogo size={80} />
          <h1 style={{
            fontSize: 52, fontWeight: 900, margin: "12px 0 4px", letterSpacing: -2,
            background: "linear-gradient(180deg, #FFFFFF 0%, #E0D4FF 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>MathU</h1>
          <p style={{ fontSize: 16, opacity: 0.9, margin: "0 0 8px", fontWeight: 500 }}>Your Daily Maths Challenge</p>
          <p style={{ fontSize: 13, opacity: 0.6, margin: "0 0 28px", letterSpacing: 1, textTransform: "uppercase" }}>Leaving Cert Honours Maths</p>
          {pendingInvite && (
            <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: 16, padding: "12px 20px", marginBottom: 24, border: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>ð You've been invited by a friend!</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>Sign up to connect and compete</div>
            </div>
          )}
          <button
            onClick={() => setScreen("signup_phone")}
            style={{
              ...styles.btn("white"), color: colors.primaryDark, fontSize: 18, padding: "16px 48px",
              boxShadow: "0 4px 24px rgba(124, 58, 237, 0.3)",
            }}
          >
            Get Started
          </button>
          <p onClick={() => setScreen("signin")} style={{ fontSize: 12, opacity: 0.6, marginTop: 24, cursor: "pointer" }}>
            Already have an account? <span style={{ textDecoration: "underline", fontWeight: 600 }}>Sign In</span>
          </p>
          <div style={{ fontSize: 9, opacity: 0.3, marginTop: 40 }}>v{APP_VERSION}</div>
        </div>
      </div>
    );
  }

  // âââ SIGN UP: PHONE âââ
  if (screen === "signup_phone") {
    const phoneDigits = phone.replace(/\D/g, "").length;
    const phoneValid = phoneDigits >= 7;
    return (
      <div style={{ ...styles.app, position: "relative" }}>
        <MathSymbolsBackground variant="light" />
        <div style={{ padding: "40px 24px 24px", position: "relative", zIndex: 1 }}>
          <button onClick={() => setScreen("splash")} style={{ background: "none", border: "none", fontSize: 16, color: colors.textLight, cursor: "pointer", marginBottom: 16 }}>â Back</button>
          <div style={{ textAlign: "center" }}>
            <MathULogo size={48} />
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 4px", color: colors.text }}>Create Account</h2>
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
          <p style={{ fontSize: 11, color: colors.textLight, margin: "0 0 6px" }}>You'll use this to sign in â don't forget it!</p>
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

  // âââ VERIFY CODE âââ
  if (screen === "verify_code") {
    return (
      <div style={{ ...styles.app, position: "relative" }}>
        <MathSymbolsBackground variant="light" />
        <div style={{ padding: "40px 24px 24px", position: "relative", zIndex: 1 }}>
          <button onClick={() => setScreen("signup_phone")} style={{ background: "none", border: "none", fontSize: 16, color: colors.textLight, cursor: "pointer", marginBottom: 16 }}>â Back</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>ð</div>
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

  // âââ SIGN IN âââ
  if (screen === "signin") {
    const hasSavedPhone = phoneSaved && phone && phone.replace(/\D/g, "").length >= 7;
    return (
      <div style={{ ...styles.app, position: "relative" }}>
        <MathSymbolsBackground variant="light" />
        <div style={{ padding: "40px 24px 24px", position: "relative", zIndex: 1 }}>
          <button onClick={() => setScreen("splash")} style={{ background: "none", border: "none", fontSize: 16, color: colors.textLight, cursor: "pointer", marginBottom: 16 }}>â Back</button>
          <div style={{ textAlign: "center" }}>
            <MathULogo size={48} />
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 8px", color: colors.text }}>Welcome Back!</h2>
            <p style={{ color: colors.textLight, margin: "0 0 32px", fontSize: 14 }}>
              {hasSavedPhone ? "Enter your 4-digit PIN" : "Sign in with your mobile number"}
            </p>
          </div>

          {hasSavedPhone ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 15, color: colors.textLight }}>+353 {phone}</span>
              <span onClick={() => { setPhone(""); setPhoneSaved(false); try { localStorage.removeItem("mathu_phone"); } catch {} }} style={{ fontSize: 12, color: colors.primary, cursor: "pointer", fontWeight: 600 }}>Change</span>
            </div>
          ) : (
            <>
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
            </>
          )}

          {!hasSavedPhone && <label style={{ fontSize: 13, fontWeight: 700, color: colors.text, display: "block", marginBottom: 6 }}>Your 4-digit PIN</label>}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                maxLength={1}
                autoFocus={i === 0 && hasSavedPhone}
                value={pin[i] || ""}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  const newPin = pin.split("");
                  newPin[i] = val;
                  const fullPin = newPin.join("");
                  setPin(fullPin);
                  setCodeError("");
                  if (val && i < 3) {
                    const next = e.target.parentElement.children[i + 1];
                    if (next) next.focus();
                  }
                  // Auto-login when all 4 digits entered
                  if (val && i === 3 && fullPin.length === 4 && phone.replace(/\D/g, "").length >= 7) {
                    setTimeout(() => signIn(fullPin), 150);
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

  // âââ ONBOARDING: YEAR âââ
  if (screen === "onboard_year") {
    return (
      <div style={styles.app}>
        <div style={{ padding: "40px 24px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>ð</div>
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
                <span style={{ fontSize: 36 }}>{y === "5th" ? "5ï¸â£" : "6ï¸â£"}</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{y} Year</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // âââ ONBOARDING: TOPICS âââ
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

  // âââ HOME SCREEN âââ
  if (screen === "home") {
    const level = getLevel(stats.totalXP);
    const xpProgress = level.xpForNext === Infinity ? 1 : (stats.totalXP - level.xpForCurrent) / (level.xpForNext - level.xpForCurrent);
    const allTopics = getAllTopics();

    return (
      <div style={styles.app}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Hey {username}! ð</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>MathU</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setScreen("add_friend")}
              style={{
                background: "none", border: "none", color: colors.text, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4
              }}>
              <div style={{ fontSize: 20 }}>ð¥</div>
              <div style={{ fontSize: 9, opacity: 0.8 }}>{friends.length}</div>
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>ð¥ {stats.streak}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>Streak</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>â¡ {stats.totalXP}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>XP</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 0 100px" }}>
          {/* Level card */}
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>Level {level.level} â {level.name}</span>
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
              <div style={{ fontSize: 42 }}>ð</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>
                  {stats.dailyCompleted ? "Daily Complete! â" : "Daily Challenge"}
                </h3>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                  {stats.dailyCompleted ? "Great work! Come back tomorrow." : "Today's question is waiting for you!"}
                </p>
              </div>
            </div>
            {!stats.dailyCompleted && (
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={startDailyQuestion}
                  style={{ ...styles.btn("white"), color: colors.primaryDark, flex: 1 }}>
                  Start Today's Challenge
                </button>
                <button onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  const inviteCode = getInviteCode(userId);
                  const shareText = `ð Join me on MathU! Daily maths challenges for Leaving Cert.\n\nUse my invite code: ${inviteCode}\n\nhttps://mathu-app.vercel.app?invite=${inviteCode}`;
                  navigator.clipboard.writeText(shareText);
                  alert("Invite message copied to clipboard!");
                }}
                  style={{ ...styles.btn("white"), color: colors.primaryDark, padding: "10px 14px" }}>
                  ð¨ Invite Friends
                </button>
              </div>
            )}

            {stats.dailyCompleted && dailyResults.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: `${colors.primary}10`, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: colors.text }}>Friends' Results</h4>
                {dailyResults.map((result, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < dailyResults.length - 1 ? `1px solid ${colors.textLight}30` : "none" }}>
                    <span style={{ fontSize: 13, color: colors.text }}>
                      {result.name} <span style={{ marginLeft: 8, fontSize: 12, color: colors.textLight }}>{result.correct ? "â" : "â"}</span>
                    </span>
                    <span style={{ fontSize: 12, color: colors.textLight }}>
                      â±ï¸ {Math.floor(result.timeTaken / 60) > 0 ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : `${result.timeTaken}s`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {stats.dailyCompleted && dailyResults.length === 0 && (
              <div style={{ marginTop: 16, padding: 12, background: `${colors.primary}10`, borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: colors.textLight }}>
                  Invite friends to compare scores!
                </p>
                <button onClick={() => {
                  const inviteCode = getInviteCode(userId);
                  const shareText = `ð Join me on MathU! Daily maths challenges for Leaving Cert.\n\nUse my invite code: ${inviteCode}\n\nhttps://mathu-app.vercel.app?invite=${inviteCode}`;
                  navigator.clipboard.writeText(shareText);
                  alert("Invite message copied to clipboard!");
                }}
                  style={{ ...styles.btn("white"), color: colors.primaryDark, width: "100%", marginTop: 8, padding: "8px" }}>
                  ð¨ Invite Friends
                </button>
              </div>
            )}
          </div>

          {/* FEATURE 2: Weekly Challenge card */}
          <div style={{...styles.card, background: `${colors.primary}10`, border: `2px solid ${colors.primary}30`}}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>ð</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: colors.text }}>
                  Weekly Challenge
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: colors.textLight }}>
                  Answer {weeklyChallenge.target} questions every day this week
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
              {Array.from({length: 7}).map((_, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: 14,
                  background: i < weeklyChallenge.daysCompleted ? colors.primary : "#e2e8f0",
                  color: i < weeklyChallenge.daysCompleted ? "white" : colors.textLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700
                }}>
                  {i < weeklyChallenge.daysCompleted ? "â" : ["M", "T", "W", "T", "F", "S", "S"][i]}
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
                Day {weeklyChallenge.daysCompleted}/7
              </span>
              {weeklyChallenge.daysCompleted > 0 && (
                <span style={{ fontSize: 12, color: colors.primary, fontWeight: 600, marginLeft: 8 }}>
                  {weeklyChallenge.daysCompleted === 7 ? "ð Complete!" : "Keep it up!"}
                </span>
              )}
            </div>
            <div style={{ textAlign: "center", fontSize: 12, color: colors.textLight }}>
              Bonus: <span style={{ fontWeight: 700, color: colors.accent }}>+50 XP</span> if you complete the week!
            </div>
          </div>

          {/* Quick Practice button */}
          <div style={styles.card}>
            <button onClick={() => startPractice()}
              style={{
                ...styles.btn(colors.secondary, true),
                fontSize: 18, padding: "18px 28px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
              ð Quick Practice
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: colors.textLight, marginTop: 8 }}>
              Jump into a random question from your topics
            </div>
          </div>

          {/* Practice by topic */}
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: colors.text }}>
              Practice by Topic ð
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
                View All Topics â
              </button>
            )}
          </div>

          {/* Quick stats */}
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: colors.text }}>Your Stats ð</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
              {[
                { label: "Correct", value: stats.totalCorrect, icon: "â" },
                { label: "Attempted", value: stats.totalAttempted, icon: "ð" },
                { label: "Accuracy", value: stats.totalAttempted ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100) + "%" : "â", icon: "ð¯" },
              ].map(s => (
                <div key={s.label} style={{ padding: 12, background: "#f8fafc", borderRadius: 12 }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: colors.textLight }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Mastery Tracker */}
          {Object.keys(stats.topicStats).length > 0 && (
            <div style={styles.card}>
              <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: colors.text }}>Topic Mastery ð¯</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {selectedTopics.slice(0, 9).map(topicKey => {
                  const topic = allTopics[topicKey];
                  const ts = stats.topicStats[topicKey];
                  const accuracy = ts ? (ts.correct / ts.attempted) * 100 : 0;
                  const barColor = accuracy >= 70 ? "#22C55E" : accuracy >= 40 ? "#F59E0B" : "#EF4444";
                  return (
                    <div key={topicKey} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{topic?.icon}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                        {topic?.name.substring(0, 12)}
                      </div>
                      <div style={{
                        width: "100%", height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%", width: `${accuracy}%`, background: barColor,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                      <div style={{ fontSize: 9, color: colors.textLight, marginTop: 2 }}>
                        {Math.round(accuracy)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bookmarks & Formulas buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 16px" }}>
            <button onClick={() => setScreen("bookmarks")}
              style={{
                ...styles.btn(colors.primary, true),
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "16px 12px", fontSize: 13, fontWeight: 700,
              }}>
              <span style={{ fontSize: 24 }}>ð</span>
              Saved ({bookmarks.length})
            </button>
            <button onClick={() => setScreen("formulas")}
              style={{
                ...styles.btn(colors.success, true),
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "16px 12px", fontSize: 13, fontWeight: 700,
              }}>
              <span style={{ fontSize: 24 }}>ð</span>
              Formulae & Tables
            </button>
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={styles.nav}>
          {[
            { icon: "ð ", label: "Home", scr: "home" },
            { icon: "ð", label: "Dashboard", scr: "dashboard" },
            { icon: "ð", label: "Leaderboard", scr: "leaderboard" },
            { icon: "ð", label: "Badges", scr: "badges" },
            { icon: "âï¸", label: "Settings", scr: "settings" },
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

  // âââ QUESTION SCREEN (Multi-Part Image-Based) âââ
  if (screen === "question") {
    const allTopics = getAllTopics();
    const topic = allTopics[currentQuestion?.topic];
    const hasParts = currentQuestion?.parts && currentQuestion.parts.length > 0;
    const questionComplete = isQuestionComplete();

    return (
      <div style={styles.app}>
        {/* XP animation */}
        {xpAnimation && (
          <div style={{
            position: "fixed", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
            fontSize: 48, fontWeight: 900, color: colors.accent, zIndex: 200,
            animation: "fadeUp 2s forwards", textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>
            +{xpAnimation} XP â¡
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
            â Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              background: frozen ? colors.accent : "rgba(255,255,255,0.2)",
              borderRadius: 20, padding: "6px 14px", fontSize: 16, fontWeight: 700,
            }}>
              {frozen ? "â¸ " : "â± "}{formatTime(timer)}
            </div>
            <button onClick={toggleFreeze}
              style={{
                background: frozen ? colors.success : "rgba(255,255,255,0.2)",
                border: "none", borderRadius: 20, padding: "6px 14px",
                color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
              {frozen ? "â¶ Resume" : "â Freeze"}
            </button>
          </div>
        </div>

        {frozen && (
          <div style={{
            background: "#FEF3C7", padding: "12px 20px", textAlign: "center",
            color: "#92400E", fontSize: 13, fontWeight: 600,
          }}>
            âï¸ Question frozen â take your time! Timer is paused.
          </div>
        )}

        <div style={{ padding: "0 0 40px", opacity: frozen ? 0.4 : 1, pointerEvents: frozen ? "none" : "auto" }}>
          {/* Topic + Source badge + Difficulty + Bookmark */}
          <div style={{ ...styles.card, paddingBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{
                  background: `${topic?.color || colors.primary}15`, color: topic?.color || colors.primary,
                  padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                }}>
                  {topic?.icon} {topic?.name}
                </span>
                {(() => {
                  const diffColor = currentQuestion.difficulty === 1 ? "#22C55E" : currentQuestion.difficulty === 2 ? "#F59E0B" : "#EF4444";
                  const diffLabel = ["", "Easy", "Medium", "Hard"][currentQuestion.difficulty];
                  return (
                    <span style={{
                      background: diffColor, color: "white",
                      padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                    }}>{diffLabel}</span>
                  );
                })()}
                {currentQuestion.totalMarks && (
                  <span style={{
                    background: "#f1f5f9", color: colors.textLight,
                    padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                  }}>{currentQuestion.totalMarks} marks</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => {
                  if (bookmarks.includes(currentQuestion.id)) {
                    setBookmarks(bookmarks.filter(id => id !== currentQuestion.id));
                  } else {
                    setBookmarks([...bookmarks, currentQuestion.id]);
                  }
                }}
                  style={{
                    background: bookmarks.includes(currentQuestion.id) ? colors.accent : "transparent",
                    border: `2px solid ${bookmarks.includes(currentQuestion.id) ? colors.accent : colors.textLight}`,
                    borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 14, fontWeight: 700,
                  }}>ð</button>
                <span style={{
                  background: "#eff6ff", color: "#2563eb",
                  padding: "4px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                }}>
                  {currentQuestion.source || `LC ${currentQuestion.year} P${currentQuestion.paper}`}
                </span>
              </div>
            </div>
            {/* Question number header */}
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>
              Question {currentQuestion.questionNumber}
              {currentQuestion.section && <span style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, marginLeft: 8 }}>Section {currentQuestion.section}</span>}
            </div>
          </div>

          {/* Question Image from PDF */}
          {currentQuestion.imagePath && (
            <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
              <img
                src={currentQuestion.imagePath}
                alt={`Question ${currentQuestion.questionNumber}`}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
                loading="eager"
              />
            </div>
          )}

          {/* Legacy text-based question fallback */}
          {!currentQuestion.imagePath && currentQuestion.question && (
            <div style={styles.card}>
              <MathText text={currentQuestion.question} style={{ fontSize: 16, color: colors.text, fontWeight: 500 }} />
              {currentQuestion.diagram && (
                <DiagramSVG name={currentQuestion.diagram.type} params={currentQuestion.diagram.params || {}} />
              )}
            </div>
          )}

          {/* âââ MULTI-PART QUESTION PANELS âââ */}
          {hasParts && currentQuestion.parts.map((part, pIdx) => {
            const result = partResults[pIdx];
            const isActive = pIdx === activePart && !result;
            const isLocked = pIdx > activePart && !result;
            const isDone = !!result;
            const hintsForPart = partHintsRevealed[pIdx] || [];
            const hintsUsedForPart = partHintsUsed[pIdx] || 0;

            return (
              <div key={pIdx} style={{
                ...styles.card,
                border: isActive ? `2px solid ${colors.primary}` : isDone ? `2px solid ${result.correct ? colors.success : colors.danger}` : "2px solid #e2e8f0",
                opacity: isLocked ? 0.5 : 1,
                transition: "all 0.3s",
              }}>
                {/* Part header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      background: isDone ? (result.correct ? colors.success : colors.danger) : isActive ? colors.primary : "#e2e8f0",
                      color: (isDone || isActive) ? "white" : colors.textLight,
                      padding: "4px 12px", borderRadius: 12, fontSize: 14, fontWeight: 800,
                    }}>
                      {part.label}
                    </span>
                    <span style={{ fontSize: 12, color: colors.textLight, fontWeight: 600 }}>
                      {part.marks} marks
                    </span>
                    {part.subtopic && (
                      <span style={{ fontSize: 11, color: colors.textLight, fontStyle: "italic" }}>
                        {part.subtopic}
                      </span>
                    )}
                  </div>
                  <div>
                    {isDone && result.correct && <span style={{ fontSize: 18 }}>â</span>}
                    {isDone && !result.correct && !result.skipped && <span style={{ fontSize: 18 }}>â</span>}
                    {isDone && result.skipped && <span style={{ fontSize: 18 }}>â­ï¸</span>}
                    {isActive && <span style={{ fontSize: 12, color: colors.primary, fontWeight: 700 }}>ACTIVE</span>}
                    {isLocked && <span style={{ fontSize: 14 }}>ð</span>}
                  </div>
                </div>

                {/* Locked message */}
                {isLocked && (
                  <div style={{ fontSize: 13, color: colors.textLight, textAlign: "center", padding: "8px 0" }}>
                    Complete {currentQuestion.parts[pIdx - 1]?.label || "previous part"} to unlock
                  </div>
                )}

                {/* Active part: hints, workings, answer input */}
                {isActive && (
                  <div>
                    {/* Hints for this part */}
                    {part.hints && part.hints.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>
                          ð¡ Hints {hintsUsedForPart > 0 && <span style={{ color: colors.accent }}>(â{hintsUsedForPart * 20}% XP)</span>}
                        </div>
                        {part.hints.map((hint, hIdx) => (
                          <div key={hIdx} style={{ marginBottom: 6 }}>
                            {hintsForPart[hIdx] ? (
                              <div style={{
                                background: "#FEF3C7", padding: "8px 12px", borderRadius: 8,
                                fontSize: 12, color: "#92400E", lineHeight: 1.4,
                              }}>
                                <strong>Hint {hIdx + 1}:</strong> <MathText text={hint} style={{ display: "inline" }} />
                              </div>
                            ) : (
                              <button onClick={() => usePartHint(pIdx, hIdx)}
                                disabled={hIdx > hintsUsedForPart}
                                style={{
                                  background: hIdx > hintsUsedForPart ? "#f1f5f9" : "#fffbeb",
                                  border: `1px solid ${hIdx > hintsUsedForPart ? "#e2e8f0" : "#fbbf24"}`,
                                  borderRadius: 8, padding: "6px 12px", width: "100%",
                                  cursor: hIdx > hintsUsedForPart ? "not-allowed" : "pointer",
                                  fontSize: 12, color: hIdx > hintsUsedForPart ? "#94a3b8" : "#b45309",
                                  fontWeight: 600, textAlign: "left",
                                }}>
                                {hIdx > hintsUsedForPart ? `ð Hint ${hIdx + 1}` : `ð¡ Reveal Hint ${hIdx + 1}`}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Workings area */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.textLight }}>âï¸ Workings</div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => setWorkingsMode("pen")}
                            style={{
                              background: workingsMode === "pen" ? colors.primary : "#f1f5f9",
                              color: workingsMode === "pen" ? "white" : colors.textLight,
                              border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11,
                              fontWeight: 600, cursor: "pointer",
                            }}>ð Pen</button>
                          <button onClick={() => setWorkingsMode("keyboard")}
                            style={{
                              background: workingsMode === "keyboard" ? colors.primary : "#f1f5f9",
                              color: workingsMode === "keyboard" ? "white" : colors.textLight,
                              border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11,
                              fontWeight: 600, cursor: "pointer",
                            }}>â¨ Keyboard</button>
                        </div>
                      </div>
                      {workingsMode === "pen" ? (
                        <DrawingCanvas />
                      ) : (
                        <div>
                          <textarea
                            ref={workingsTextRef}
                            value={workingsText}
                            onChange={e => setWorkingsText(e.target.value)}
                            placeholder="Type your workings here..."
                            style={{ ...styles.input, minHeight: 120, resize: "vertical", fontFamily: "'Courier New', monospace", fontSize: 14, lineHeight: 1.5 }}
                          />
                          <MathKeyboard showCalcRow={true}
                            onInsert={(sym) => {
                              const el = workingsTextRef.current;
                              if (!el) return;
                              const start = el.selectionStart;
                              const end = el.selectionEnd;
                              const newText = workingsText.slice(0, start) + sym + workingsText.slice(end);
                              setWorkingsText(newText);
                              setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + sym.length; }, 0);
                            }}
                            onCalculate={() => {
                              const el = workingsTextRef.current;
                              if (!el) return;
                              const cursor = el.selectionStart;
                              const lines = workingsText.split("\n");
                              let pos = 0, currentLineIdx = 0;
                              for (let i = 0; i < lines.length; i++) {
                                if (pos + lines[i].length >= cursor) { currentLineIdx = i; break; }
                                pos += lines[i].length + 1;
                              }
                              const currentLine = lines[currentLineIdx];
                              const exprPart = currentLine.replace(/\s*=\s*[\d.\-]+\s*$/, "").trim();
                              const result = evaluateMathExpr(exprPart);
                              if (result !== null) {
                                lines[currentLineIdx] = exprPart + " = " + result;
                                const newText = lines.join("\n") + "\n";
                                setWorkingsText(newText);
                                setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = newText.length; }, 0);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Answer input */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.textLight }}>Your Answer</div>
                        <button onClick={() => setShowAnswerKeyboard(!showAnswerKeyboard)}
                          style={{
                            background: showAnswerKeyboard ? colors.primary : "#f1f5f9",
                            color: showAnswerKeyboard ? "white" : colors.textLight,
                            border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10,
                            fontWeight: 600, cursor: "pointer",
                          }}>â¨ Symbols</button>
                      </div>
                      <input
                        ref={answerInputRef}
                        value={userAnswer}
                        onChange={e => setUserAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        style={styles.input}
                        onKeyDown={e => { if (e.key === "Enter" && userAnswer.trim()) checkPartAnswer(pIdx); }}
                      />
                      {showAnswerKeyboard && (
                        <MathKeyboard onInsert={(sym) => {
                          const el = answerInputRef.current;
                          if (!el) return;
                          const start = el.selectionStart;
                          const end = el.selectionEnd;
                          const newVal = userAnswer.slice(0, start) + sym + userAnswer.slice(end);
                          setUserAnswer(newVal);
                          setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + sym.length; }, 0);
                        }} />
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button onClick={() => checkPartAnswer(pIdx)} disabled={!userAnswer.trim()}
                          style={{ ...styles.btn(userAnswer.trim() ? colors.success : "#cbd5e1", true), flex: 2 }}>
                          Submit Answer
                        </button>
                        <button onClick={() => skipPart(pIdx)}
                          style={{ ...styles.btnOutline(colors.textLight), flex: 1, fontSize: 13 }}>
                          Skip â­ï¸
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed part: show result + solution */}
                {isDone && (
                  <div>
                    {/* Result banner */}
                    <div style={{
                      background: result.correct ? "#f0fdf4" : "#fef2f2",
                      borderRadius: 8, padding: "8px 12px", marginBottom: 8,
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: result.correct ? colors.success : colors.danger }}>
                        {result.correct ? "â Correct!" : result.skipped ? "â­ï¸ Skipped" : "â Not quite"}
                        {result.xpEarned > 0 && <span style={{ marginLeft: 8, color: colors.accent }}>+{result.xpEarned} XP</span>}
                      </div>
                      {result.answer && !result.skipped && (
                        <div style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
                          Your answer: {result.answer}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: colors.text, marginTop: 2, fontWeight: 600 }}>
                        Answer: {part.answer}
                      </div>
                    </div>

                    {/* Expandable solution */}
                    <button onClick={() => setPartSolutionVisible(prev => ({ ...prev, [pIdx]: !prev[pIdx] }))}
                      style={{
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: 8, padding: "8px 12px", width: "100%",
                        cursor: "pointer", fontSize: 12, fontWeight: 600,
                        color: colors.text, textAlign: "left",
                      }}>
                      {partSolutionVisible[pIdx] ? "â¼ Hide Solution" : "â¶ Show Solution"}
                    </button>

                    {partSolutionVisible[pIdx] && (
                      <div style={{
                        background: "white", borderRadius: 8, padding: 12, marginTop: 8,
                        border: "1px solid #e2e8f0",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>
                          Step-by-Step Solution:
                        </div>
                        {part.solution.split("\n\n").map((step, sIdx) => (
                          <div key={sIdx} style={{
                            padding: "8px 0",
                            borderBottom: sIdx < part.solution.split("\n\n").length - 1 ? "1px solid #f1f5f9" : "none",
                            display: "flex", gap: 8, alignItems: "flex-start",
                          }}>
                            <div style={{
                              minWidth: 20, height: 20, borderRadius: 10,
                              background: colors.primary, color: "white",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 800, marginTop: 2,
                            }}>{sIdx + 1}</div>
                            <div style={{ flex: 1 }}>
                              <MathText text={step.trim()} style={{ fontSize: 12, fontFamily: "'SF Mono', 'Fira Code', monospace" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI "Where did I go wrong?" â only for wrong/skipped answers */}
                    {!result.correct && (
                      <div style={{ marginTop: 8 }}>
                        {!aiFeedback[pIdx] && !aiLoading[pIdx] && (
                          <button onClick={() => analyseWorkings(pIdx)}
                            style={{
                              background: `${colors.accent}10`, border: `2px solid ${colors.accent}40`,
                              borderRadius: 8, padding: "10px 14px", width: "100%",
                              cursor: "pointer", fontSize: 13, fontWeight: 700,
                              color: colors.accent, textAlign: "center",
                              transition: "all 0.2s",
                            }}>
                            ð¤ Where did I go wrong?
                          </button>
                        )}

                        {aiLoading[pIdx] && (
                          <div style={{
                            background: `${colors.accent}08`, border: `2px solid ${colors.accent}20`,
                            borderRadius: 8, padding: "14px", textAlign: "center",
                          }}>
                            <div style={{ fontSize: 13, color: colors.accent, fontWeight: 600 }}>
                              Analysing your workings...
                            </div>
                            <div style={{ fontSize: 20, marginTop: 4, animation: "pulse 1.5s infinite" }}>ð§ </div>
                          </div>
                        )}

                        {aiFeedback[pIdx] && (
                          <div style={{
                            background: `${colors.accent}08`, border: `2px solid ${colors.accent}25`,
                            borderRadius: 10, padding: 14, marginTop: 4,
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: colors.accent, marginBottom: 8 }}>
                              ð¤ AI Tutor Feedback
                            </div>

                            {aiFeedback[pIdx].mistake && (
                              <div style={{
                                background: `${colors.danger}10`, borderRadius: 6, padding: "8px 10px", marginBottom: 8,
                                borderLeft: `3px solid ${colors.danger}`,
                              }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: colors.danger, marginBottom: 2 }}>Key Mistake:</div>
                                <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.4 }}>
                                  <MathText text={aiFeedback[pIdx].mistake} />
                                </div>
                              </div>
                            )}

                            {aiFeedback[pIdx].explanation && (
                              <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.5, marginBottom: 8 }}>
                                <MathText text={aiFeedback[pIdx].explanation} />
                              </div>
                            )}

                            {aiFeedback[pIdx].encouragement && (
                              <div style={{
                                background: `${colors.success}10`, borderRadius: 6, padding: "6px 10px",
                                fontSize: 12, color: colors.success, fontWeight: 600,
                              }}>
                                ðª {aiFeedback[pIdx].encouragement}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Question Complete Summary */}
          {hasParts && questionComplete && (
            <div style={{
              ...styles.card,
              background: colors.gradient,
              color: "white",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>ð</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Question Complete!</div>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
                {Object.values(partResults).filter(r => r.correct).length} / {currentQuestion.parts.length} parts correct
                {getTotalXpEarned() > 0 && ` â +${getTotalXpEarned()} XP`}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button onClick={() => { setScreen("home"); setPracticeMode(false); }}
                  style={{ ...styles.btnOutline("white"), color: "white", borderColor: "rgba(255,255,255,0.5)" }}>
                  Home
                </button>
                <button onClick={() => startPractice()}
                  style={{ background: "white", color: colors.primary, border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Next Question â
                </button>
              </div>
            </div>
          )}

          {/* Legacy: old single-answer workings section â only shown for old-format questions without parts */}
          {!hasParts && (
            <div>
              {/* Old Workings Section */}
              <div style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLight }}>âï¸ Workings</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => setWorkingsMode("pen")}
                      style={{
                        background: workingsMode === "pen" ? colors.primary : "#f1f5f9",
                        color: workingsMode === "pen" ? "white" : colors.textLight,
                        border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12,
                        fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                      }}
                    >ð Pen</button>
                <button
                  onClick={() => setWorkingsMode("keyboard")}
                  style={{
                    background: workingsMode === "keyboard" ? colors.primary : "#f1f5f9",
                    color: workingsMode === "keyboard" ? "white" : colors.textLight,
                    border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12,
                    fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  }}
                >â¨ Keyboard</button>
              </div>
            </div>
            {workingsMode === "pen" ? (
              <DrawingCanvas />
            ) : (
              <div>
                <textarea
                  ref={workingsTextRef}
                  value={workingsText}
                  onChange={e => setWorkingsText(e.target.value)}
                  placeholder="Type your workings here... Use the keyboard below for maths symbols"
                  style={{
                    ...styles.input,
                    minHeight: 180,
                    resize: "vertical",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                />
                <MathKeyboard
                  showCalcRow={true}
                  onInsert={(sym) => {
                    const el = workingsTextRef.current;
                    if (!el) return;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const newText = workingsText.slice(0, start) + sym + workingsText.slice(end);
                    setWorkingsText(newText);
                    setTimeout(() => {
                      el.focus();
                      el.selectionStart = el.selectionEnd = start + sym.length;
                    }, 0);
                  }}
                  onCalculate={() => {
                    const el = workingsTextRef.current;
                    if (!el) return;
                    // Find the current line the cursor is on
                    const cursor = el.selectionStart;
                    const lines = workingsText.split("\n");
                    let pos = 0;
                    let currentLineIdx = 0;
                    for (let i = 0; i < lines.length; i++) {
                      if (pos + lines[i].length >= cursor) { currentLineIdx = i; break; }
                      pos += lines[i].length + 1; // +1 for newline
                    }
                    const currentLine = lines[currentLineIdx];
                    // Try to evaluate the current line (strip any existing "= result" suffix)
                    const exprPart = currentLine.replace(/\s*=\s*[\d.\-]+\s*$/, "").trim();
                    const result = evaluateMathExpr(exprPart);
                    if (result !== null) {
                      lines[currentLineIdx] = exprPart + " = " + result;
                      const newText = lines.join("\n") + "\n";
                      setWorkingsText(newText);
                      setTimeout(() => {
                        el.focus();
                        el.selectionStart = el.selectionEnd = newText.length;
                      }, 0);
                    }
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                  <button onClick={() => setWorkingsText("")} style={{
                    background: "#ef4444", color: "white",
                    border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}>Clear</button>
                </div>
              </div>
            )}
          </div>

          {/* Answer Input */}
          {!showSolution ? (
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLight }}>Your Answer</div>
                <button
                  onClick={() => setShowAnswerKeyboard(!showAnswerKeyboard)}
                  style={{
                    background: showAnswerKeyboard ? colors.primary : "#f1f5f9",
                    color: showAnswerKeyboard ? "white" : colors.textLight,
                    border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11,
                    fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  }}
                >â¨ Symbols</button>
              </div>
              <input
                ref={answerInputRef}
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Type your final answer here..."
                style={styles.input}
              />
              {showAnswerKeyboard && (
                <MathKeyboard onInsert={(sym) => {
                  const el = answerInputRef.current;
                  if (!el) return;
                  const start = el.selectionStart;
                  const end = el.selectionEnd;
                  const newVal = userAnswer.slice(0, start) + sym + userAnswer.slice(end);
                  setUserAnswer(newVal);
                  setTimeout(() => {
                    el.focus();
                    el.selectionStart = el.selectionEnd = start + sym.length;
                  }, 0);
                }} />
              )}
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
                {isCorrect ? "â Correct!" : "â Not quite"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                Answer: {currentQuestion.answer}
              </div>
              {isCorrect && (
                <div style={{ fontSize: 13, color: colors.accent, fontWeight: 700, marginBottom: 8 }}>
                  +{Math.round(currentQuestion.xp * (1 - hintsUsed * 0.2))} XP earned! â¡
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
                    <div style={{ flex: 1 }}>
                      <MathText text={step.trim()} style={{ fontSize: 13, fontFamily: "'SF Mono', 'Fira Code', monospace" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* FEATURE 1: Explain Differently button */}
              <button onClick={() => setSimpleExplanation(simpleExplanation ? null : explainSimply(currentQuestion))}
                style={{
                  background: simpleExplanation ? colors.accent : `${colors.accent}15`,
                  color: simpleExplanation ? "white" : colors.accent,
                  border: `2px solid ${colors.accent}`,
                  borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", width: "100%", marginTop: 12,
                  transition: "all 0.2s",
                }}>
                {simpleExplanation ? "Hide Simple Explanation" : "ð¤ Explain it Differently"}
              </button>

              {simpleExplanation && (
                <div style={{
                  background: `${colors.accent}08`, border: `2px solid ${colors.accent}25`,
                  borderRadius: 12, padding: 16, marginTop: 12,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.accent, marginBottom: 8 }}>
                    ð Simpler Explanation
                  </div>
                  {simpleExplanation.split("\n\n").map((para, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <MathText text={para} style={{ fontSize: 13, color: colors.text }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Self-assessment: where did you go wrong? */}
              {!isCorrect && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
                    ð¤ Where did you get stuck?
                  </div>
                  <p style={{ fontSize: 12, color: colors.textLight, margin: "0 0 8px" }}>
                    Tap the step where you first went wrong â this helps us track what to focus on.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {currentQuestion.solution.split("\n\n").map((step, i) => (
                      <button key={i} onClick={() => {
                        alert(`Got it â we'll note that Step ${i + 1} was tricky for you on ${currentQuestion.subtopic}. Keep practising!`);
                      }} style={{
                        padding: "8px 14px", borderRadius: 10,
                        border: `2px solid ${colors.danger}30`, background: `${colors.danger}08`,
                        fontSize: 12, fontWeight: 600, color: colors.danger, cursor: "pointer",
                      }}>
                        Step {i + 1}
                      </button>
                    ))}
                    <button onClick={() => {
                      alert("No worries â keep practising and you'll get there!");
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
                <div>
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10 }}>
                    <div style={{ fontSize: 13, color: colors.success, fontWeight: 600 }}>
                      ðª Compare your workings with the solution above. Did you use the same method?
                    </div>
                  </div>

                  {!practiceMode && (
                    <button onClick={() => {
                      try {
                        const today = new Date().toISOString().split("T")[0];
                        const timeStr = Math.floor(timer / 60) > 0 ? `${Math.floor(timer / 60)}m ${timer % 60}s` : `${timer}s`;
                        const inviteCode = getInviteCode(userId);
                        const shareText = `ð MathU Daily Challenge\nðï¸ ${today}\nâ Got it right!\nâ±ï¸ ${timeStr}\n\nJoin me! Use code: ${inviteCode}\nhttps://mathu-app.vercel.app?invite=${inviteCode}`;
                        navigator.clipboard.writeText(shareText);
                        alert("Share message copied to clipboard!");
                      } catch (err) {
                        console.error("Share failed:", err);
                        alert("Failed to copy. Please try again.");
                      }
                    }}
                      style={{
                        ...styles.btn(colors.primary, true),
                        marginTop: 16,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                      ð¤ Share Challenge
                    </button>
                  )}

                  {!practiceMode && !isCorrect && (
                    <button onClick={() => {
                      try {
                        const today = new Date().toISOString().split("T")[0];
                        const timeStr = Math.floor(timer / 60) > 0 ? `${Math.floor(timer / 60)}m ${timer % 60}s` : `${timer}s`;
                        const inviteCode = getInviteCode(userId);
                        const shareText = `ð MathU Daily Challenge\nðï¸ ${today}\nâ Need more practice!\nâ±ï¸ ${timeStr}\n\nJoin me! Use code: ${inviteCode}\nhttps://mathu-app.vercel.app?invite=${inviteCode}`;
                        navigator.clipboard.writeText(shareText);
                        alert("Share message copied to clipboard!");
                      } catch (err) {
                        console.error("Share failed:", err);
                        alert("Failed to copy. Please try again.");
                      }
                    }}
                      style={{
                        ...styles.btn(colors.primary, true),
                        marginTop: 16,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                      ð¤ Share Attempt
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => { setScreen("home"); setPracticeMode(false); }}
                  style={styles.btnOutline(colors.textLight)}>
                  Home
                </button>
                <button onClick={() => startPractice()}
                  style={{ ...styles.btn(colors.primary), flex: 1 }}>
                  Practice Another â
                </button>
              </div>
            </div>
          )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // âââ ADD FRIEND SCREEN âââ
  if (screen === "add_friend") {
    const inviteCode = getInviteCode(userId);

    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: colors.text, cursor: "pointer", fontSize: 18 }}>â</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, flex: 1, textAlign: "center" }}>ð¥ Friends</h2>
          <div style={{ width: 32 }} />
        </div>

        <div style={{ padding: "16px", paddingBottom: "100px" }}>
          {/* Your invite code */}
          <div style={{ ...styles.card, background: colors.gradient, color: "white", marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>Your Invite Code</h3>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "monospace", marginBottom: 12, textAlign: "center", letterSpacing: 4 }}>
              {inviteCode}
            </div>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>
              Share this code with friends so they can add you on MathU!
            </p>
            <button onClick={() => {
              try {
                navigator.clipboard.writeText(inviteCode);
                alert("Code copied to clipboard!");
              } catch (err) {
                alert("Failed to copy. Please try again.");
              }
            }}
              style={{
                background: "white", color: colors.primaryDark, border: "none", borderRadius: 8,
                padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 12,
                width: "100%"
              }}>
              Copy Code
            </button>
          </div>

          {/* Add friend section */}
          <div style={styles.card}>
            {pendingInvite && (
              <div style={{ background: `${colors.success}15`, border: `2px solid ${colors.success}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.success }}>
                  ð You've been invited! Tap "Add Friend" to connect.
                </div>
              </div>
            )}
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: colors.text }}>Add a Friend</h3>
            <input
              type="text"
              placeholder="Enter friend's code..."
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
              style={{
                ...styles.input,
                fontSize: 14,
                letterSpacing: 2,
                textAlign: "center",
                marginBottom: 12
              }}
            />
            <button onClick={() => addFriend(friendCode)}
              style={{
                ...styles.btn(colors.primary),
                width: "100%"
              }}>
              Add Friend
            </button>
          </div>

          {/* Friends list */}
          {friends.length > 0 && (
            <div style={styles.card}>
              <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: colors.text }}>
                Your Friends ({friends.length})
              </h3>
              {friends.map((friend) => (
                <div key={friend.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px", background: colors.bg, borderRadius: 8, marginBottom: 8
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>ð¤ {friend.name}</span>
                  <button onClick={() => {
                    try {
                      const inviteMsg = `ð Join me on MathU! Daily maths challenges for Leaving Cert.\n\nUse my invite code: ${inviteCode}\n\nhttps://mathu-app.vercel.app?invite=${inviteCode}`;
                      navigator.clipboard.writeText(inviteMsg);
                      alert("Invite message copied!");
                    } catch (err) {
                      alert("Failed to copy.");
                    }
                  }}
                    style={{
                      ...styles.btnOutline(colors.primary),
                      padding: "6px 12px", fontSize: 11
                    }}>
                    Share
                  </button>
                </div>
              ))}
            </div>
          )}

          {friends.length === 0 && (
            <div style={{
              ...styles.card,
              textAlign: "center",
              background: `${colors.primary}08`,
              border: `1px dashed ${colors.primary}30`
            }}>
              <p style={{ fontSize: 13, color: colors.textLight, margin: 0 }}>
                No friends yet. Add a friend to compare daily scores!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // âââ DASHBOARD âââ
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
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>ð Dashboard</h2>
          <span style={{ fontSize: 13, opacity: 0.8 }}>{year} Year</span>
        </div>
        <div style={{ padding: "0 0 100px" }}>
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: colors.text }}>Performance by Topic</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: colors.textLight }}>Sorted weakest â strongest</p>
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
                      {ts.correct}/{ts.attempted} correct Â· Avg {Math.round(ts.totalTime / ts.attempted)}s per question
                    </div>
                  )}
                  <button onClick={() => startPractice(key)}
                    style={{
                      background: "none", border: "none", color: topic.color,
                      fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 0",
                    }}>
                    Practice {topic.name} â
                  </button>
                </div>
              );
            })}
          </div>

          {/* Weakest topics callout */}
          {topicEntries.filter(e => e.stats && e.stats.correct / e.stats.attempted < 0.5).length > 0 && (
            <div style={{ ...styles.card, background: "#FEF2F2", border: "2px solid #FECACA" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: colors.danger }}>
                â ï¸ Focus Areas
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
            { icon: "ð ", label: "Home", scr: "home" },
            { icon: "ð", label: "Dashboard", scr: "dashboard" },
            { icon: "ð", label: "Leaderboard", scr: "leaderboard" },
            { icon: "ð", label: "Badges", scr: "badges" },
            { icon: "âï¸", label: "Settings", scr: "settings" },
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

  // âââ LEADERBOARD âââ
  if (screen === "leaderboard") {
    const allPlayers = [...leaderboard, { name: `${username} (You)`, xp: stats.totalXP, streak: stats.streak, school: "Your School" }]
      .sort((a, b) => b.xp - a.xp);

    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>ð Leaderboard</h2>
          <span style={{ fontSize: 13, opacity: 0.8 }}>This Week</span>
        </div>
        <div style={{ padding: "0 0 100px" }}>
          {/* Top 3 */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8, padding: "20px 16px 0" }}>
            {[1, 0, 2].map(idx => {
              const p = allPlayers[idx];
              if (!p) return null;
              const isCenter = idx === 0;
              const medals = ["ð¥", "ð¥", "ð¥"];
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
                    <div style={{ fontSize: 18, fontWeight: 900 }}>â¡ {p.xp}</div>
                    <div style={{ fontSize: 10, opacity: 0.7 }}>ð¥ {p.streak} days</div>
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
                  <div style={{ fontSize: 14, fontWeight: 800, color: colors.text }}>â¡ {p.xp}</div>
                  <div style={{ fontSize: 11, color: colors.textLight }}>ð¥ {p.streak}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.nav}>
          {[
            { icon: "ð ", label: "Home", scr: "home" },
            { icon: "ð", label: "Dashboard", scr: "dashboard" },
            { icon: "ð", label: "Leaderboard", scr: "leaderboard" },
            { icon: "ð", label: "Badges", scr: "badges" },
            { icon: "âï¸", label: "Settings", scr: "settings" },
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

  // âââ BADGES SCREEN âââ
  if (screen === "badges") {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>ð Badges</h2>
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
                    {earned && <div style={{ fontSize: 10, color: colors.success, fontWeight: 700, marginTop: 4 }}>â Earned</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.nav}>
          {[
            { icon: "ð ", label: "Home", scr: "home" },
            { icon: "ð", label: "Dashboard", scr: "dashboard" },
            { icon: "ð", label: "Leaderboard", scr: "leaderboard" },
            { icon: "ð", label: "Badges", scr: "badges" },
            { icon: "âï¸", label: "Settings", scr: "settings" },
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

  // âââ BOOKMARKS SCREEN âââ
  if (screen === "bookmarks") {
    const allTopics = getAllTopics();
    const bookmarkedQuestions = QUESTION_BANK.filter(q => bookmarks.includes(q.id));

    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <button onClick={() => setScreen("home")}
            style={{ background: "none", border: "none", color: "white", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>
            â Back
          </button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>ð Saved Questions</h2>
          <div style={{ width: 32 }} />
        </div>
        <div style={{ padding: "0 0 100px" }}>
          {bookmarkedQuestions.length === 0 ? (
            <div style={{ ...styles.card, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>ð</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: colors.text }}>No saved questions yet</h3>
              <p style={{ margin: 0, fontSize: 13, color: colors.textLight }}>Bookmark questions while practicing to study them later</p>
            </div>
          ) : (
            <div>
              {bookmarkedQuestions.map(q => {
                const qTopic = allTopics[q.topic];
                return (
                  <button key={q.id} onClick={() => {
                    setCurrentQuestion(q);
                    setUserAnswer("");
                    setHintsUsed(0);
                    setShowHint([false, false, false]);
                    setShowSolution(false);
                    setIsCorrect(null);
                    setTimer(0);
                    setTimerRunning(true);
                    setFrozen(false);
                    setPracticeMode(true);
                    setScreen("question");
                  }}
                    style={{
                      ...styles.card,
                      textAlign: "left", cursor: "pointer", margin: "12px 16px",
                      transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      border: "none",
                    }}
                    onMouseEnter={e => e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
                    onMouseLeave={e => e.target.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
                  >
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <span style={{
                        background: `${qTopic?.color || colors.primary}15`, color: qTopic?.color || colors.primary,
                        padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      }}>
                        {qTopic?.icon} {qTopic?.name}
                      </span>
                      <span style={{
                        background: q.difficulty === 1 ? "#dbeafe" : q.difficulty === 2 ? "#fef3c7" : "#fee2e2",
                        color: q.difficulty === 1 ? "#0284c7" : q.difficulty === 2 ? "#b45309" : "#991b1b",
                        padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      }}>
                        {["", "Easy", "Medium", "Hard"][q.difficulty]}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                      {q.question.substring(0, 60)}...
                    </div>
                    <div style={{ fontSize: 12, color: colors.textLight }}>
                      {q.source}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // âââ FORMULAE & TABLES SCREEN âââ
  if (screen === "formulas") {
    const formulaeSections = [
      { id: "algebra", name: "Algebra", pages: [20], icon: "x" },
      { id: "area-approx", name: "Area Approximations", pages: [12], icon: "â" },
      { id: "calculus", name: "Calculus", pages: [25, 26, 27], icon: "â«" },
      { id: "coord-geom", name: "Co-ordinate Geometry", pages: [18, 19], icon: "ð" },
      { id: "economics", name: "Economics", pages: [28, 29], icon: "ð" },
      { id: "financial", name: "Financial Mathematics", pages: [30, 31, 32], icon: "ð°" },
      { id: "geometry", name: "Geometry", pages: [17], icon: "â³" },
      { id: "indices", name: "Indices & Logarithms", pages: [21], icon: "^" },
      { id: "length-area", name: "Length & Area", pages: [8, 9], icon: "â¡" },
      { id: "sequences", name: "Sequences & Series", pages: [22], icon: "Î£" },
      { id: "sets-logic", name: "Sets & Logic", pages: [23, 24], icon: "â©" },
      { id: "stats", name: "Statistics & Probability", pages: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43], icon: "Ï" },
      { id: "surface-vol", name: "Surface Area & Volume", pages: [10, 11], icon: "â¬¡" },
      { id: "trig", name: "Trigonometry", pages: [13, 14, 15, 16], icon: "Î¸" },
      { id: "units", name: "Units of Measurement", pages: [44, 45], icon: "m" },
    ];

    const scrollToSection = (id) => {
      const el = formulaeRefs.current[id];
      if (el && formulaeScrollRef.current) {
        const container = formulaeScrollRef.current;
        const top = el.offsetTop - container.offsetTop - 60;
        container.scrollTo({ top, behavior: "smooth" });
      }
    };

    return (
      <div style={styles.app}>
        <div style={{
          ...styles.header,
          flexDirection: "column", alignItems: "stretch", padding: "12px 16px 0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <button onClick={() => setScreen("home")}
              style={{ background: "none", border: "none", color: "white", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>
              â Back
            </button>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Formulae & Tables</h2>
            <div style={{ width: 48 }} />
          </div>
          {/* Alphabetical quick-jump index */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 4, paddingBottom: 10,
          }}>
            {formulaeSections.map(s => (
              <button key={s.id} onClick={() => scrollToSection(s.id)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8, padding: "5px 8px", cursor: "pointer",
                  fontSize: 10, fontWeight: 600, color: "white",
                  whiteSpace: "nowrap", lineHeight: 1.2,
                  backdropFilter: "blur(4px)",
                }}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div ref={formulaeScrollRef} style={{ padding: "0 12px 100px", overflowY: "auto", flex: 1 }}>
          {formulaeSections.map(section => (
            <div key={section.id} ref={el => formulaeRefs.current[section.id] = el}
              style={{ marginBottom: 20 }}>
              {/* Section header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 0 8px", position: "sticky", top: 0,
                background: colors.bg, zIndex: 2,
                borderBottom: `2px solid ${colors.primary}`,
                marginBottom: 8,
              }}>
                <span style={{
                  fontSize: 20, width: 36, height: 36, borderRadius: 10,
                  background: `${colors.primary}15`, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>{section.icon}</span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: colors.text }}>
                  {section.name}
                </h3>
                <span style={{ fontSize: 11, color: colors.textLight, marginLeft: "auto" }}>
                  p.{section.pages[0]}{section.pages.length > 1 ? `â${section.pages[section.pages.length - 1]}` : ""}
                </span>
              </div>
              {/* Page images */}
              {section.pages.map(pageNum => (
                <img
                  key={pageNum}
                  src={`/formulae/page-${String(pageNum).padStart(2, "0")}.png`}
                  alt={`${section.name} page ${pageNum}`}
                  style={{
                    width: "100%", borderRadius: 8, marginBottom: 8,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    border: `1px solid ${colors.textLight}20`,
                  }}
                  loading="lazy"
                />
              ))}
            </div>
          ))}
          <div style={{ textAlign: "center", padding: "16px 0 40px", color: colors.textLight, fontSize: 11 }}>
            Source: SEC Formulae & Tables Booklet
          </div>
        </div>
      </div>
    );
  }

  // âââ SETTINGS âââ
  if (screen === "settings") {
    const allTopics = getAllTopics();
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>âï¸ Settings</h2>
        </div>
        <div style={{ padding: "0 0 100px" }}>
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: colors.text }}>Profile</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <AvatarDisplay size={48} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>{username}</div>
                <div style={{ fontSize: 13, color: colors.textLight }}>{year} Year Â· Honours Maths</div>
              </div>
            </div>

            {/* FEATURE 4: Avatar customization */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.textLight}20` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
                Choose Your Avatar ð¨
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 12 }}>
                {AVATARS.map(emoji => (
                  <button key={emoji} onClick={() => {
                    setAvatar(emoji);
                    setCustomPhoto(null);
                  }} style={{
                    fontSize: 24, padding: 8, borderRadius: 8, border: avatar === emoji ? `3px solid ${colors.primary}` : `2px solid ${colors.textLight}30`,
                    background: avatar === emoji ? `${colors.primary}15` : "transparent", cursor: "pointer",
                    transition: "all 0.2s"
                  }}>
                    {emoji}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => fileInputRef.current?.click()} style={{
                  ...styles.btn(colors.secondary, true), flex: 1, fontSize: 13, padding: "10px 12px"
                }}>
                  ð· Upload Photo
                </button>
                <button onClick={() => {
                  setAvatar(null);
                  setCustomPhoto(null);
                }} style={{
                  ...styles.btnOutline(colors.textLight), flex: 1, fontSize: 13, padding: "10px 12px"
                }}>
                  Reset
                </button>
              </div>
              <input type="file" accept="image/*" style={{display:"none"}} ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setCustomPhoto(ev.target.result);
                    setAvatar(null);
                  };
                  reader.readAsDataURL(file);
                }
              }} />
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

          {/* Display Settings */}
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: colors.text }}>Display & Sound</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: colors.text, fontWeight: 600 }}>ð Dark Mode</span>
              <button onClick={() => setDarkMode(!darkMode)}
                style={{
                  background: darkMode ? colors.primary : "#e2e8f0",
                  border: "none", borderRadius: 20, cursor: "pointer",
                  width: 44, height: 24, display: "flex", alignItems: "center",
                  padding: darkMode ? "2px 2px 2px 22px" : "2px 22px 2px 2px",
                }}>
                <div style={{
                  width: 18, height: 18, background: "white", borderRadius: 10,
                  transition: "all 0.3s",
                }} />
              </button>
            </div>
            {/* FEATURE 3: Sound Effects toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: colors.text, fontWeight: 600 }}>ð Sound Effects</span>
              <button onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  background: soundEnabled ? colors.primary : "#e2e8f0",
                  border: "none", borderRadius: 20, cursor: "pointer",
                  width: 44, height: 24, display: "flex", alignItems: "center",
                  padding: soundEnabled ? "2px 2px 2px 22px" : "2px 22px 2px 2px",
                }}>
                <div style={{
                  width: 18, height: 18, background: "white", borderRadius: 10,
                  transition: "all 0.3s",
                }} />
              </button>
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
            { icon: "ð ", label: "Home", scr: "home" },
            { icon: "ð", label: "Dashboard", scr: "dashboard" },
            { icon: "ð", label: "Leaderboard", scr: "leaderboard" },
            { icon: "ð", label: "Badges", scr: "badges" },
            { icon: "âï¸", label: "Settings", scr: "settings" },
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
