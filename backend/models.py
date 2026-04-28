from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, default="")
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    permissions = relationship("UserPermission", back_populates="user", cascade="all, delete-orphan")


class UserPermission(Base):
    __tablename__ = "user_permissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    screen = Column(String, nullable=False)  # e.g. "dashboard", "all-projects", "all-actions", "reminders-page", "review-cal", "project-detail"
    can_access = Column(Boolean, default=True)

    user = relationship("User", back_populates="permissions")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    proj_id = Column(String, default="")
    title = Column(String, nullable=False)
    dept = Column(String, default="")
    status = Column(String, default="On Track")
    priority = Column(String, default="Medium")
    progress = Column(Integer, default=0)
    sponsor = Column(String, default="")
    lead = Column(String, default="")
    start = Column(String, default="")
    end = Column(String, default="")
    background = Column(Text, default="")
    scope = Column(Text, default="")
    out_of_scope = Column(Text, default="")
    kpis = Column(Text, default="")
    risks = Column(Text, default="")
    bg_url = Column(String, default="")

    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="project", cascade="all, delete-orphan")
    team_members = relationship("TeamMember", back_populates="project", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="project", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="project", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="project", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="project", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    planned = Column(String, default="")
    actual = Column(String, default="")
    status = Column(String, default="upcoming")
    owner = Column(String, default="")
    note = Column(String, default="")

    project = relationship("Project", back_populates="milestones")


class Action(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(Text, nullable=False)
    responsible = Column(String, default="")
    due = Column(String, default="")
    priority = Column(String, default="High")
    status = Column(String, default="open")
    comment = Column(Text, default="")
    done = Column(Boolean, default=False)

    project = relationship("Project", back_populates="actions")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="member")
    email = Column(String, default="")
    dept = Column(String, default="")
    load = Column(Integer, default=0)
    color = Column(String, default="#2563eb")

    project = relationship("Project", back_populates="team_members")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    author = Column(String, default="")
    initials = Column(String, default="")
    color = Column(String, default="#2563eb")
    date = Column(String, default="")
    status = Column(String, default="")
    notes = Column(Text, default="")
    progress = Column(Integer, nullable=True)

    project = relationship("Project", back_populates="reviews")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String, default="")
    type = Column(String, default="")
    size = Column(String, default="")
    uploader = Column(String, default="")
    date = Column(String, default="")

    project = relationship("Project", back_populates="attachments")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    text = Column(String, default="")
    date = Column(String, default="")
    freq = Column(String, default="One-time")
    notify = Column(String, default="")
    completed = Column(Boolean, default=False)
    snoozed_until = Column(String, default="")

    project = relationship("Project", back_populates="reminders")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    text = Column(String, nullable=False)
    user_name = Column(String, default="")
    timestamp = Column(String, nullable=False)
    icon = Column(String, default="info")  # e.g., 'add', 'edit', 'delete', 'status_change'
    color = Column(String, default="gray")  # e.g., 'green', 'blue', 'amber', 'red'

    project = relationship("Project", back_populates="activities")


class KnowledgeDoc(Base):
    __tablename__ = "knowledge_docs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filetype = Column(String, default="pdf")   # "pdf" or "excel"
    content = Column(Text, default="")         # extracted text
    uploaded_at = Column(String, default="")
