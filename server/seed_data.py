import random
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import Employee
from scoring import calculate_burnout_score

random.seed(42)

DEPARTMENTS = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Product"]

ROLES = {
    "Engineering": ["Software Engineer", "Senior Engineer", "DevOps Engineer", "QA Engineer"],
    "Marketing": ["Marketing Analyst", "Content Strategist", "Brand Manager", "SEO Specialist"],
    "Sales": ["Sales Executive", "Account Manager", "Business Development Rep", "Sales Lead"],
    "HR": ["HR Generalist", "Talent Acquisition Specialist", "People Ops Manager", "HR Analyst"],
    "Finance": ["Financial Analyst", "Accountant", "Finance Manager", "Budget Analyst"],
    "Operations": ["Operations Analyst", "Process Manager", "Supply Chain Analyst", "Ops Lead"],
    "Product": ["Product Manager", "Associate PM", "Product Analyst", "UX Researcher"],
}

FIRST_NAMES = [
    "Priya", "Rahul", "Ananya", "Vikram", "Sneha", "Arjun", "Divya", "Kiran",
    "Meera", "Rohan", "Kavya", "Aditya", "Pooja", "Siddharth", "Nisha", "Amit",
    "Riya", "Varun", "Shreya", "Nikhil", "Tanvi", "Harsh", "Neha", "Akash",
    "Swati", "Rajesh", "Anjali", "Deepak", "Shweta", "Manish", "Bhavna", "Sachin",
    "Rekha", "Vivek", "Sonali", "Gaurav", "Pallavi", "Suresh", "Preeti", "Yash",
    "Kritika", "Mohit", "Simran", "Tarun", "Megha", "Aarav", "Ishita", "Kunal",
    "Roshni", "Dev"
]

LAST_NAMES = [
    "Sharma", "Patel", "Reddy", "Kumar", "Singh", "Verma", "Nair", "Iyer",
    "Gupta", "Mehta", "Joshi", "Rao", "Shah", "Pillai", "Menon", "Chopra",
    "Bose", "Das", "Mishra", "Pandey", "Kulkarni", "Desai", "Hegde", "Malhotra",
    "Srivastava", "Agarwal", "Bajaj", "Tiwari", "Saxena", "Bansal"
]


def generate_employee(index, risk_profile):
    """
    Generates a synthetic employee with realistic data based on risk profile.
    risk_profile: 'high', 'medium', or 'low'
    """
    name = f"{FIRST_NAMES[index % len(FIRST_NAMES)]} {random.choice(LAST_NAMES)}"
    department = random.choice(DEPARTMENTS)
    role = random.choice(ROLES[department])

    if risk_profile == 'high':
        avg_weekly_overtime_hrs = round(random.uniform(12, 20), 1)
        leave_days_taken = random.randint(0, 2)
        performance_score_previous = round(random.uniform(75, 90), 1)
        performance_score_current = round(performance_score_previous - random.uniform(15, 30), 1)
        months_since_promotion = random.randint(20, 36)
        tenure_months = random.randint(24, 54)

    elif risk_profile == 'medium':
        avg_weekly_overtime_hrs = round(random.uniform(5, 12), 1)
        leave_days_taken = random.randint(3, 6)
        performance_score_previous = round(random.uniform(70, 85), 1)
        performance_score_current = round(performance_score_previous - random.uniform(5, 15), 1)
        months_since_promotion = random.randint(12, 20)
        tenure_months = random.randint(12, 48)

    else:  # low
        avg_weekly_overtime_hrs = round(random.uniform(0, 5), 1)
        leave_days_taken = random.randint(7, 15)
        performance_score_previous = round(random.uniform(70, 85), 1)
        performance_score_current = round(performance_score_previous + random.uniform(0, 10), 1)
        months_since_promotion = random.randint(3, 12)
        tenure_months = random.randint(6, 120)

    # Clamp performance scores to 0-100
    performance_score_current = max(0, min(100, performance_score_current))

    return Employee(
        name=name,
        department=department,
        role=role,
        tenure_months=tenure_months,
        months_since_promotion=months_since_promotion,
        avg_weekly_overtime_hrs=avg_weekly_overtime_hrs,
        leave_days_taken=leave_days_taken,
        performance_score_current=performance_score_current,
        performance_score_previous=performance_score_previous,
    )


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        employees = []

        # Generate 15 high risk, 20 medium risk, 15 low risk employees
        for i in range(15):
            employees.append(generate_employee(i, 'high'))
        for i in range(15, 35):
            employees.append(generate_employee(i, 'medium'))
        for i in range(35, 50):
            employees.append(generate_employee(i, 'low'))

        # Calculate burnout scores for all
        for emp in employees:
            score, risk_level = calculate_burnout_score(emp)
            emp.burnout_score = score
            emp.risk_level = risk_level

        db.session.add_all(employees)
        db.session.commit()

        print(f"✅ Seeded {len(employees)} employees successfully!")
        print(f"   🔴 High risk:   {sum(1 for e in employees if e.risk_level == 'High')}")
        print(f"   🟡 Medium risk: {sum(1 for e in employees if e.risk_level == 'Medium')}")
        print(f"   🟢 Low risk:    {sum(1 for e in employees if e.risk_level == 'Low')}")


if __name__ == "__main__":
    seed()