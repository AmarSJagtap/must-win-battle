import sys
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Project, Milestone, Action, TeamMember, Review, Reminder, Activity
from datetime import datetime, timezone, timedelta

def seed_data():
    db = next(get_db())
    
    # Clean up existing projects (cascade handles children)
    db.query(Project).delete()
    db.commit()
    
    print("Deleted old projects.")

    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    next_week = (now + timedelta(days=7)).strftime("%Y-%m-%d")
    last_week = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    next_month = (now + timedelta(days=30)).strftime("%Y-%m-%d")

    # Project 1
    p1 = Project(
        proj_id="MWB-001",
        title="Cloud Infrastructure Migration",
        dept="IT",
        status="On Track",
        priority="High",
        progress=45,
        sponsor="Sarah Jenkins",
        lead="Alex Carter",
        start="2026-01-15",
        end="2026-08-30",
        background="Legacy on-premise servers are becoming too expensive to maintain and are causing downtime.",
        scope="Migrate all tier 1 and tier 2 applications to AWS. Decommission physical data center.",
        out_of_scope="Tier 3 legacy apps will remain on-premise for now.",
        kpis="- 99.99% Uptime\n- Reduce hosting costs by 20%\n- 0 data loss during migration",
        risks="1. Potential downtime during DNS switch.\n2. Team bandwidth constraints due to daily operations.",
    )
    db.add(p1)
    db.commit()
    db.refresh(p1)

    db.add_all([
        Milestone(project_id=p1.id, title="AWS VPC Setup", planned=last_week, actual=last_week, status="completed", owner="Alex Carter"),
        Milestone(project_id=p1.id, title="Migrate Tier 1 Apps", planned=next_week, status="upcoming", owner="Alex Carter"),
        Action(project_id=p1.id, title="Review security groups", responsible="Security Team", due=today, priority="High", done=False, status="open"),
        Action(project_id=p1.id, title="Backup all databases", responsible="DBA", due=last_week, priority="Critical", done=True, status="completed"),
        TeamMember(project_id=p1.id, name="Alex Carter", role="Lead Cloud Architect"),
        TeamMember(project_id=p1.id, name="James Smith", role="DevOps Engineer"),
        Review(project_id=p1.id, author="Sarah Jenkins", initials="SJ", color="#dc2626", date=last_week, status="On Track", notes="Migration is proceeding smoothly. Keep an eye on the budget.", progress=40),
        Reminder(project_id=p1.id, text="Weekly Sync with AWS Rep", date=today, freq="Weekly")
    ])

    # Project 2
    p2 = Project(
        proj_id="MWB-002",
        title="Q4 Product Launch: 'Quantum'",
        dept="Product",
        status="At Risk",
        priority="Critical",
        progress=60,
        sponsor="David Chen",
        lead="Maya Patel",
        start="2026-02-01",
        end="2026-10-15",
        background="Competitors are releasing AI-powered features. We need 'Quantum' to stay relevant.",
        scope="Launch new AI assistant, overhaul UI dashboard, and release mobile app beta.",
        out_of_scope="Marketing campaigns (handled by separate team).",
        kpis="- 100k active users in first month\n- 4.5+ app store rating",
        risks="1. Engineering delays due to AI API rate limits.\n2. UI design pending final approval.",
    )
    db.add(p2)
    db.commit()
    db.refresh(p2)

    db.add_all([
        Milestone(project_id=p2.id, title="Beta Release", planned=last_week, actual=last_week, status="completed", owner="Maya Patel"),
        Milestone(project_id=p2.id, title="App Store Submission", planned=next_month, status="upcoming", owner="Maya Patel"),
        Action(project_id=p2.id, title="Fix login bug on iOS", responsible="Mobile Team", due=last_week, priority="High", done=False, status="overdue"),
        Action(project_id=p2.id, title="Finalize release notes", responsible="Maya Patel", due=next_week, priority="Medium", done=False, status="open"),
        TeamMember(project_id=p2.id, name="Maya Patel", role="Product Manager"),
        TeamMember(project_id=p2.id, name="Chris Lee", role="Lead Engineer"),
        Review(project_id=p2.id, author="Maya Patel", initials="MP", color="#7c3aed", date=today, status="At Risk", notes="We are slightly behind due to the iOS bug. Pushing hard to resolve it this week.", progress=60),
        Reminder(project_id=p2.id, text="Send beta survey to test group", date=today, freq="One-time")
    ])

    # Project 3
    p3 = Project(
        proj_id="MWB-003",
        title="Enterprise Security Overhaul",
        dept="Security",
        status="On Track",
        priority="High",
        progress=15,
        sponsor="Elena Rodriguez",
        lead="Marcus Johnson",
        start="2026-04-01",
        end="2026-12-31",
        background="Recent phishing attempts showed vulnerabilities in our current 2FA implementation.",
        scope="Roll out hardware security keys, implement Zero Trust architecture, and conduct company-wide training.",
        out_of_scope="Physical building security.",
        kpis="- 100% staff adoption of hardware keys\n- 0 successful phishing incidents",
        risks="1. Pushback from staff due to strict new login policies.\n2. Supply chain delay for hardware keys.",
    )
    db.add(p3)
    db.commit()
    db.refresh(p3)

    db.add_all([
        Milestone(project_id=p3.id, title="Order Hardware Keys", planned=last_week, actual=last_week, status="completed", owner="Marcus Johnson"),
        Milestone(project_id=p3.id, title="Distribute to Leadership", planned=next_week, status="upcoming", owner="Marcus Johnson"),
        Action(project_id=p3.id, title="Draft training manual", responsible="Marcus Johnson", due=next_week, priority="Medium", done=False, status="open"),
        TeamMember(project_id=p3.id, name="Marcus Johnson", role="CISO"),
        Review(project_id=p3.id, author="Elena Rodriguez", initials="ER", color="#0891b2", date=last_week, status="On Track", notes="Initial key orders have arrived. Planning the rollout.", progress=15)
    ])

    # Project 4
    p4 = Project(
        proj_id="MWB-004",
        title="Global Supply Chain Optimization",
        dept="Operations",
        status="Off Track",
        priority="Medium",
        progress=30,
        sponsor="Michael Chang",
        lead="Olivia Zhang",
        start="2026-01-01",
        end="2026-11-30",
        background="Shipping costs have increased by 15% year over year.",
        scope="Renegotiate contracts with top 5 carriers, consolidate regional warehouses.",
        out_of_scope="Last-mile delivery partners.",
        kpis="- Reduce shipping costs by 12%\n- Decrease average delivery time by 1 day",
        risks="1. Key vendor unwilling to renegotiate.\n2. Warehouse closure logistics.",
    )
    db.add(p4)
    db.commit()
    db.refresh(p4)

    db.add_all([
        Milestone(project_id=p4.id, title="Identify underperforming warehouses", planned=last_week, actual=last_week, status="completed", owner="Olivia Zhang"),
        Milestone(project_id=p4.id, title="Sign new carrier contracts", planned=today, status="upcoming", owner="Olivia Zhang"),
        Action(project_id=p4.id, title="Call with FedEX rep", responsible="Olivia Zhang", due=last_week, priority="High", done=False, status="overdue"),
        Action(project_id=p4.id, title="Review lease agreements", responsible="Legal", due=today, priority="Critical", done=False, status="open"),
        TeamMember(project_id=p4.id, name="Olivia Zhang", role="VP of Operations"),
        Review(project_id=p4.id, author="Michael Chang", initials="MC", color="#d97706", date=today, status="Off Track", notes="Negotiations are stalled. We need executive intervention.", progress=30),
        Reminder(project_id=p4.id, text="Follow up on contract drafts", date=next_week, freq="Weekly")
    ])

    db.commit()
    print("Added 4 new dummy projects with sensible data.")

if __name__ == "__main__":
    seed_data()
