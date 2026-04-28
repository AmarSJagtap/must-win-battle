from models import Project, Milestone, Action, TeamMember, Review, Attachment, Reminder


def seed_data(db):
    """Seed database with initial demo data if empty."""
    if db.query(Project).count() > 0:
        return

    projects_data = [
        {
            "proj_id": "MWB-HR-05", "title": "Talent & Leadership Pipeline", "dept": "HR",
            "status": "Off Track", "priority": "High", "progress": 28,
            "sponsor": "Claire Dubois", "lead": "Raj Patel", "start": "2024-02-01", "end": "2025-12-31",
            "background": "Employee engagement scores dropped 12 points. Regrettable attrition at 22% for high performers. This MWB addresses talent retention, leadership development and succession planning as critical business imperatives.",
            "scope": "Objective: Reduce regrettable attrition to below 10% and fill 80% of critical roles internally by 2026.\nSuccess Criteria:\n- Leadership academy launched\n- Succession plans for top 30 roles\n- Engagement score improved +15 pts\n- Retention programme ROI positive",
            "out_of_scope": "- Graduate recruitment programme\n- Compensation benchmarking (separate initiative)\n- Site-level operational roles",
            "kpis": "1. Leadership Academy: cohort 1 completed Q2\n2. Succession plans: 30 roles mapped by Q3\n3. Engagement score: target 72% (from 60%)\n4. Attrition rate: <= 10% by year end\n5. Internal promotion rate: >= 60%",
            "risks": "1. Leadership bandwidth for academy participation\n2. Competitor poaching during programme\n3. Middle manager resistance\n4. Programme cost vs. budget constraints",
            "bg_url": "https://sharepoint.company.com/sites/tcs/talent-pipeline",
            "milestones": [
                {"title": "Leadership Academy Programme Design", "planned": "2024-03-31", "actual": "2024-04-15", "status": "completed", "owner": "Raj Patel", "note": "Completed"},
                {"title": "Cohort 1 Nominations (30 Leaders)", "planned": "2024-05-31", "actual": "2024-07-01", "status": "delayed", "owner": "Raj Patel", "note": "Only 22 nominations received"},
                {"title": "Succession Plans – First 15 Roles", "planned": "2024-09-30", "actual": "", "status": "delayed", "owner": "Sofia Kowalczyk", "note": "8 complete, 7 in review"},
                {"title": "Engagement Pulse Survey Results", "planned": "2025-05-31", "actual": "", "status": "in-progress", "owner": "HR Team", "note": "Survey deployed, results pending"},
            ],
            "actions": [
                {"title": "Secure commitment from 8 remaining business leaders for cohort nominations", "responsible": "Raj Patel", "due": "2025-04-25", "priority": "High", "status": "overdue", "comment": "Escalated to CHRO", "done": False},
                {"title": "Complete succession plan templates for 22 remaining roles", "responsible": "Sofia Kowalczyk", "due": "2025-06-30", "priority": "High", "status": "open", "comment": "", "done": False},
            ],
            "team": [
                {"name": "Claire Dubois", "role": "sponsor", "email": "c.dubois@company.com", "dept": "HR", "load": 10, "color": "#dc2626"},
                {"name": "Raj Patel", "role": "lead", "email": "r.patel@company.com", "dept": "HR", "load": 80, "color": "#7c3aed"},
                {"name": "Sofia Kowalczyk", "role": "member", "email": "s.kowalczyk@company.com", "dept": "L&D", "load": 45, "color": "#0891b2"},
            ],
            "reviews": [
                {"author": "Raj Patel", "initials": "RP", "color": "#7c3aed", "date": "Oct 9, 2025", "status": "Off Track", "notes": "Nominations still at 22 of 30. Succession plan 8 of 15 complete. Escalation to CHRO on nominations. Recovery plan being drafted.", "progress": 28},
            ],
            "attachments": [
                {"name": "Talent_Pipeline_Charter.pptx", "type": "pptx", "size": "4.1 MB", "uploader": "Raj Patel", "date": "Feb 2024"},
                {"name": "Cohort1_Nominations.xlsx", "type": "xlsx", "size": "320 KB", "uploader": "HR Team", "date": "Jul 2024"},
            ],
            "reminders": [
                {"text": "Monthly review update due", "date": "2025-11-10", "freq": "Monthly", "notify": "r.patel@company.com"},
                {"text": "CHRO escalation follow-up", "date": "2025-10-20", "freq": "One-time", "notify": ""},
            ],
        },
        {
            "proj_id": "MWB-OPS-02", "title": "Manufacturing Cost Optimisation", "dept": "Operations",
            "status": "At Risk", "priority": "Critical", "progress": 41,
            "sponsor": "James Wright", "lead": "Priya Nair", "start": "2025-01-01", "end": "2025-12-31",
            "background": "Manufacturing costs have risen 14% YoY. This MWB targets 8% cost reduction through lean, automation and procurement optimisation.",
            "scope": "Objective: Achieve 8% cost reduction by Dec 2025.\nSuccess Criteria:\n- Lean rollout across 3 plants\n- Procurement savings ₹12Cr\n- Scrap rate below 2%\n- Automation ROI positive",
            "out_of_scope": "- New product manufacturing\n- Headcount restructuring",
            "kpis": "1. Cost reduction: 8% YoY\n2. OEE: 82%\n3. Scrap rate: <2%\n4. Procurement savings: ₹12Cr",
            "risks": "1. Vendor delays on automation equipment\n2. Raw material price volatility\n3. Union pushback on process changes",
            "bg_url": "",
            "milestones": [
                {"title": "Lean Assessment All Plants", "planned": "2025-02-28", "actual": "2025-03-05", "status": "completed", "owner": "Priya Nair", "note": "Done"},
                {"title": "Lean Rollout Plant 1", "planned": "2025-05-31", "actual": "", "status": "delayed", "owner": "Ops Team", "note": "6 weeks behind schedule"},
                {"title": "Automation GO-Live Line 3", "planned": "2025-09-30", "actual": "", "status": "delayed", "owner": "Engineering", "note": "Equipment delivery delayed"},
                {"title": "Year-end Cost Review", "planned": "2025-12-31", "actual": "", "status": "upcoming", "owner": "Finance", "note": ""},
            ],
            "actions": [
                {"title": "Escalate automation equipment delay to COO", "responsible": "Priya Nair", "due": "2025-10-18", "priority": "Critical", "status": "open", "comment": "", "done": False},
                {"title": "Complete lean training for all shift supervisors", "responsible": "HR+Ops", "due": "2025-11-15", "priority": "Medium", "status": "open", "comment": "", "done": False},
            ],
            "team": [
                {"name": "James Wright", "role": "sponsor", "email": "j.wright@company.com", "dept": "Operations", "load": 5, "color": "#d97706"},
                {"name": "Priya Nair", "role": "lead", "email": "p.nair@company.com", "dept": "Operations", "load": 90, "color": "#16a34a"},
            ],
            "reviews": [
                {"author": "Priya Nair", "initials": "PN", "color": "#16a34a", "date": "Oct 8, 2025", "status": "At Risk", "notes": "Lean rollout 6 weeks behind. Automation equipment delayed 8 weeks. Cost savings tracking at 3.1% vs 5% target at this stage.", "progress": 41},
            ],
            "attachments": [{"name": "Cost_Baseline_FY25.xlsx", "type": "xlsx", "size": "1.2 MB", "uploader": "Finance", "date": "Jan 2025"}],
            "reminders": [{"text": "COO escalation meeting", "date": "2025-10-20", "freq": "One-time", "notify": "p.nair@company.com"}],
        },
        {
            "proj_id": "MWB-SC-01", "title": "Supply Chain Resilience & Digitization", "dept": "Supply Chain",
            "status": "On Track", "priority": "Critical", "progress": 62,
            "sponsor": "Anna Müller", "lead": "David Chen", "start": "2025-01-01", "end": "2025-12-31",
            "background": "Supply chain disruptions cost ₹45Cr in FY24. This MWB digitises and diversifies the supply chain to build resilience.",
            "scope": "Objective: Reduce supply disruption impact by 60% and achieve full digital visibility by Dec 2025.",
            "out_of_scope": "- Last-mile logistics\n- Retail distribution",
            "kpis": "1. Supply disruption incidents: -60%\n2. Digital visibility: 100% Tier-1 suppliers\n3. Alternate sourcing: 3+ suppliers per critical material",
            "risks": "1. Supplier onboarding resistance\n2. IT integration complexity\n3. Change management at plant level",
            "bg_url": "",
            "milestones": [
                {"title": "Supplier Risk Assessment", "planned": "2025-02-28", "actual": "2025-02-25", "status": "completed", "owner": "David Chen", "note": "Done ahead of schedule"},
                {"title": "Digital Portal Launch", "planned": "2025-06-30", "actual": "2025-06-28", "status": "completed", "owner": "IT+SC", "note": "On time"},
                {"title": "80% Supplier Onboarding", "planned": "2025-10-31", "actual": "", "status": "in-progress", "owner": "David Chen", "note": "62% onboarded"},
                {"title": "Full Digitization Target", "planned": "2025-12-31", "actual": "", "status": "upcoming", "owner": "IT", "note": ""},
            ],
            "actions": [
                {"title": "Onboard remaining 38% suppliers to digital portal", "responsible": "David Chen", "due": "2025-11-15", "priority": "High", "status": "open", "comment": "", "done": False},
                {"title": "Complete IT integration testing with SAP", "responsible": "IT Lead", "due": "2025-10-31", "priority": "Medium", "status": "open", "comment": "", "done": False},
                {"title": "Train procurement team on new system", "responsible": "Training", "due": "2025-11-01", "priority": "Medium", "status": "complete", "comment": "", "done": True},
            ],
            "team": [
                {"name": "Anna Müller", "role": "sponsor", "email": "a.muller@company.com", "dept": "SCM", "load": 8, "color": "#db2777"},
                {"name": "David Chen", "role": "lead", "email": "d.chen@company.com", "dept": "Supply Chain", "load": 85, "color": "#0891b2"},
            ],
            "reviews": [
                {"author": "David Chen", "initials": "DC", "color": "#0891b2", "date": "Oct 12, 2025", "status": "On Track", "notes": "62% of suppliers onboarded. Digital portal live and performing well. SAP integration in final testing. On track for year-end target.", "progress": 62},
            ],
            "attachments": [],
            "reminders": [{"text": "Monthly supplier onboarding report", "date": "2025-11-05", "freq": "Monthly", "notify": ""}],
        },
        {
            "proj_id": "MWB-TECH-04", "title": "Digital Transformation - ERP Upgrade", "dept": "Technology",
            "status": "On Track", "priority": "Critical", "progress": 35,
            "sponsor": "Michael Torres", "lead": "Anita Sharma", "start": "2025-01-01", "end": "2026-06-30",
            "background": "Legacy ERP causing 22% process inefficiency. SAP S/4HANA migration to drive digital transformation across Finance, HR, and Operations.",
            "scope": "Objective: Full SAP S/4HANA go-live across all business units by June 2026.",
            "out_of_scope": "- CRM systems\n- Shop floor MES integration (Phase 2)",
            "kpis": "1. Go-live: June 2026\n2. Data migration accuracy: 99.9%\n3. Process efficiency: +22%\n4. User adoption: >95% in 90 days",
            "risks": "1. Data migration complexity\n2. Business disruption during cutover\n3. Resource availability",
            "bg_url": "",
            "milestones": [
                {"title": "Blueprint & Design Complete", "planned": "2025-03-31", "actual": "2025-03-28", "status": "completed", "owner": "Anita Sharma", "note": ""},
                {"title": "Development & Config Phase 1", "planned": "2025-09-30", "actual": "", "status": "in-progress", "owner": "Tech Team", "note": "75% complete"},
                {"title": "User Acceptance Testing", "planned": "2026-02-28", "actual": "", "status": "upcoming", "owner": "All BUs", "note": ""},
                {"title": "Go-Live", "planned": "2026-06-30", "actual": "", "status": "upcoming", "owner": "Anita Sharma", "note": ""},
            ],
            "actions": [
                {"title": "Complete data cleansing for Finance module", "responsible": "Finance IT", "due": "2025-11-30", "priority": "High", "status": "open", "comment": "", "done": False},
                {"title": "Finalize cutover plan and business continuity procedures", "responsible": "Anita Sharma", "due": "2025-12-31", "priority": "Critical", "status": "open", "comment": "", "done": False},
            ],
            "team": [
                {"name": "Michael Torres", "role": "sponsor", "email": "m.torres@company.com", "dept": "IT", "load": 5, "color": "#2563eb"},
                {"name": "Anita Sharma", "role": "lead", "email": "a.sharma@company.com", "dept": "Technology", "load": 95, "color": "#16a34a"},
            ],
            "reviews": [],
            "attachments": [{"name": "ERP_Blueprint.pdf", "type": "pdf", "size": "8.2 MB", "uploader": "Anita Sharma", "date": "Apr 2025"}],
            "reminders": [{"text": "Phase 1 dev checkpoint", "date": "2025-10-31", "freq": "One-time", "notify": ""}],
        },
        {
            "proj_id": "MWB-COM-03", "title": "Commercial Growth - New Market Entry", "dept": "Commercial",
            "status": "On Track", "priority": "High", "progress": 55,
            "sponsor": "Rachel Kim", "lead": "Tom Bakker", "start": "2025-01-01", "end": "2025-12-31",
            "background": "Saturated domestic market. New market entry into SEA region targeted to add ₹80Cr revenue in 18 months.",
            "scope": "Objective: Establish commercial presence in 3 SEA markets and achieve ₹20Cr revenue by Dec 2025.",
            "out_of_scope": "- Manufacturing in SEA\n- Own retail stores",
            "kpis": "1. Revenue: ₹20Cr from SEA by Dec 2025\n2. Markets entered: 3\n3. Distribution partners: 5+\n4. Brand awareness: 30% target segment",
            "risks": "1. Regulatory approvals in each market\n2. Currency exposure\n3. Local competitor response",
            "bg_url": "",
            "milestones": [
                {"title": "Market Entry Strategy Approved", "planned": "2025-01-31", "actual": "2025-01-30", "status": "completed", "owner": "Tom Bakker", "note": ""},
                {"title": "Singapore & Malaysia Launch", "planned": "2025-05-31", "actual": "2025-06-10", "status": "completed", "owner": "SEA Team", "note": "Slight delay on regulatory approval"},
                {"title": "Thailand Launch", "planned": "2025-09-30", "actual": "", "status": "in-progress", "owner": "Tom Bakker", "note": "Regulatory approval 90% complete"},
                {"title": "₹20Cr Revenue Target", "planned": "2025-12-31", "actual": "", "status": "upcoming", "owner": "Commercial", "note": ""},
            ],
            "actions": [
                {"title": "Secure final regulatory approval for Thailand", "responsible": "Legal+Commercial", "due": "2025-10-31", "priority": "High", "status": "open", "comment": "", "done": False},
                {"title": "Appoint Thailand distribution partner", "responsible": "Tom Bakker", "due": "2025-11-15", "priority": "High", "status": "open", "comment": "", "done": False},
            ],
            "team": [
                {"name": "Rachel Kim", "role": "sponsor", "email": "r.kim@company.com", "dept": "Commercial", "load": 5, "color": "#db2777"},
                {"name": "Tom Bakker", "role": "lead", "email": "t.bakker@company.com", "dept": "Commercial", "load": 80, "color": "#d97706"},
            ],
            "reviews": [
                {"author": "Tom Bakker", "initials": "TB", "color": "#d97706", "date": "Oct 10, 2025", "status": "On Track", "notes": "Singapore tracking ₹6Cr revenue. Malaysia ₹4.5Cr. Thailand launch on schedule for Nov. Total ₹10.5Cr vs ₹12Cr target — slight lag but recoverable.", "progress": 55},
            ],
            "attachments": [{"name": "SEA_Market_Entry_Plan.pptx", "type": "pptx", "size": "6.3 MB", "uploader": "Tom Bakker", "date": "Jan 2025"}],
            "reminders": [{"text": "Q4 revenue review", "date": "2025-11-20", "freq": "Monthly", "notify": ""}],
        },
    ]

    for pd in projects_data:
        milestones_data = pd.pop("milestones", [])
        actions_data = pd.pop("actions", [])
        team_data = pd.pop("team", [])
        reviews_data = pd.pop("reviews", [])
        attachments_data = pd.pop("attachments", [])
        reminders_data = pd.pop("reminders", [])

        project = Project(**pd)
        db.add(project)
        db.flush()

        for m in milestones_data:
            db.add(Milestone(project_id=project.id, **m))
        for a in actions_data:
            db.add(Action(project_id=project.id, **a))
        for t in team_data:
            db.add(TeamMember(project_id=project.id, **t))
        for r in reviews_data:
            db.add(Review(project_id=project.id, **r))
        for at in attachments_data:
            db.add(Attachment(project_id=project.id, **at))
        for rem in reminders_data:
            db.add(Reminder(project_id=project.id, **rem))

    db.commit()
