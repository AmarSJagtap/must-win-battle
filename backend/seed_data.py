from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Project, Milestone, Action, TeamMember
from datetime import datetime, timezone, timedelta

def seed_data():
    db = SessionLocal()
    
    # Check if admin user exists (used for authoring)
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        print("Please create an admin user from the UI first or run the app to create the default user.")
        db.close()
        return

    # Add a Dummy Project
    proj = Project(
        title="Q3 Product Launch: Titan",
        description="Launch the new Titan analytics feature set to all enterprise customers by end of Q3.",
        business_value="Increase enterprise retention by 15% and generate $2M in upsell revenue.",
        success_criteria="1. 100% feature complete. 2. Beta tested with 50 customers. 3. Zero critical bugs at launch.",
        status="active"
    )
    db.add(proj)
    db.flush()

    # Add Team Members
    team1 = TeamMember(project_id=proj.id, name="Alice Chen", role="Product Manager", responsibilities="Overall strategy and launch coordination")
    team2 = TeamMember(project_id=proj.id, name="Bob Smith", role="Lead Engineer", responsibilities="Backend architecture and performance")
    team3 = TeamMember(project_id=proj.id, name="Carol Davis", role="Marketing Lead", responsibilities="GTM strategy and communications")
    db.add_all([team1, team2, team3])

    # Add Milestones
    now = datetime.now(timezone.utc)
    m1 = Milestone(project_id=proj.id, title="Beta Release", description="Internal testing and select customers", due_date=(now + timedelta(days=15)).date(), status="in-progress")
    m2 = Milestone(project_id=proj.id, title="Marketing Assets Complete", description="Website updates, emails, and PR", due_date=(now + timedelta(days=30)).date(), status="pending")
    m3 = Milestone(project_id=proj.id, title="General Availability", description="Launch to all customers", due_date=(now + timedelta(days=45)).date(), status="pending")
    db.add_all([m1, m2, m3])
    db.flush()

    # Add Actions
    a1 = Action(project_id=proj.id, milestone_id=m1.id, title="Setup staging environment", owner="Bob Smith", due_date=(now + timedelta(days=2)).date(), status="completed")
    a2 = Action(project_id=proj.id, milestone_id=m1.id, title="Run load tests", owner="Bob Smith", due_date=(now + timedelta(days=10)).date(), status="in-progress")
    a3 = Action(project_id=proj.id, milestone_id=m2.id, title="Draft press release", owner="Carol Davis", due_date=(now + timedelta(days=20)).date(), status="pending")
    
    db.add_all([a1, a2, a3])
    
    # Add a second project
    proj2 = Project(
        title="Migrate infrastructure to AWS",
        description="Move all on-premise servers to AWS to reduce costs and improve reliability.",
        business_value="Save $50k/year in hosting costs and improve uptime to 99.99%.",
        success_criteria="All services migrated with less than 1 hour of total downtime.",
        status="at-risk"
    )
    db.add(proj2)
    db.flush()
    
    m4 = Milestone(project_id=proj2.id, title="Database Migration", description="Migrate PostgreSQL databases to RDS", due_date=(now + timedelta(days=5)).date(), status="in-progress")
    db.add(m4)
    db.flush()
    
    a4 = Action(project_id=proj2.id, milestone_id=m4.id, title="Backup all data", owner="Admin", due_date=(now + timedelta(days=1)).date(), status="pending")
    db.add(a4)

    db.commit()
    db.close()
    print("Dummy data successfully added!")

if __name__ == "__main__":
    seed_data()
