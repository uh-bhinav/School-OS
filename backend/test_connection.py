import asyncio

import psycopg

dsn = "postgresql+psycopg://postgres.nrowqnfyfjbsjbzqvkzr:i9Tgl55S0KqvfEOl@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"


async def main():
    try:
        async with await psycopg.AsyncConnection.connect(
            dsn.replace("+psycopg", "")
        ) as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1;")
                row = await cur.fetchone()
                print("Connection OK ✅, result:", row)
    except Exception as e:
        print("Connection failed ❌")
        print(e)


asyncio.run(main())
