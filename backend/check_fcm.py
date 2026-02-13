import asyncio
from sqlalchemy import text
from app.db.session import get_db_engine

async def check():
    engine = get_db_engine()
    async with engine.begin() as conn:
        user_id = '28a928d2-5fb1-4456-8add-6b55c7b74f93'
        
        # Check if teacher exists
        result = await conn.execute(
            text("SELECT user_id, school_id FROM teachers WHERE user_id = :uid"),
            {"uid": user_id}
        )
        teacher = result.fetchone()
        print(f'✅ Teacher exists: {teacher is not None}')
        if teacher:
            print(f'   user_id: {teacher[0]}, school_id: {teacher[1]}')
        
        # Check device token
        result = await conn.execute(
            text("SELECT user_id, LEFT(fcm_token, 40) FROM device_tokens WHERE user_id = :uid"),
            {"uid": user_id}
        )
        token = result.fetchone()
        print(f'✅ Device token exists: {token is not None}')
        if token:
            print(f'   user_id: {token[0]}')
            print(f'   FCM token: {token[1]}...')

asyncio.run(check())
