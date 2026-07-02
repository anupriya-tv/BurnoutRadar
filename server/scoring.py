def calculate_burnout_score(employee):
    """
    Calculates a burnout risk score (0-100) based on weighted signals.
    Higher score = higher burnout risk.
    """
    score = 0

    # ── Signal 1: Overtime (30% weight) ──────────────────────────────
    overtime = employee.avg_weekly_overtime_hrs
    if overtime >= 15:
        score += 30
    elif overtime >= 10:
        score += 22
    elif overtime >= 5:
        score += 12
    else:
        score += 0

    # ── Signal 2: Leave days taken in last 6 months (25% weight) ─────
    leave = employee.leave_days_taken
    if leave <= 1:
        score += 25
    elif leave <= 3:
        score += 18
    elif leave <= 6:
        score += 10
    else:
        score += 0

    # ── Signal 3: Performance score drop (20% weight) ─────────────────
    perf_drop = employee.performance_score_previous - employee.performance_score_current
    perf_drop_pct = (perf_drop / employee.performance_score_previous) * 100 if employee.performance_score_previous > 0 else 0

    if perf_drop_pct >= 25:
        score += 20
    elif perf_drop_pct >= 15:
        score += 15
    elif perf_drop_pct >= 5:
        score += 8
    else:
        score += 0

    # ── Signal 4: Months since last promotion (15% weight) ────────────
    months_promo = employee.months_since_promotion
    if months_promo >= 24:
        score += 15
    elif months_promo >= 18:
        score += 10
    elif months_promo >= 12:
        score += 5
    else:
        score += 0

    # ── Signal 5: Tenure in peak attrition window (10% weight) ────────
    tenure = employee.tenure_months
    if 24 <= tenure <= 60:  # 2-5 years: highest attrition risk window
        score += 10
    elif tenure < 12:
        score += 6
    else:
        score += 0

    # ── Risk level classification ──────────────────────────────────────
    if score >= 70:
        risk_level = "High"
    elif score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return round(score, 1), risk_level


def get_signal_breakdown(employee):
    """
    Returns a human-readable breakdown of which signals are contributing to burnout risk.
    Used by the AI advisor to generate contextual recommendations.
    """
    signals = []

    if employee.avg_weekly_overtime_hrs >= 10:
        signals.append(f"averaging {employee.avg_weekly_overtime_hrs} hours of overtime per week")

    if employee.leave_days_taken <= 3:
        signals.append(f"taken only {employee.leave_days_taken} leave days in the last 6 months")

    perf_drop = employee.performance_score_previous - employee.performance_score_current
    if perf_drop > 0:
        perf_drop_pct = round((perf_drop / employee.performance_score_previous) * 100, 1)
        if perf_drop_pct >= 5:
            signals.append(f"performance score dropped {perf_drop_pct}% (from {employee.performance_score_previous} to {employee.performance_score_current})")

    if employee.months_since_promotion >= 18:
        signals.append(f"not received a promotion in {employee.months_since_promotion} months")

    if 24 <= employee.tenure_months <= 60:
        signals.append(f"in the 2–5 year tenure window (peak attrition risk period)")

    return signals