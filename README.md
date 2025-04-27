# Shortlist: AI-Powered Interview & Job Platform

## 🚀 What is Shortlist?
Shortlist is an AI-powered platform that transforms the way candidates prepare for interviews and how recruiters assess talent. It offers:
- Realistic mock interviews (DSA, technical, HR) with AI avatars
- Automated proctoring and suspicion detection
- Resume analysis and job recommendations
- Secure, streamlined job application and interview scheduling

---

## 🧩 The Problem It Solves

**For Candidates:**
- Prepares you for real interviews with AI-driven mock sessions, including DSA, technical, and HR rounds.
- Provides instant, actionable feedback on your performance, body language, and engagement.
- Detects suspicious behavior (tab switches, forbidden sites, face not visible) to simulate real proctored interviews.
- Analyzes your resume and skills to recommend jobs and suggest improvements.

**For Recruiters:**
- Automates candidate screening with AI analytics and proctoring.
- Reduces manual effort in scheduling, monitoring, and evaluating interviews.
- Ensures interview integrity and fairness with advanced monitoring tools.

**How it makes tasks easier/safer:**
- No more scheduling hassles—candidates can take interviews anytime.
- Recruiters get detailed analytics and chat history for every interview.
- Candidates get a safe space to practice and improve, with privacy and security in mind.

---

## 💡 What Can You Use It For?
- Practice DSA and technical interviews with instant feedback
- Simulate HR/behavioral interviews
- Get AI-powered resume analysis and job recommendations
- Experience real-time proctoring and feedback
- Recruiters can shortlist, schedule, and analyze candidates efficiently

---

## 🛠️ Usage

1. **Clone the repo & install dependencies:**
   ```bash
   git clone <repo-url>
   cd shortlist
   pnpm install
   ```
2. **Set up your environment:**
   - Copy `.env.example` to `.env` and fill in your database and API keys.
   - Run database migrations:
     ```bash
     npx prisma migrate dev
     ```
3. **Start the development server:**
   ```bash
   pnpm dev
   ```
4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## ✨ Features
- AI-powered mock interviews (DSA, technical, HR)
- Real-time proctoring: face/pose detection, tab monitoring, forbidden site detection
- Resume parsing and analysis
- Job listings and one-click applications
- Interview analytics and chat history
- Recruiter dashboard for scheduling and analytics
- Secure authentication and role-based access

---

## 🧗 Challenges We Ran Into
- **Real-time proctoring:** Integrating camera, pose, and tab monitoring in a privacy-respecting way was complex. We used a combination of browser APIs, custom logic, and Groq's Whisper API for speech-to-text.
- **Mock interview realism:** Making the AI avatar feel natural and helpful required prompt engineering and careful system design.
- **Database migrations:** Handling evolving requirements (e.g., new analytics fields, DSA/HR/Technical modes) meant frequent schema changes and careful migration management.
- **Frontend/Backend sync:** Ensuring all interview modes (DSA, HR, Technical) handled topics, analytics, and chat history correctly across API and UI.
- **Error handling:** Building robust error handling for async interview flows, proctoring, and analytics.

---

## 🛠️ Technologies We Used
Next.js, React, TypeScript, Prisma, PostgreSQL, NextAuth, Groq Whisper API, Tailwind CSS, Vercel, Node.js, React Hot Toast, custom AI prompt engineering, browser camera & screen APIs

---

## 🙌 Contributing
Pull requests and feedback are welcome! Please open an issue for bugs or feature requests.

---

## 📄 License
MIT
