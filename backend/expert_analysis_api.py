#!/usr/bin/env python3
"""
FastAPI endpoint for Expert IEP Analysis
Integrates the Expert IEP Analyzer into the existing backend
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import tempfile
import os
import json
from expert_iep_analyzer import ExpertIEPAnalyzer
from typing import Optional
import openai

router = APIRouter()
security = HTTPBearer()

def get_openai_key():
    """Get OpenAI API key from environment"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    return api_key

@router.post("/api/expert-iep-analysis")
async def expert_iep_analysis(
    file: UploadFile = File(...),
    user_role: str = "parent",
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Perform expert-level IEP analysis with legal compliance and evidence-based insights
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Get OpenAI API key
        openai_key = get_openai_key()
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Initialize expert analyzer
            analyzer = ExpertIEPAnalyzer(openai_key)
            
            # Run comprehensive analysis
            analysis_result = analyzer.analyze_iep_comprehensive(
                tmp_file_path, 
                role_mode=user_role
            )
            
            return {
                "success": True,
                "analysis": analysis_result,
                "message": f"Expert analysis completed for {user_role} mode"
            }
            
        finally:
            # Clean up temporary file
            os.unlink(tmp_file_path)
            
    except openai.OpenAIError as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/api/expert-analysis-by-id/{document_id}")
async def expert_analysis_by_document_id(
    document_id: str,
    user_role: str = "parent",
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Run expert analysis on an already uploaded document by ID
    """
    try:
        # Note: In production, this would:
        # 1. Fetch document from Supabase by ID
        # 2. Verify user has access to this document
        # 3. Download the PDF content
        # 4. Run expert analysis
        
        # For now, return structure that frontend can use
        return {
            "success": True,
            "message": "Expert analysis endpoint ready",
            "document_id": document_id,
            "user_role": user_role,
            "analysis_available": False,
            "note": "Integration with document storage pending"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze document: {str(e)}")

@router.get("/api/expert-analysis-sample")
async def get_sample_expert_analysis(user_role: str = "parent"):
    """
    Return sample expert analysis for UI development and testing
    """
    
    # Role-specific sample data
    if user_role == "advocate":
        sample_data = {
            "document_info": {
                "text_length": 35417,
                "sections_found": 22,
                "analysis_mode": "advocate",
                "timestamp": "2025-08-29T21:30:00"
            },
            "section_analyses": [
                {
                    "section": "Measurable Goals",
                    "compliance_score": 45,
                    "quality_score": 30,
                    "traceability": "Goals partially connected to present levels but lack measurable criteria",
                    "flags": ["vague_criteria", "missing_baselines", "no_mastery_definition"],
                    "evidence": [
                        {
                            "chunk_id": "goals_section_1",
                            "snippet": "By the end of the IEP, when given a grade level text, Izabella will be able to comprehend academic vocabulary with 85% accuracy in 4 out of 5 trials"
                        }
                    ],
                    "recommendation": "Rewrite goals to specify current reading level baseline, define 'academic vocabulary' precisely, and establish consistent progress measurement methodology per 34 CFR 300.320(a)(2).",
                    "idea_citations": ["34 CFR 300.320(a)(2)", "34 CFR 300.320(a)(1)"]
                },
                {
                    "section": "LRE/Placement",
                    "compliance_score": 40,
                    "quality_score": 35,
                    "traceability": "Placement decision lacks adequate justification",
                    "flags": ["insufficient_lre_justification", "missing_inclusion_consideration"],
                    "evidence": [
                        {
                            "chunk_id": "lre_section_1",
                            "snippet": "The IEP team determined that Izabella will need to access her general education curriculum in a home-based setting"
                        }
                    ],
                    "recommendation": "Document specific attempts at inclusion with supplementary aids. Provide data showing why less restrictive options cannot meet needs per 34 CFR 300.114.",
                    "idea_citations": ["34 CFR 300.114", "34 CFR 300.116"]
                }
            ],
            "red_flags": [
                {
                    "type": "vague_goals",
                    "risk_level": "high", 
                    "section": "Measurable Goals",
                    "evidence": "Goals lack specific measurable criteria",
                    "snippet": "Izabella will be able to comprehend academic vocabulary with 85% accuracy",
                    "chunk_id": "flag_goals_1",
                    "idea_citation": "34 CFR 300.320(a)(2)"
                },
                {
                    "type": "lre_violation",
                    "risk_level": "high",
                    "section": "LRE/Placement", 
                    "evidence": "Home-based placement lacks adequate justification",
                    "snippet": "Izabella will need to access her general education curriculum in a home-based setting",
                    "chunk_id": "flag_lre_1",
                    "idea_citation": "34 CFR 300.114"
                }
            ],
            "overall_scores": {
                "compliance": 50,
                "quality": 40,
                "risk_level": "high"
            },
            "action_plan": {
                "priority_issues": [
                    "Rewrite all IEP goals to include specific baselines and measurable criteria",
                    "Provide comprehensive LRE justification with data on inclusion attempts",
                    "Increase service frequency to match identified needs and goal requirements"
                ],
                "meeting_requests": [
                    "Request IEP team meeting to revise goals for SMART compliance",
                    "Demand LRE reconsideration with inclusion options and supplementary aids",
                    "Review service matrix for adequacy and provider qualifications"
                ],
                "specific_language": [
                    "Per 34 CFR 300.320(a)(2), goals must be measurable with baseline data",
                    "Per 34 CFR 300.114, placement must be in LRE with documented justification", 
                    "Request written prior notice for any placement decisions per 34 CFR 300.503"
                ],
                "follow_up_steps": [
                    "Document all requests in writing with IDEA citations",
                    "Set 30-day timeline for IEP revisions",
                    "Prepare for potential due process if school refuses compliance"
                ]
            }
        }
    else:  # Parent mode
        sample_data = {
            "document_info": {
                "text_length": 35417,
                "sections_found": 22,
                "analysis_mode": "parent",
                "timestamp": "2025-08-29T21:30:00"
            },
            "section_analyses": [
                {
                    "section": "Your Child's Goals",
                    "compliance_score": 45,
                    "quality_score": 30,
                    "traceability": "The goals are connected to your child's needs but could be more specific",
                    "flags": ["goals_need_improvement", "measurements_unclear"],
                    "evidence": [
                        {
                            "chunk_id": "goals_section_1", 
                            "snippet": "Izabella will improve reading comprehension with 85% accuracy"
                        }
                    ],
                    "recommendation": "Ask the team to make the goals more specific. What reading level is Izabella at now? What exactly will she be reading? How will progress be measured?",
                    "idea_citations": ["Federal law requires specific, measurable goals"]
                }
            ],
            "red_flags": [
                {
                    "type": "unclear_goals",
                    "risk_level": "high",
                    "section": "Your Child's Goals", 
                    "evidence": "Goals could be more specific about what success looks like",
                    "snippet": "Izabella will improve reading comprehension",
                    "chunk_id": "flag_goals_1",
                    "idea_citation": "Goals must be measurable by federal law"
                }
            ],
            "overall_scores": {
                "compliance": 50,
                "quality": 40,
                "risk_level": "medium"
            },
            "action_plan": {
                "priority_issues": [
                    "Ask for more specific goals that clearly show what your child will achieve",
                    "Request clearer explanation of how your child's placement was decided", 
                    "Get more details about the services and how often they'll be provided"
                ],
                "meeting_requests": [
                    "Schedule an IEP meeting to discuss making goals more specific",
                    "Ask the team to explain why your child needs this particular placement",
                    "Request a review of services to make sure they match your child's needs"
                ],
                "what_to_ask": [
                    "Can you show me the data that supports this goal?",
                    "How will we know when my child has met this goal?",
                    "What other placement options were considered?"
                ]
            }
        }
    
    return {
        "success": True,
        "analysis": sample_data,
        "sample_mode": True,
        "user_role": user_role
    }