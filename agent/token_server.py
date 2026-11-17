import os
from datetime import timedelta
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
from pydantic import BaseModel

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI(title="SromikVoice AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


class TokenResponse(BaseModel):
    token: str
    serverUrl: str
    roomName: str


@app.get("/api/token", response_model=TokenResponse)
async def create_token():
    server_url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not all([server_url, api_key, api_secret]):
        raise HTTPException(
            status_code=503,
            detail="LiveKit credentials are missing."
        )

    room_name = f"sromikvoice-{uuid4().hex[:12]}"

    access_token = (
        api.AccessToken(api_key, api_secret)
        .with_identity(f"guest-{uuid4().hex[:12]}")
        .with_ttl(timedelta(minutes=10))
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .with_room_config(
            api.RoomConfiguration(
                agents=[
                    api.RoomAgentDispatch(
                        agent_name="my-agent"
                    )
                ]
            )
        )
    )

    return TokenResponse(
        token=access_token.to_jwt(),
        serverUrl=server_url,
        roomName=room_name,
    )
