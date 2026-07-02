from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    tenure_months = db.Column(db.Integer, nullable=False)
    months_since_promotion = db.Column(db.Integer, nullable=False)

    # Burnout signals
    avg_weekly_overtime_hrs = db.Column(db.Float, nullable=False)
    leave_days_taken = db.Column(db.Integer, nullable=False)  # last 6 months
    performance_score_current = db.Column(db.Float, nullable=False)  # out of 100
    performance_score_previous = db.Column(db.Float, nullable=False)  # out of 100

    # Computed fields (set by scoring algorithm)
    burnout_score = db.Column(db.Float, default=0.0)
    risk_level = db.Column(db.String(10), default='Low')  # High / Medium / Low
    ai_recommendation = db.Column(db.Text, default='')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'department': self.department,
            'role': self.role,
            'tenure_months': self.tenure_months,
            'months_since_promotion': self.months_since_promotion,
            'avg_weekly_overtime_hrs': self.avg_weekly_overtime_hrs,
            'leave_days_taken': self.leave_days_taken,
            'performance_score_current': self.performance_score_current,
            'performance_score_previous': self.performance_score_previous,
            'burnout_score': self.burnout_score,
            'risk_level': self.risk_level,
            'ai_recommendation': self.ai_recommendation,
            'created_at': self.created_at.isoformat(),
        }