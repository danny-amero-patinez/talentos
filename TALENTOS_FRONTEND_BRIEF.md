# TALENTOS_FRONTEND_BRIEF.md

## 1. Product & Architecture Overview
**Product:** TalentOS Web Client.
**Goal:** A highly responsive, professional web interface for candidates to take the AI interview, and a data-rich dashboard for HR to review the deterministic results.
**Stack:** React 18+ (Vite), TypeScript, Tailwind CSS, Recharts (for charts), Axios/Fetch.

## 2. Core UI Requirements & Vibe
The application must NOT look like a generic chatbot demo. It must feel like a premium SaaS product (e.g., modern corporate theme: clean white backgrounds, slate/dark blue accents, subtle borders, sans-serif typography).

## 3. Scope for MVP: Two Main Views

### View 1: The Candidate Portal (`/interview`)
- **Onboarding:** A clean welcome screen asking for Name and Role applied for.
- **Interview Interface:** A conversational UI. 
  - Messages aligned correctly (User right, Agent left).
  - Input field MUST be disabled showing a typing indicator while waiting for the Nebius AI backend.
  - A prominent "Finish Interview" button that triggers the final evaluation endpoint.
- **Security Fallback:** If the backend returns a `security_violation` error, display a neutral error state: "Session terminated due to unexpected input. Please contact HR."

### View 2: The HR Dashboard (`/dashboard`)
This is the command center. It visualizes the JSON output from the backend.
- **Sidebar/Navigation:** Simple navigation menu.
- **Main View (Candidate List):** A data table listing completed interview sessions with columns: Name, Role, Score Summary, and Recommendation (color-coded badges: Green for STRONG_HIRE, Red for NO_HIRE).
- **Detail Panel (Candidate Profile):** Clicking a candidate opens a side-panel or detailed view containing:
  - **Radar Chart:** Use a library like `Recharts` to map the `quantitative_scores` (Communication, Technical Depth, Problem Solving) into a radar/spider chart for quick visual assessment.
  - **Qualitative Tags:** Render `key_strengths` and `areas_for_improvement` as Tailwind chips/badges.
  - **Executive Summary:** A stylized text block displaying the LLM's summary.
  - **Security Alert:** If `prompt_injection_attempted` is true, display a massive red banner warning the recruiter.
  - **Action Buttons:** "Approve" or "Reject", simulating the final human-in-the-loop decision that would trigger the MCP tool on the backend.

## 4. State Management & API
- Use React Context or Zustand for state management. Avoid Redux to maximize hackathon velocity.
- Create a custom hook `useInterviewSession` to encapsulate API calls to the Node.js backend.
- Never expose Nebius API keys on the frontend. All logic must route through the backend.