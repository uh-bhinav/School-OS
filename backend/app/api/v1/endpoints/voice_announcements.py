from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import Client

from app.core.security import get_current_user_profile, get_supabase_client
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.voice_announcement import (
    VoiceAnnouncementCreate,
    VoiceAnnouncementResponse,
    VoiceAnnouncementDeliveryUpdate,
    DeviceTokenCreate,
)
from app.services import voice_announcement_service

router = APIRouter()


# ==================== AUDIO UPLOAD ====================

@router.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...),
    supabase: Client = Depends(get_supabase_client),
    current_user_profile: Profile = Depends(get_current_user_profile),
):
    """Upload voice announcement audio file to Supabase Storage"""
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=400, 
            detail="File must be an audio file"
        )
    
    # Read file bytes
    file_bytes = await file.read()
    
    # Generate unique filename
    import uuid
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'webm'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    try:
        # Upload to Supabase Storage
        file_url = await voice_announcement_service.upload_audio_to_storage(
            supabase, 
            file_bytes, 
            unique_filename
        )
        
        return {
            "file_url": file_url,
            "filename": unique_filename,
            "message": "File uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )


# ==================== VOICE ANNOUNCEMENTS ====================

@router.post("/", response_model=dict)
async def create_voice_announcement(
    announcement: VoiceAnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user_profile: Profile = Depends(get_current_user_profile),
):
    """Create a voice announcement (saves to DB, doesn't send yet)"""
    
    # Get user's school_id
    school_id = await voice_announcement_service.get_user_school_id(db, current_user_profile.user_id)
    if not school_id:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    # Create announcement
    return await voice_announcement_service.create_announcement(
        db,
        announcement_in=announcement,
        created_by=current_user_profile.user_id,
        school_id=school_id
    )


@router.post("/{announcement_id}/send")
async def send_voice_announcement(
    announcement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_profile: Profile = Depends(get_current_user_profile),
):
    """Send voice announcement via FCM to target teachers"""
    
    # Get announcement
    announcement = await voice_announcement_service.get_announcement_by_id(db, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Get target teachers with FCM tokens
    school_id = announcement[1]  # Already a UUID object from database
    teachers = await voice_announcement_service.get_target_teachers(db, school_id)
    
    # Create delivery records
    delivery_count = await voice_announcement_service.create_delivery_records(
        db, announcement_id, teachers
    )
    
    # Update announcement sent_at
    await voice_announcement_service.mark_announcement_sent(db, announcement_id)
    
    # Send FCM notifications
    fcm_stats = voice_announcement_service.send_fcm_notifications(teachers, announcement)
    
    return {
        "success": True,
        "delivery_count": delivery_count,
        "fcm_sent": fcm_stats["sent"],
        "fcm_failed": fcm_stats["failed"],
        "message": f"Sent to {fcm_stats['sent']} teachers, {fcm_stats['failed']} failed"
    }


@router.get("/{announcement_id}/deliveries")
async def get_announcement_deliveries(
    announcement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_profile: Profile = Depends(get_current_user_profile),
):
    """Get delivery status for an announcement"""
    
    deliveries = await voice_announcement_service.get_announcement_deliveries(
        db, announcement_id
    )
    return deliveries


@router.get("/my-announcements")
async def get_my_voice_announcements(
    db: AsyncSession = Depends(get_db),
    current_user_profile: Profile = Depends(get_current_user_profile),
):
    """Get voice announcements for current teacher"""
    
    announcements = await voice_announcement_service.get_teacher_announcements(
        db, current_user_profile.id
    )
    return announcements


# ==================== DELIVERY STATUS ====================

@router.put("/deliveries/{delivery_id}/status")
async def update_delivery_status(
    delivery_id: UUID,
    status_update: VoiceAnnouncementDeliveryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_profile: Profile = Depends(get_current_user_profile),
):
    """Update delivery status when teacher opens/plays/completes announcement"""
    
    await voice_announcement_service.update_delivery_status(
        db, delivery_id, status_update.status
    )
    
    return {"success": True, "status": status_update.status}


# ==================== DEVICE TOKENS ====================

@router.post("/device-tokens")
async def register_device_token(
    token_data: DeviceTokenCreate,
    db: AsyncSession = Depends(get_db),
    current_user_profile: Profile = Depends(get_current_user_profile),
):
    """Register or update FCM token for current user's device"""
    
    await voice_announcement_service.register_device_token(
        db,
        user_id=current_user_profile.user_id,
        token_data=token_data
    )
    
    return {"success": True, "message": "Device token registered"}


@router.post("/device-tokens-demo")
async def register_device_token_demo(
    token_data: DeviceTokenCreate,
    db: AsyncSession = Depends(get_db),
):
    """DEMO ONLY: Register FCM token without auth for demo purposes
    
    This endpoint finds ANY teacher in the database and registers the FCM token for them.
    This is only for demo/development - remove in production!
    """
    
    # Find any teacher in the database
    from sqlalchemy import text, select
    from app.models.profile import Profile
    
    result = await db.execute(
        select(Profile).where(Profile.role == 'teacher').limit(1)
    )
    teacher = result.scalar_one_or_none()
    
    if not teacher:
        raise HTTPException(
            status_code=404,
            detail="No teacher found in database. Please create a teacher account first."
        )
    
    # Register token for this teacher
    await voice_announcement_service.register_device_token(
        db,
        user_id=teacher.id,
        token_data=token_data
    )
    
    return {
        "success": True, 
        "message": f"Device token registered for teacher: {teacher.first_name} {teacher.last_name} (ID: {teacher.id})"
    }

