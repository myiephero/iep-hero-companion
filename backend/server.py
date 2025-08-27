from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Matching algorithm weights
MATCHING_WEIGHTS = {
    "tag_overlap": 0.45,
    "grade_area_fit": 0.15,
    "capacity_available": 0.15,
    "language_match": 0.10,
    "price_fit": 0.10,
    "timezone_compatibility": 0.05
}

# Enums
class UserRole(str, Enum):
    PARENT = "parent"
    ADVOCATE = "advocate"
    ADMIN = "admin"

class ProposalStatus(str, Enum):
    PROPOSED = "proposed"
    INTRO_REQUESTED = "intro_requested"
    SCHEDULED = "scheduled"
    ACCEPTED = "accepted"
    DECLINED = "declined"

class EventType(str, Enum):
    PROPOSAL_CREATED = "proposal_created"
    INTRO_REQUESTED = "intro_requested"
    INTRO_SCHEDULED = "intro_scheduled"
    PROPOSAL_ACCEPTED = "proposal_accepted"
    PROPOSAL_DECLINED = "proposal_declined"

# Data Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: UserRole
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_id: str
    name: str
    grade: int
    needs: List[str] = []  # Manual tags like ['autism', 'ot', 'gifted', 'speech']
    languages: List[str] = ["en"]
    timezone: str = "America/New_York"
    budget: Optional[float] = None
    narrative: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdvocateProfile(BaseModel):
    id: str  # Same as user_id
    user_id: str
    tags: List[str] = []  # Specialties like ['autism', 'ot', 'gifted', 'speech']
    languages: List[str] = ["en"]
    timezone: str = "America/New_York"
    hourly_rate: Optional[float] = None
    max_caseload: int = 10
    availability: Dict[str, Any] = {}  # Flexible availability data
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MatchProposal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    advocate_id: str
    status: ProposalStatus = ProposalStatus.PROPOSED
    score: float
    reason: Dict[str, Any] = {}  # Matching reasons and details
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MatchEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    proposal_id: str
    event_type: EventType
    actor_id: str  # Who performed the action
    details: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IntroCall(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    proposal_id: str
    scheduled_at: Optional[datetime] = None
    channel: str = "zoom"  # zoom, phone, google_meet
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    read: bool = False
    proposal_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request/Response Models
class StudentCreate(BaseModel):
    name: str
    grade: int
    needs: List[str] = []
    languages: List[str] = ["en"]
    timezone: str = "America/New_York"
    budget: Optional[float] = None
    narrative: Optional[str] = None

class AdvocateProfileCreate(BaseModel):
    tags: List[str] = []
    languages: List[str] = ["en"]
    timezone: str = "America/New_York"
    hourly_rate: Optional[float] = None
    max_caseload: int = 10
    bio: Optional[str] = None
    experience_years: Optional[int] = None

class MatchSuggestRequest(BaseModel):
    student_id: str
    top_n: int = 5
    filters: Dict[str, Any] = {}

class MatchProposeRequest(BaseModel):
    student_id: str
    advocate_ids: List[str]
    reason: Dict[str, Any] = {}

class IntroRequest(BaseModel):
    when_ts: Optional[str] = None
    channel: str = "zoom"
    link: Optional[str] = None
    notes: Optional[str] = None

# Mock current user function (in real app, this would extract from JWT)
async def get_current_user() -> User:
    # For demo purposes, return a mock user
    return User(
        id="user-123",
        email="parent@example.com",
        name="Test Parent",
        role=UserRole.PARENT
    )

def calculate_jaccard_similarity(set1: List[str], set2: List[str]) -> float:
    """Calculate Jaccard similarity between two lists"""
    if not set1 or not set2:
        return 0.0
    
    s1, s2 = set(set1), set(set2)
    intersection = len(s1.intersection(s2))
    union = len(s1.union(s2))
    
    return intersection / union if union > 0 else 0.0

async def calculate_match_score(student: Student, advocate: AdvocateProfile) -> float:
    """Calculate matching score between student and advocate"""
    scores = {}
    
    # Tag overlap (45%)
    tag_similarity = calculate_jaccard_similarity(student.needs, advocate.tags)
    scores["tag_overlap"] = tag_similarity * MATCHING_WEIGHTS["tag_overlap"]
    
    # Language match (10%)
    lang_similarity = calculate_jaccard_similarity(student.languages, advocate.languages)
    scores["language_match"] = lang_similarity * MATCHING_WEIGHTS["language_match"]
    
    # Grade/area fit (15%) - simplified: assume all advocates can handle all grades
    scores["grade_area_fit"] = 1.0 * MATCHING_WEIGHTS["grade_area_fit"]
    
    # Capacity available (15%)
    # Get current caseload
    current_proposals = await db.match_proposals.count_documents({
        "advocate_id": advocate.id,
        "status": {"$in": [ProposalStatus.ACCEPTED.value, ProposalStatus.SCHEDULED.value]}
    })
    
    capacity_ratio = max(0, (advocate.max_caseload - current_proposals) / advocate.max_caseload)
    scores["capacity_available"] = capacity_ratio * MATCHING_WEIGHTS["capacity_available"]
    
    # Price fit (10%)
    price_score = 1.0  # Default good fit
    if student.budget and advocate.hourly_rate:
        if advocate.hourly_rate <= student.budget:
            price_score = 1.0
        elif advocate.hourly_rate <= student.budget * 1.2:  # Within 20% budget
            price_score = 0.7
        else:
            price_score = 0.3
    scores["price_fit"] = price_score * MATCHING_WEIGHTS["price_fit"]
    
    # Timezone compatibility (5%) - simplified: same timezone = 1.0
    timezone_score = 1.0 if student.timezone == advocate.timezone else 0.5
    scores["timezone_compatibility"] = timezone_score * MATCHING_WEIGHTS["timezone_compatibility"]
    
    total_score = sum(scores.values()) * 100  # Convert to 0-100 scale
    
    return min(100, max(0, total_score))

async def create_notification(user_id: str, title: str, message: str, proposal_id: str = None):
    """Create an in-app notification"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        proposal_id=proposal_id
    )
    await db.notifications.insert_one(notification.dict())

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Advocate Matching API"}

# Student management
@api_router.post("/students", response_model=Student)
async def create_student(student_data: StudentCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.PARENT, UserRole.ADMIN]:
        raise HTTPException(status_code=403, "Only parents and admins can create students")
    
    student = Student(
        parent_id=current_user.id,
        **student_data.dict()
    )
    
    await db.students.insert_one(student.dict())
    return student

@api_router.get("/students", response_model=List[Student])
async def get_students(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.PARENT:
        query = {"parent_id": current_user.id}
    elif current_user.role == UserRole.ADMIN:
        query = {}
    else:
        raise HTTPException(status_code=403, "Access denied")
    
    students = await db.students.find(query).to_list(length=None)
    return [Student(**student) for student in students]

# Advocate profile management
@api_router.post("/advocate-profile", response_model=AdvocateProfile)
async def create_advocate_profile(profile_data: AdvocateProfileCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADVOCATE, UserRole.ADMIN]:
        raise HTTPException(status_code=403, "Only advocates and admins can create advocate profiles")
    
    profile = AdvocateProfile(
        id=current_user.id,
        user_id=current_user.id,
        **profile_data.dict()
    )
    
    await db.advocate_profiles.replace_one(
        {"id": current_user.id},
        profile.dict(),
        upsert=True
    )
    return profile

@api_router.get("/advocate-profiles", response_model=List[AdvocateProfile])
async def get_advocate_profiles():
    profiles = await db.advocate_profiles.find().to_list(length=None)
    return [AdvocateProfile(**profile) for profile in profiles]

# Matching endpoints
@api_router.post("/match/suggest")
async def suggest_matches(request: MatchSuggestRequest, current_user: User = Depends(get_current_user)):
    """Get suggested advocates for a student without creating proposals"""
    
    # Get student
    student_doc = await db.students.find_one({"id": request.student_id})
    if not student_doc:
        raise HTTPException(status_code=404, "Student not found")
    
    student = Student(**student_doc)
    
    # Check permissions
    if current_user.role == UserRole.PARENT and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, "Can only suggest matches for your own students")
    
    # Get all advocate profiles
    advocates_docs = await db.advocate_profiles.find().to_list(length=None)
    advocates = [AdvocateProfile(**doc) for doc in advocates_docs]
    
    # Calculate scores
    scored_advocates = []
    for advocate in advocates:
        score = await calculate_match_score(student, advocate)
        scored_advocates.append({
            "advocate": advocate,
            "score": score,
            "reasons": {
                "tag_overlap": calculate_jaccard_similarity(student.needs, advocate.tags),
                "language_match": len(set(student.languages).intersection(set(advocate.languages))) > 0,
                "capacity_available": advocate.max_caseload > 0,
                "price_fit": not (student.budget and advocate.hourly_rate and advocate.hourly_rate > student.budget),
                "timezone_match": student.timezone == advocate.timezone
            }
        })
    
    # Sort by score and return top N
    scored_advocates.sort(key=lambda x: x["score"], reverse=True)
    return scored_advocates[:request.top_n]

@api_router.post("/match/propose")
async def propose_matches(request: MatchProposeRequest, current_user: User = Depends(get_current_user)):
    """Create match proposals for specified advocates"""
    
    # Get student
    student_doc = await db.students.find_one({"id": request.student_id})
    if not student_doc:
        raise HTTPException(status_code=404, "Student not found")
    
    student = Student(**student_doc)
    
    # Check permissions
    if current_user.role == UserRole.PARENT and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, "Can only propose matches for your own students")
    
    created_proposals = []
    
    for advocate_id in request.advocate_ids:
        # Get advocate
        advocate_doc = await db.advocate_profiles.find_one({"id": advocate_id})
        if not advocate_doc:
            continue
        
        advocate = AdvocateProfile(**advocate_doc)
        
        # Calculate score
        score = await calculate_match_score(student, advocate)
        
        # Create proposal
        proposal = MatchProposal(
            student_id=request.student_id,
            advocate_id=advocate_id,
            score=score,
            reason=request.reason,
            created_by=current_user.id
        )
        
        await db.match_proposals.insert_one(proposal.dict())
        
        # Create event
        event = MatchEvent(
            proposal_id=proposal.id,
            event_type=EventType.PROPOSAL_CREATED,
            actor_id=current_user.id,
            details={"score": score}
        )
        await db.match_events.insert_one(event.dict())
        
        # Create notification for advocate
        await create_notification(
            advocate_id,
            "New Matching Opportunity",
            f"You have a new student match proposal for {student.name} (Grade {student.grade})",
            proposal.id
        )
        
        created_proposals.append(proposal)
    
    return {"created": len(created_proposals), "proposals": created_proposals}

@api_router.get("/match/my")
async def get_my_matches(current_user: User = Depends(get_current_user)):
    """Get match proposals relevant to current user"""
    
    if current_user.role == UserRole.PARENT:
        # Get proposals for my students
        my_students = await db.students.find({"parent_id": current_user.id}).to_list(length=None)
        student_ids = [s["id"] for s in my_students]
        query = {"student_id": {"$in": student_ids}}
    elif current_user.role == UserRole.ADVOCATE:
        # Get proposals addressed to me
        query = {"advocate_id": current_user.id}
    elif current_user.role == UserRole.ADMIN:
        # Get all proposals
        query = {}
    else:
        raise HTTPException(status_code=403, "Access denied")
    
    proposals_docs = await db.match_proposals.find(query).sort("created_at", -1).to_list(length=None)
    proposals = [MatchProposal(**doc) for doc in proposals_docs]
    
    # Enrich with student and advocate details
    enriched_proposals = []
    for proposal in proposals:
        student_doc = await db.students.find_one({"id": proposal.student_id})
        advocate_doc = await db.advocate_profiles.find_one({"id": proposal.advocate_id})
        
        enriched_proposals.append({
            "proposal": proposal,
            "student": Student(**student_doc) if student_doc else None,
            "advocate": AdvocateProfile(**advocate_doc) if advocate_doc else None
        })
    
    return enriched_proposals

@api_router.post("/match/{proposal_id}/intro")
async def request_intro(proposal_id: str, intro_data: IntroRequest, current_user: User = Depends(get_current_user)):
    """Request or schedule an intro call"""
    
    # Get proposal
    proposal_doc = await db.match_proposals.find_one({"id": proposal_id})
    if not proposal_doc:
        raise HTTPException(status_code=404, "Proposal not found")
    
    proposal = MatchProposal(**proposal_doc)
    
    # Check permissions
    student_doc = await db.students.find_one({"id": proposal.student_id})
    if not student_doc:
        raise HTTPException(status_code=404, "Student not found")
    
    student = Student(**student_doc)
    
    if current_user.role == UserRole.PARENT and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, "Not authorized for this proposal")
    elif current_user.role == UserRole.ADVOCATE and proposal.advocate_id != current_user.id:
        raise HTTPException(status_code=403, "Not authorized for this proposal")
    
    # Create intro call record
    intro_call = IntroCall(
        proposal_id=proposal_id,
        scheduled_at=datetime.fromisoformat(intro_data.when_ts) if intro_data.when_ts else None,
        channel=intro_data.channel,
        meeting_link=intro_data.link,
        notes=intro_data.notes,
        created_by=current_user.id
    )
    
    await db.intro_calls.insert_one(intro_call.dict())
    
    # Update proposal status
    new_status = ProposalStatus.SCHEDULED if intro_data.when_ts else ProposalStatus.INTRO_REQUESTED
    await db.match_proposals.update_one(
        {"id": proposal_id},
        {"$set": {"status": new_status.value, "updated_at": datetime.now(timezone.utc)}}
    )
    
    # Create event
    event_type = EventType.INTRO_SCHEDULED if intro_data.when_ts else EventType.INTRO_REQUESTED
    event = MatchEvent(
        proposal_id=proposal_id,
        event_type=event_type,
        actor_id=current_user.id,
        details={"intro_call_id": intro_call.id}
    )
    await db.match_events.insert_one(event.dict())
    
    # Create notifications
    if intro_data.when_ts:
        await create_notification(
            proposal.advocate_id if current_user.role == UserRole.PARENT else student.parent_id,
            "Intro Call Scheduled",
            f"An intro call has been scheduled for {intro_data.when_ts}",
            proposal_id
        )
    else:
        await create_notification(
            proposal.advocate_id if current_user.role == UserRole.PARENT else student.parent_id,
            "Intro Call Requested",
            "An intro call has been requested for this match",
            proposal_id
        )
    
    return {"intro_call": intro_call, "status": new_status}

@api_router.post("/match/{proposal_id}/accept")
async def accept_proposal(proposal_id: str, current_user: User = Depends(get_current_user)):
    """Accept a match proposal"""
    
    # Get proposal
    proposal_doc = await db.match_proposals.find_one({"id": proposal_id})
    if not proposal_doc:
        raise HTTPException(status_code=404, "Proposal not found")
    
    proposal = MatchProposal(**proposal_doc)
    
    # Only advocate can accept
    if current_user.role != UserRole.ADVOCATE or proposal.advocate_id != current_user.id:
        raise HTTPException(status_code=403, "Only the addressed advocate can accept")
    
    # Update proposal status
    await db.match_proposals.update_one(
        {"id": proposal_id},
        {"$set": {"status": ProposalStatus.ACCEPTED.value, "updated_at": datetime.now(timezone.utc)}}
    )
    
    # Create event
    event = MatchEvent(
        proposal_id=proposal_id,
        event_type=EventType.PROPOSAL_ACCEPTED,
        actor_id=current_user.id
    )
    await db.match_events.insert_one(event.dict())
    
    # Get student to notify parent
    student_doc = await db.students.find_one({"id": proposal.student_id})
    if student_doc:
        student = Student(**student_doc)
        await create_notification(
            student.parent_id,
            "Match Proposal Accepted!",
            f"Your advocate match proposal for {student.name} has been accepted!",
            proposal_id
        )
    
    return {"status": "accepted"}

@api_router.post("/match/{proposal_id}/decline")
async def decline_proposal(proposal_id: str, current_user: User = Depends(get_current_user)):
    """Decline a match proposal"""
    
    # Get proposal
    proposal_doc = await db.match_proposals.find_one({"id": proposal_id})
    if not proposal_doc:
        raise HTTPException(status_code=404, "Proposal not found")
    
    proposal = MatchProposal(**proposal_doc)
    
    # Only advocate can decline
    if current_user.role != UserRole.ADVOCATE or proposal.advocate_id != current_user.id:
        raise HTTPException(status_code=403, "Only the addressed advocate can decline")
    
    # Update proposal status
    await db.match_proposals.update_one(
        {"id": proposal_id},
        {"$set": {"status": ProposalStatus.DECLINED.value, "updated_at": datetime.now(timezone.utc)}}
    )
    
    # Create event
    event = MatchEvent(
        proposal_id=proposal_id,
        event_type=EventType.PROPOSAL_DECLINED,
        actor_id=current_user.id
    )
    await db.match_events.insert_one(event.dict())
    
    # Get student to notify parent
    student_doc = await db.students.find_one({"id": proposal.student_id})
    if student_doc:
        student = Student(**student_doc)
        await create_notification(
            student.parent_id,
            "Match Proposal Declined",
            f"Your advocate match proposal for {student.name} was declined",
            proposal_id
        )
    
    return {"status": "declined"}

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    """Get notifications for current user"""
    notifications = await db.notifications.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=50)
    return [Notification(**notif) for notif in notifications]

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    return {"status": "marked_read"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()