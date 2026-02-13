"""
Voice Announcement Service
===========================
Business logic for voice announcement call feature.
Handles CRUD operations, delivery tracking, and FCM notifications.
"""

import json
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import firebase_admin
from firebase_admin import messaging

from app.core.config import settings
from app.schemas.voice_announcement import (
    VoiceAnnouncementCreate,
    VoiceAnnouncementDeliveryUpdate,
    DeviceTokenCreate,
)


async def get_user_school_id(db: AsyncSession, user_id: UUID) -> Optional[UUID]:
    """Get school UUID from user's profile (generates UUID from integer school_id)."""
    result = await db.execute(
        text("SELECT school_id FROM profiles WHERE user_id = :user_id"),
        {"user_id": str(user_id)}
    )
    row = result.fetchone()
    if not row or not row[0]:
        return None
    
    # Generate deterministic UUID from integer school_id
    # Format: 00000000-0000-0000-0000-00000000000X where X is school_id
    school_id_int = int(row[0])
    uuid_str = f"00000000-0000-0000-0000-{school_id_int:012d}"
    return UUID(uuid_str)


async def create_announcement(
    db: AsyncSession,
    *,
    announcement_in: VoiceAnnouncementCreate,
    created_by: UUID,
    school_id: UUID
) -> dict:
    """Create a voice announcement record."""
    result = await db.execute(
        text("""
            INSERT INTO voice_announcements 
            (school_id, created_by, title, description, audio_file_url, audio_duration, target_audience, priority)
            VALUES (:school_id, :created_by, :title, :description, :audio_url, :duration, CAST(:target AS jsonb), :priority)
            RETURNING id, school_id, created_by, title, description, audio_file_url, audio_duration, 
                      target_audience, priority, sent_at, created_at, updated_at
        """),
        {
            "school_id": str(school_id),
            "created_by": str(created_by),
            "title": announcement_in.title,
            "description": announcement_in.description,
            "audio_url": announcement_in.audio_file_url,
            "duration": announcement_in.audio_duration,
            "target": json.dumps(announcement_in.target_audience),
            "priority": announcement_in.priority
        }
    )
    
    await db.commit()
    row = result.fetchone()
    
    return {
        "id": str(row[0]),
        "school_id": str(row[1]),
        "created_by": str(row[2]),
        "title": row[3],
        "description": row[4],
        "audio_file_url": row[5],
        "audio_duration": row[6],
        "target_audience": row[7],
        "priority": row[8],
        "sent_at": row[9],
        "created_at": row[10].isoformat() if row[10] else None,
        "updated_at": row[11].isoformat() if row[11] else None,
    }


async def get_announcement_by_id(db: AsyncSession, announcement_id: UUID) -> Optional[tuple]:
    """Get announcement by ID."""
    result = await db.execute(
        text("SELECT * FROM voice_announcements WHERE id = :id"),
        {"id": str(announcement_id)}
    )
    return result.fetchone()


async def get_target_teachers(db: AsyncSession, school_id: UUID) -> List[tuple]:
    """Get all teachers in school with their FCM tokens."""
    # Convert UUID back to integer (extract from deterministic format 00000000-0000-0000-0000-{school_id:012d})
    school_id_int = int(str(school_id).split('-')[-1])
    
    print(f"🔍 Fetching teachers for school_id: {school_id_int}")
    
    result = await db.execute(
        text("""
            SELECT t.user_id, dt.fcm_token, p.first_name, p.last_name
            FROM teachers t
            LEFT JOIN device_tokens dt ON dt.user_id = t.user_id
            JOIN profiles p ON t.user_id = p.user_id
            WHERE t.school_id = :school_id
        """),
        {"school_id": school_id_int}
    )
    teachers = result.fetchall()
    print(f"📋 Found {len(teachers)} teachers")
    for t in teachers[:3]:  # Show first 3
        print(f"   - user_id: {t[0]}, has_token: {t[1] is not None}, name: {t[2]} {t[3]}")
    
    # Check if our logged-in user is in the list
    target_user = '28a928d2-5fb1-4456-8add-6b55c7b74f93'
    found = any(str(t[0]) == target_user for t in teachers)
    print(f"🔍 Is teacher2@skl.com ({target_user}) in the list? {found}")
    
    return teachers


async def create_delivery_records(
    db: AsyncSession,
    announcement_id: UUID,
    teachers: List[tuple]
) -> int:
    """Create delivery records for all target teachers."""
    count = 0
    for teacher in teachers:
        await db.execute(
            text("""
                INSERT INTO voice_announcement_deliveries 
                (announcement_id, teacher_id, fcm_token, status)
                VALUES (:announcement_id, :teacher_id, :fcm_token, 'pending')
            """),
            {
                "announcement_id": str(announcement_id),
                "teacher_id": str(teacher[0]),
                "fcm_token": teacher[1] if teacher[1] else None
            }
        )
        count += 1
    await db.commit()
    return count


async def mark_announcement_sent(db: AsyncSession, announcement_id: UUID):
    """Update announcement sent_at timestamp."""
    await db.execute(
        text("UPDATE voice_announcements SET sent_at = NOW() WHERE id = :id"),
        {"id": str(announcement_id)}
    )
    await db.commit()


def send_fcm_notifications(teachers: List[tuple], announcement: tuple) -> dict:
    """
    Send FCM push notifications to teachers.
    Returns stats about sent/failed notifications.
    """
    print(f"📢 send_fcm_notifications called with {len(teachers)} teachers")
    print(f"📢 Announcement: {announcement[3]}")  # title
    
    sent_count = 0
    failed_count = 0
    
    for teacher in teachers:
        fcm_token = teacher[1]
        teacher_id = teacher[0]
        print(f"👤 Processing teacher {teacher_id}, FCM token: {fcm_token[:20] if fcm_token else 'MISSING'}...")
        
        if not fcm_token:
            print(f"⚠️ No FCM token for teacher {teacher_id}")
            failed_count += 1
            continue
        
        try:
            # Build FCM notification
            teacher_name = f"{teacher[2]} {teacher[3]}".strip() if teacher[2] or teacher[3] else "Teacher"
            print(f"📱 Building FCM message for {teacher_name}...")
            message = messaging.Message(
                notification=messaging.Notification(
                    title=f"🔔 Voice Announcement: {announcement[3]}",  # title
                    body=announcement[4] if announcement[4] else "New voice announcement",  # description
                ),
                data={
                    "type": "voice_announcement",
                    "announcement_id": str(announcement[0]),
                    "audio_url": announcement[5],  # audio_file_url
                    "priority": str(announcement[8]),  # priority
                    "teacher_name": teacher_name,
                },
                android=messaging.AndroidConfig(
                    priority="high",
                    notification=messaging.AndroidNotification(
                        sound="default",
                        channel_id="voice_announcements",
                    ),
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound="default",
                            content_available=True,
                        )
                    )
                ),
                token=fcm_token,
            )
            
            # Send notification
            print(f"📤 Sending FCM notification to token: {fcm_token[:20]}...")
            response = messaging.send(message)
            print(f"✅ FCM notification sent successfully! Response: {response}")
            sent_count += 1
            
        except Exception as e:
            print(f"❌ FCM send failed for teacher {teacher[0]}: {str(e)}")
            failed_count += 1
    
    print(f"📊 FCM Stats: {sent_count} sent, {failed_count} failed out of {len(teachers)} total")
    return {
        "sent": sent_count,
        "failed": failed_count,
        "total": len(teachers)
    }


async def get_announcement_deliveries(
    db: AsyncSession,
    announcement_id: UUID
) -> List[dict]:
    """Get delivery status for an announcement."""
    result = await db.execute(
        text("""
            SELECT 
                vad.id,
                vad.announcement_id,
                vad.teacher_id,
                vad.status,
                vad.delivered_at,
                vad.opened_at,
                vad.played_at,
                vad.completed_at,
                vad.created_at,
                p.full_name as teacher_name
            FROM voice_announcement_deliveries vad
            JOIN teachers t ON vad.teacher_id = t.id
            JOIN profiles p ON t.user_id = p.user_id
            WHERE vad.announcement_id = :announcement_id
            ORDER BY vad.created_at DESC
        """),
        {"announcement_id": str(announcement_id)}
    )
    
    deliveries = result.fetchall()
    return [
        {
            "id": str(row[0]),
            "announcement_id": str(row[1]),
            "teacher_id": str(row[2]),
            "status": row[3],
            "delivered_at": row[4].isoformat() if row[4] else None,
            "opened_at": row[5].isoformat() if row[5] else None,
            "played_at": row[6].isoformat() if row[6] else None,
            "completed_at": row[7].isoformat() if row[7] else None,
            "created_at": row[8].isoformat() if row[8] else None,
            "teacher_name": row[9]
        }
        for row in deliveries
    ]


async def get_teacher_announcements(
    db: AsyncSession,
    user_id: UUID
) -> List[dict]:
    """Get voice announcements for a teacher."""
    # Get teacher ID
    teacher_result = await db.execute(
        text("SELECT id FROM teachers WHERE user_id = :user_id"),
        {"user_id": str(user_id)}
    )
    teacher = teacher_result.fetchone()
    
    if not teacher:
        return []
    
    # Get announcements
    result = await db.execute(
        text("""
            SELECT 
                va.id,
                va.title,
                va.description,
                va.audio_file_url,
                va.audio_duration,
                va.priority,
                va.created_at,
                vad.status as delivery_status,
                vad.opened_at,
                vad.played_at,
                vad.completed_at,
                vad.id as delivery_id,
                p.full_name as created_by_name
            FROM voice_announcement_deliveries vad
            JOIN voice_announcements va ON vad.announcement_id = va.id
            JOIN profiles p ON va.created_by = p.user_id
            WHERE vad.teacher_id = :teacher_id
            ORDER BY va.created_at DESC
            LIMIT 50
        """),
        {"teacher_id": str(teacher[0])}
    )
    
    announcements = result.fetchall()
    return [
        {
            "id": str(row[0]),
            "title": row[1],
            "description": row[2],
            "audio_file_url": row[3],
            "audio_duration": row[4],
            "priority": row[5],
            "created_at": row[6].isoformat() if row[6] else None,
            "delivery_status": row[7],
            "opened_at": row[8].isoformat() if row[8] else None,
            "played_at": row[9].isoformat() if row[9] else None,
            "completed_at": row[10].isoformat() if row[10] else None,
            "delivery_id": str(row[11]),
            "created_by_name": row[12]
        }
        for row in announcements
    ]


async def update_delivery_status(
    db: AsyncSession,
    delivery_id: UUID,
    status: str
):
    """Update delivery status with appropriate timestamp."""
    timestamp_field = None
    if status == 'opened':
        timestamp_field = 'opened_at'
    elif status == 'played':
        timestamp_field = 'played_at'
    elif status == 'completed':
        timestamp_field = 'completed_at'
    
    if timestamp_field:
        await db.execute(
            text(f"""
                UPDATE voice_announcement_deliveries 
                SET status = :status, {timestamp_field} = NOW()
                WHERE id = :id
            """),
            {"status": status, "id": str(delivery_id)}
        )
    else:
        await db.execute(
            text("""
                UPDATE voice_announcement_deliveries 
                SET status = :status
                WHERE id = :id
            """),
            {"status": status, "id": str(delivery_id)}
        )
    
    await db.commit()


async def register_device_token(
    db: AsyncSession,
    *,
    user_id: UUID,
    token_data: DeviceTokenCreate
):
    """Register or update FCM token for user's device."""
    print(f"🔐 Registering FCM token for user_id: {user_id}")
    print(f"📱 Token: {token_data.fcm_token[:30]}...")
    
    # Check if token exists
    existing_result = await db.execute(
        text("SELECT id FROM device_tokens WHERE fcm_token = :token"),
        {"token": token_data.fcm_token}
    )
    existing = existing_result.fetchone()
    
    if existing:
        # Update existing token
        await db.execute(
            text("""
                UPDATE device_tokens 
                SET user_id = :user_id, platform = :platform, 
                    device_id = :device_id, app_version = :app_version,
                    last_updated = NOW()
                WHERE fcm_token = :token
            """),
            {
                "user_id": str(user_id),
                "platform": token_data.platform,
                "device_id": token_data.device_id,
                "app_version": token_data.app_version,
                "token": token_data.fcm_token
            }
        )
    else:
        # Insert new token
        await db.execute(
            text("""
                INSERT INTO device_tokens 
                (user_id, fcm_token, platform, device_id, app_version)
                VALUES (:user_id, :token, :platform, :device_id, :app_version)
            """),
            {
                "user_id": str(user_id),
                "token": token_data.fcm_token,
                "platform": token_data.platform,
                "device_id": token_data.device_id,
                "app_version": token_data.app_version
            }
        )
    
    await db.commit()


async def upload_audio_to_storage(supabase_client, file_bytes: bytes, filename: str) -> str:
    """
    Upload audio file to Supabase Storage.
    Returns the public URL of the uploaded file.
    """
    try:
        # Upload to Supabase Storage
        bucket_name = "announcements"
        file_path = f"voice_announcements/{filename}"
        
        # Upload file (determine content type from filename)
        content_type = "audio/mp4" if filename.endswith(".mp4") else "audio/webm"
        await supabase_client.storage.from_(bucket_name).upload(
            path=file_path,
            file=file_bytes,
            file_options={"content-type": content_type}
        )
        
        # Construct public URL manually (avoid coroutine issues)
        public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_path}"
        
        return public_url
        
    except Exception as e:
        print(f"Supabase Storage upload failed: {str(e)}")
        raise
