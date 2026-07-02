# 🔥 BurnoutRadar
### *See Burnout Coming Before It's Too Late*

> An AI-powered early warning system that detects employee burnout risk from behavioral signals — and tells managers exactly what to do about it, before someone quits.

![Status](https://img.shields.io/badge/Status-In_Development-f59e0b?style=flat-square)
![React](https://img.shields.io/badge/React-Frontend-61dafb?style=flat-square&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=flat-square&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003b57?style=flat-square&logo=sqlite&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3-f55036?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)

---

## 🧩 The Business Problem

Companies lose their best people silently.

By the time an employee hands in their resignation, the burnout started **3 to 6 months earlier** — in the overtime patterns, the untaken leave, the quietly dropping performance scores. HR only finds out when it's already too late.

The cost of replacing one employee is estimated at **50–200% of their annual salary**. Yet most companies still rely on exit interviews — the most expensive, least actionable form of people data there is.

**BurnoutRadar changes that.**

It monitors behavioral signals across your workforce, scores each employee's burnout risk in real time, and generates plain-English recommendations so managers can have the right conversation before someone decides to leave.

---

## ✨ What It Does

| Feature | Description |
|---|---|
| 📊 **Risk Scoring** | Scores each employee's burnout risk (High / Medium / Low) based on overtime, leave, performance, and tenure signals |
| 🤖 **AI Recommendations** | Groq (Llama 3.3) generates a plain-English explanation of why an employee is at risk + what a manager should do |
| 🗃️ **Employee Database** | SQLite database storing all employee records, updated in real time |
| 📈 **Company Dashboard** | Heatmap and risk distribution showing burnout trends across departments |
| 👤 **Employee Detail View** | Individual signal breakdown with manager action card |
| ➕ **Add Employees** | Simple form to add new employee records |

---

## 🗂️ Project Structure

```
BurnoutRadar/
│
├── client/                        # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx      # Company-wide burnout heatmap
│       │   ├── EmployeeList.jsx   # All employees with risk scores
│       │   ├── EmployeeDetail.jsx # Individual signals + AI recommendation
│       │   └── AddEmployee.jsx    # Form to add new employee
│       └── App.jsx
│
├── server/                        # Flask backend
│   ├── app.py                     # API routes
│   ├── models.py                  # SQLAlchemy database models
│   ├── scoring.py                 # Burnout risk scoring algorithm
│   ├── ai_advisor.py              # Groq AI recommendation engine
│   └── seed_data.py               # Synthetic employee data generator
│
├── burnout.db                     # SQLite database
├── requirements.txt
└── README.md
```

---

## 🧠 How Burnout Risk Is Scored

BurnoutRadar uses a weighted signal model to score each employee:

| Signal | Weight | High Risk Indicator |
|---|---|---|
| Weekly overtime hours | 30% | >10 hrs/week consistently |
| Leave days taken (last 6 months) | 25% | <3 days taken |
| Performance score trend | 20% | >15% drop over 3 months |
| Months since last promotion | 15% | >18 months |
| Tenure | 10% | 2–5 years (peak attrition window) |

**Risk Levels:**
- 🔴 **High (70–100)** — Immediate manager intervention recommended
- 🟡 **Medium (40–69)** — Monitor closely, check in within 2 weeks
- 🟢 **Low (0–39)** — Healthy engagement signals

---

## 🤖 AI Recommendation Example

For a high-risk employee, BurnoutRadar generates:

> *"Alex has logged an average of 14 hours of overtime per week for the past 8 weeks, has taken only 1 leave day in the last 6 months, and their performance score has dropped 28% since last quarter. These are classic early-stage burnout indicators. Recommended action: Schedule a private 1:1 this week focused on workload review and career goals — not performance. Ask what support they need, not what they need to improve."*

---

## 💼 Business Impact

- HR teams get a **weekly at-risk employee list** instead of surprise resignations
- Managers get **specific, actionable recommendations** — not just a score
- Companies can measure the ROI of retention interventions over time
- Works for teams of 10 or 10,000 — scales with the organization

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/BurnoutRadar.git
cd BurnoutRadar

# Backend setup
cd server
pip install -r requirements.txt
python seed_data.py   # generates synthetic employee data
python app.py

# Frontend setup (new terminal)
cd client
npm install
npm run dev
```

---

## 🛣️ Roadmap

- [x] Project structure & documentation
- [ ] Database schema & SQLAlchemy models
- [ ] Synthetic employee data generator
- [ ] Burnout risk scoring algorithm
- [ ] Flask API endpoints
- [ ] React frontend — Dashboard, Employee List, Detail, Add Employee
- [ ] Groq AI recommendation engine
- [ ] Deploy live (Vercel + Render)
- [ ] Demo video

---

## 🛠️ Tech Stack

**Frontend:** React (Vite)
**Backend:** Flask, SQLAlchemy
**Database:** SQLite
**AI:** Groq API — Llama 3.3 70B
**Deployment:** Vercel (frontend) + Render (backend)

---

## 👩‍💻 About the Author

**Anu** — B.Tech Computer Science & Data Science, Presidency University Bengaluru
CSI Chapter President | IEEE Student Coordinator | BEL Process Automation Intern

Passionate about translating data into decisions that non-technical teams can actually use.

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/anupriya-tv)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0a66c2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/anupriya-t-v/)

---

*Built with React · Flask · SQLite · Groq API · Llama 3.3*
