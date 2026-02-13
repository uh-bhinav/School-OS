from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class VoiceAnnouncementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    audio_file_url: str
    audio_duration: Optional[int] = None
    target_audience: Dict[str, Any] = {"type": "all_teachers"}
    priority: str = "high"


class VoiceAnnouncementResponse(BaseModel):
    id: UUID
    school_id: UUID
    created_by: UUID
    title: str
    description: Optional[str]
    audio_file_url: str
    audio_duration: Optional[int]
    target_audience: Dict[str, Any]
    priority: str
    sent_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VoiceAnnouncementDeliveryUpdate(BaseModel):
    status: str  # 'opened', 'played', 'completed'


class SendAnnouncementRequest(BaseModel):
    announcement_id: UUID


class DeviceTokenCreate(BaseModel):
    fcm_token: str
    platform: str  # 'ios' or 'android'
    device_id: Optional[str] = None
    app_version: Optional[str] = None
