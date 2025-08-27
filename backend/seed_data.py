#!/usr/bin/env python3
"""
Seed data script for Advocate Matching system
Run this to create demo advocates and students in the database
"""

import asyncio
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment
load_dotenv()
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    print("🌱 Seeding Advocate Matching database...")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing data
    await db.advocate_profiles.delete_many({})
    await db.students.delete_many({})
    await db.match_proposals.delete_many({})
    await db.match_events.delete_many({})
    await db.intro_calls.delete_many({})
    await db.notifications.delete_many({})
    
    # Create advocate profiles
    advocates = [
        {
            "id": "adv-001",
            "user_id": "adv-001", 
            "tags": ["autism", "speech", "behavioral"],
            "languages": ["en"],
            "timezone": "America/New_York",
            "hourly_rate": 85.0,
            "max_caseload": 8,
            "bio": "Specialized in autism spectrum disorders with 8 years of experience",
            "experience_years": 8,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "adv-002", 
            "user_id": "adv-002",
            "tags": ["ot", "sensory", "motor_skills"],
            "languages": ["en", "es"],
            "timezone": "America/New_York", 
            "hourly_rate": 90.0,
            "max_caseload": 10,
            "bio": "Occupational therapy specialist focusing on sensory processing",
            "experience_years": 12,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "adv-003",
            "user_id": "adv-003",
            "tags": ["gifted", "behavioral", "executive_function"],
            "languages": ["en"],
            "timezone": "America/Chicago",
            "hourly_rate": 95.0,
            "max_caseload": 6,
            "bio": "Expert in twice-exceptional students and executive function coaching",
            "experience_years": 15,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "adv-004",
            "user_id": "adv-004", 
            "tags": ["speech", "language", "communication"],
            "languages": ["en", "es"],
            "timezone": "America/Los_Angeles",
            "hourly_rate": 80.0,
            "max_caseload": 12,
            "bio": "Speech-language pathologist with expertise in communication disorders",
            "experience_years": 6,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "adv-005",
            "user_id": "adv-005",
            "tags": ["autism", "ot", "sensory", "behavioral"], 
            "languages": ["en"],
            "timezone": "America/New_York",
            "hourly_rate": 100.0,
            "max_caseload": 5,
            "bio": "Multi-disciplinary specialist in autism and sensory integration",
            "experience_years": 20,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.advocate_profiles.insert_many(advocates)
    print(f"✅ Created {len(advocates)} advocate profiles")
    
    # Create sample students
    students = [
        {
            "id": "student-001",
            "parent_id": "user-123",  # Matches the mock user in server.py
            "name": "Emma Rodriguez",
            "grade": 3,
            "needs": ["autism", "speech"],
            "languages": ["en"],
            "timezone": "America/New_York", 
            "budget": 90.0,
            "narrative": "Emma is a bright 3rd grader with autism who needs support with social communication and speech development.",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "student-002", 
            "parent_id": "user-123",
            "name": "Michael Chen",
            "grade": 7,
            "needs": ["gifted", "executive_function"],
            "languages": ["en"],
            "timezone": "America/New_York",
            "budget": 100.0,
            "narrative": "Michael is gifted but struggles with organization and executive function skills in middle school.",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "student-003",
            "parent_id": "user-123", 
            "name": "Sofia Martinez",
            "grade": 5,
            "needs": ["ot", "sensory", "motor_skills"],
            "languages": ["en", "es"],
            "timezone": "America/New_York",
            "budget": 85.0,
            "narrative": "Sofia has sensory processing challenges and needs occupational therapy support for fine motor skills.",
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.students.insert_many(students)
    print(f"✅ Created {len(students)} student profiles")
    
    # Create some sample notifications
    notifications = [
        {
            "id": "notif-001",
            "user_id": "user-123",
            "title": "Welcome to IEP Hero!",
            "message": "Your account is ready. Start by adding your students and finding advocates.",
            "read": False,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "notif-002", 
            "user_id": "adv-001",
            "title": "Profile Created",
            "message": "Your advocate profile is now active and ready to receive match proposals.",
            "read": False,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.notifications.insert_many(notifications)
    print(f"✅ Created {len(notifications)} notifications")
    
    client.close()
    print("🎉 Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())