# db_test.py
import asyncio
import os

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Load environment file
load_dotenv(".env.test")  # or just ".env" if that's where DATABASE_URL is

DATABASE_URL = os.getenv("DATABASE_URL")


async def main():
    try:
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is not set")

        engine = create_async_engine(DATABASE_URL, echo=True)

        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT school_id, name FROM schools LIMIT 2;"))
            rows = result.fetchall()
            print("✅ Query successful:", rows)

    except Exception as e:
        print("❌ Query failed:", str(e))


asyncio.run(main())
