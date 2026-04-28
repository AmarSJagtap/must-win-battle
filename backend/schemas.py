from pydantic import BaseModel
from typing import Optional, List


# ---- Auth ----
class SignUpRequest(BaseModel):
    username: str
    email: str
    full_name: str = ""
    password: str

class SignInRequest(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class PermissionOut(BaseModel):
    id: int
    screen: str
    can_access: bool
    class Config: from_attributes = True

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_admin: bool
    is_active: bool
    permissions: List[PermissionOut] = []
    class Config: from_attributes = True

class SetPermissionsRequest(BaseModel):
    screens: List[str]  # list of screen names user can access

class ToggleActiveRequest(BaseModel):
    is_active: bool


# ---- Milestone ----
class MilestoneBase(BaseModel):
    title: str
    planned: str = ""
    actual: str = ""
    status: str = "upcoming"
    owner: str = ""
    note: str = ""

class MilestoneCreate(MilestoneBase): pass
class MilestoneOut(MilestoneBase):
    id: int
    project_id: int
    class Config: from_attributes = True


# ---- Action ----
class ActionBase(BaseModel):
    title: str
    responsible: str = ""
    due: str = ""
    priority: str = "High"
    status: str = "open"
    comment: str = ""
    done: bool = False

class ActionCreate(ActionBase): pass
class ActionOut(ActionBase):
    id: int
    project_id: int
    class Config: from_attributes = True


# ---- TeamMember ----
class TeamMemberBase(BaseModel):
    name: str
    role: str = "member"
    email: str = ""
    dept: str = ""
    load: int = 0
    color: str = "#2563eb"

class TeamMemberCreate(TeamMemberBase): pass
class TeamMemberOut(TeamMemberBase):
    id: int
    project_id: int
    class Config: from_attributes = True


# ---- Review ----
class ReviewBase(BaseModel):
    author: str = ""
    initials: str = ""
    color: str = "#2563eb"
    date: str = ""
    status: str = ""
    notes: str = ""
    progress: Optional[int] = None

class ReviewCreate(ReviewBase): pass
class ReviewOut(ReviewBase):
    id: int
    project_id: int
    class Config: from_attributes = True


# ---- Attachment ----
class AttachmentBase(BaseModel):
    name: str = ""
    type: str = ""
    size: str = ""
    uploader: str = ""
    date: str = ""

class AttachmentCreate(AttachmentBase): pass
class AttachmentOut(AttachmentBase):
    id: int
    project_id: int
    class Config: from_attributes = True


# ---- Reminder ----
class ReminderBase(BaseModel):
    text: str = ""
    date: str = ""
    freq: str = "One-time"
    notify: str = ""

class ReminderCreate(ReminderBase): pass
class ReminderOut(ReminderBase):
    id: int
    project_id: int
    completed: bool = False
    snoozed_until: str = ""
    class Config: from_attributes = True


# ---- Activity ----
class ActivityOut(BaseModel):
    id: int
    project_id: Optional[int] = None
    text: str
    user_name: str
    timestamp: str
    icon: str
    color: str
    class Config: from_attributes = True


# ---- Project ----
class ProjectBase(BaseModel):
    proj_id: str = ""
    title: str
    dept: str = ""
    status: str = "On Track"
    priority: str = "Medium"
    progress: int = 0
    sponsor: str = ""
    lead: str = ""
    start: str = ""
    end: str = ""
    background: str = ""
    scope: str = ""
    out_of_scope: str = ""
    kpis: str = ""
    risks: str = ""
    bg_url: str = ""

class ProjectCreate(ProjectBase): pass

class ProjectUpdate(BaseModel):
    proj_id: Optional[str] = None
    title: Optional[str] = None
    dept: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[int] = None
    sponsor: Optional[str] = None
    lead: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    background: Optional[str] = None
    scope: Optional[str] = None
    out_of_scope: Optional[str] = None
    kpis: Optional[str] = None
    risks: Optional[str] = None
    bg_url: Optional[str] = None

class ProjectOut(ProjectBase):
    id: int
    milestones: List[MilestoneOut] = []
    actions: List[ActionOut] = []
    team_members: List[TeamMemberOut] = []
    reviews: List[ReviewOut] = []
    attachments: List[AttachmentOut] = []
    reminders: List[ReminderOut] = []
    class Config: from_attributes = True

class AIAssistRequest(BaseModel):
    query: Optional[str] = None

class AIAssistResponse(BaseModel):
    suggestion: str

# ---- Chatbot ----
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

class KnowledgeDocOut(BaseModel):
    id: int
    filename: str
    filetype: str
    uploaded_at: str
    class Config: from_attributes = True
