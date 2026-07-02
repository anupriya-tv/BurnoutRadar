import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Employee
from scoring import calculate_burnout_score, get_signal_breakdown
from ai_advisor import get_ai_recommendation

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database config
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'burnout.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()


# ── Routes ────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"status": "BurnoutRadar API is running"})


@app.route("/employees", methods=["GET"])
def get_employees():
    """Get all employees, optionally filtered by department or risk level."""
    department = request.args.get("department")
    risk_level = request.args.get("risk_level")

    query = Employee.query

    if department:
        query = query.filter_by(department=department)
    if risk_level:
        query = query.filter_by(risk_level=risk_level)

    employees = query.order_by(Employee.burnout_score.desc()).all()
    return jsonify([e.to_dict() for e in employees])


@app.route("/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    """Get a single employee by ID."""
    employee = Employee.query.get_or_404(employee_id)
    return jsonify(employee.to_dict())


@app.route("/employees", methods=["POST"])
def add_employee():
    """Add a new employee and calculate their burnout score."""
    data = request.get_json()

    required_fields = [
        "name", "department", "role", "tenure_months",
        "months_since_promotion", "avg_weekly_overtime_hrs",
        "leave_days_taken", "performance_score_current",
        "performance_score_previous"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    employee = Employee(
        name=data["name"],
        department=data["department"],
        role=data["role"],
        tenure_months=int(data["tenure_months"]),
        months_since_promotion=int(data["months_since_promotion"]),
        avg_weekly_overtime_hrs=float(data["avg_weekly_overtime_hrs"]),
        leave_days_taken=int(data["leave_days_taken"]),
        performance_score_current=float(data["performance_score_current"]),
        performance_score_previous=float(data["performance_score_previous"]),
    )

    score, risk_level = calculate_burnout_score(employee)
    employee.burnout_score = score
    employee.risk_level = risk_level

    db.session.add(employee)
    db.session.commit()

    return jsonify(employee.to_dict()), 201


@app.route("/employees/<int:employee_id>/recommend", methods=["POST"])
def generate_recommendation(employee_id):
    """Generate an AI recommendation for a specific employee."""
    employee = Employee.query.get_or_404(employee_id)
    signals = get_signal_breakdown(employee)
    recommendation = get_ai_recommendation(employee, signals)
    employee.ai_recommendation = recommendation
    db.session.commit()
    return jsonify({"recommendation": recommendation})


@app.route("/dashboard/stats", methods=["GET"])
def dashboard_stats():
    """Get company-wide burnout statistics for the dashboard."""
    total = Employee.query.count()
    high = Employee.query.filter_by(risk_level="High").count()
    medium = Employee.query.filter_by(risk_level="Medium").count()
    low = Employee.query.filter_by(risk_level="Low").count()

    dept_stats = db.session.query(
        Employee.department,
        db.func.avg(Employee.burnout_score).label("avg_score"),
        db.func.count(Employee.id).label("count")
    ).group_by(Employee.department).all()

    return jsonify({
        "total_employees": total,
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low,
        "high_risk_pct": round((high / total) * 100, 1) if total > 0 else 0,
        "department_stats": [
            {
                "department": d.department,
                "avg_burnout_score": round(d.avg_score, 1),
                "employee_count": d.count
            }
            for d in dept_stats
        ]
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)