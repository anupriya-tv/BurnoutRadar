import os
from groq import Groq
from dotenv import load_dotenv
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

ADVISOR_PROMPT = """You are an experienced HR advisor. Analyze this employee's burnout signals and return ONLY a JSON object (no markdown, no preamble).

Employee: {name}, {role}, {department}
Tenure: {tenure_months} months | Burnout Score: {burnout_score}/100 | Risk: {risk_level}

Signals detected:
{signals}

Return ONLY this JSON structure:
{{
  "risk_summary": "One sentence explaining the core burnout risk",
  "immediate_actions": [
    "Specific action 1 the manager should take THIS WEEK",
    "Specific action 2",
    "Specific action 3"
  ],
  "avoid": "One thing the manager must NOT do",
  "timeline": "Short/Medium/Long term — how urgent is this?"
}}"""


def get_ai_recommendation(employee, signals):
    if not signals:
        return json.dumps({
            "risk_summary": "No significant burnout signals detected at this time.",
            "immediate_actions": ["Continue regular 1:1 check-ins", "Monitor workload over next month"],
            "avoid": "Avoid assuming everything is fine without checking in",
            "timeline": "Low urgency — monitor monthly"
        })

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
            temperature=0.3,
            max_tokens=400,
        )
        raw = response.choices[0].message.content.strip()

        # Clean markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        if raw.endswith("```"):
            raw = raw[:-3].strip()

        # Validate it's proper JSON
        parsed = json.loads(raw)
        return json.dumps(parsed)

    except Exception as e:
        return json.dumps({
            "risk_summary": f"Unable to generate recommendation. Please review signals manually.",
            "immediate_actions": ["Schedule a 1:1 check-in this week", "Review workload distribution"],
            "avoid": "Avoid ignoring the burnout signals shown above",
            "timeline": "Urgent — act within this week"
        })