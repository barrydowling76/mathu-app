# MathU - Daily Maths Challenge

A Duolingo-style daily maths practice app for Irish Leaving Certificate Honours Maths students (5th & 6th Year).

## Features

- **Daily Challenge** — One question per day (same for everyone, Wordle-style)
- **16 LC Honours Maths Topics** — Covering both Paper 1 and Paper 2
- **Handwriting Canvas** — Draw workings with your finger on screen
- **Freeze/Resume Timer** — Pause mid-question (e.g. getting off the bus)
- **Progressive Hints** — 3 hint levels per question (reduces XP earned)
- **Full Gamification** — Streaks, XP, levels, leaderboards, badges
- **Performance Dashboard** — See strongest and weakest topics at a glance
- **Practice Mode** — Extra questions filtered by topic
- **Past Paper Questions** — Sourced from real Leaving Cert exams, marked with year
- **Custom Questions** — Verified variations for extra practice

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A GitHub account
- A Vercel account (free at vercel.com)

### Local Development

```bash
npm install
npm run dev
```

Opens at http://localhost:3000

### Deploy to Vercel

1. Push this folder to a new GitHub repository
2. Go to vercel.com and sign in with GitHub
3. Click "New Project" → Import your mathu-app repo
4. Vercel auto-detects Vite — just click "Deploy"
5. Your app is live at https://your-project.vercel.app

Students can then visit the URL on their phones and add it to their home screen as a PWA.

## Tech Stack

- React 18
- Vite 6
- Deployed as a Progressive Web App (PWA)

## Topics Covered

### Paper 1
Algebra, Complex Numbers, Sequences & Series, Financial Maths, Functions, Differentiation, Integration, Proof by Induction, Logarithms & Indices

### Paper 2
Co-ord Geometry (Line), Co-ord Geometry (Circle), Trigonometry, Geometry (Theorems & Proofs), Probability, Statistics, Length/Area/Volume
