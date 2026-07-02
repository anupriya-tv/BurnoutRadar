import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

ADVISOR_PROMPT = """You are an experienced HR advisor and organizational psychologist. 
You have been given data about an employee showing early signs of burnout.

Employee Profile:
- Name: {name}
- Role: {role}
- Department: {department}
- Tenure: {tenure_months} months at the company
- Burnout Risk Score: {burnout_score}/100 ({risk_level} Risk)

Burnout Signals Detected:
{signals}

Write a concise, empathetic, and actionable recommendation for the employee's manager.
Your response should:
1. Briefly explain why this employee is at risk (2 sentences max)
2. Give 2-3 specific, concrete actions the manager should take this week
3. End with one sentence on what to avoid doing

Keep the tone warm and human — this is about a real person, not a data point.
Write in plain English, no bullet points, just clear paragraphs.
Maximum 150 words."""


def get_ai_recommendation(employee, signals):
    """
    Generates a manager-facing AI recommendation for a high/medium risk employee.
    """
    if not signals:
        return "No significant burnout signals detected at this time. Continue regular check-ins."

    signals_text = "\n".join([f"- {s}" for s in signals])

    prompt = ADVISOR_PROMPT.format(
        name=employee.name,
        role=employee.role,
        department=employee.department,
        tenure_months=employee.tenure_months,
        burnout_score=employee.burnout_score,
        risk_level=employee.risk_level,
        signals=signals_text
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=250,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Unable to generate AI recommendation at this time. Please review the burnout signals manually. Error: {str(e)}"