from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import agent

import os

app = FastAPI()

# Allow CORS for Cloud Run and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for public Cloud Run deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    ageGroup: Optional[str] = None
    occupation: Optional[str] = None
    prefecture: Optional[str] = None
    interests: List[str] = []

class ChatRequest(BaseModel):
    message: str
    agentType: str
    userProfile: Optional[UserProfile] = None
    history: Optional[List[Dict[str, Any]]] = []

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    print(f"Received request: {request.agentType} - {request.message}")
    result = await agent.generate_response(
        request.agentType, 
        request.message, 
        request.userProfile.dict() if request.userProfile else None
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
