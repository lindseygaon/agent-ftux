# Agent FTUX - Audit Policy Setup

An interactive questionnaire for generating custom audit rules and review instructions that train audit and review agents.

## Overview

This tool walks users through a guided setup process to create two key policy documents:
- **audit_rules.md** — Detection rules for the audit agent
- **review_sop.md** — Auto-close and escalation criteria for the review agent

## Questionnaire Flow

### Part 1: Audit Rules

**Section A: Spend Categories**
- Select which categories your employees regularly spend on (8 options)
- Travel & lodging
- Meals & entertainment
- Ground transportation / rideshare
- Software & subscriptions
- Equipment & supplies
- Events & offsites
- Gifts & client entertainment
- Professional development

**Section B: Category-Specific Rules**
- Conditional questions based on selected categories
- Examples: "Flag hotels booked outside managed travel tool?", "Flag premium rideshare?"

**Section C: Fraud Vectors**
- Universal fraud detection rules
- Duplicate receipts, AI-generated receipts, split transactions, etc.

### Part 2: Review Instructions

**Section A: Review Appetite**
- Choose default review posture (review all / tiered / minimal)

**Section B: Auto-Close Rules**
- Define thresholds for automatic case resolution
- First-time violation handling

**Section C: Escalation Triggers**
- Amount thresholds for human review
- Repeat violation handling
- Specific violation types that always escalate

**Section D: Missing Documentation**
- Thresholds for flagging missing receipts/memos
- Categories requiring documentation

## Tech Stack

- React 19
- Vite
- No backend or database (client-side only)
- Inline styling (no CSS dependencies)

## Getting Started

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build

```bash
npm run build
```

Output goes to `dist/`. Ready for Vercel deployment.

## Deploy to Vercel

### Option 1: Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import this repository from GitHub
4. Vercel auto-detects Vite — just click "Deploy"

### Option 2: Vercel CLI
```bash
npx vercel
```

## Generated Documents

The tool generates two markdown files based on user input:

- **audit_rules.md** — Defines when to create audit cases (spend categories, fraud vectors)
- **review_sop.md** — Defines case routing and resolution (auto-close, escalation)

These documents connect as a decision tree:
1. **Audit rules** determine: Should a case be created?
2. **Review instructions** determine: What happens to that case?

## Features

- 10-step wizard flow
- Conditional question logic (only show relevant questions)
- File upload for existing policy documents (optional)
- Real-time document generation
- Download buttons for both policy documents
- Preview before download
- Start over functionality
