import asyncio

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.sql import text

# --- IMPORTANT ---
# This script assumes you have a .env file in the same directory (backend/)
# with your correct DATABASE_URL.
from app.core.config import settings


async def main():
    """
    Connects to the database and fetches the name of the school with ID 1.
    """
    print("Attempting to connect to the database...")
    print(f"Using Database URL Host: {settings.DATABASE_URL.split('@')[-1]}")

    try:
        # Create an async engine with the DATABASE_URL from your .env file
        engine = create_async_engine(settings.DATABASE_URL)

        # Connect to the database
        async with engine.connect() as connection:
            print("Connection successful!")

            # Define a simple query to get the school name
            query = text("SELECT name FROM schools WHERE school_id = 1")

            # Execute the query
            result = await connection.execute(query)

            # Fetch the first result
            school = result.fetchone()

            if school:
                print("\n--- QUERY SUCCESS ---")
                print(f"Successfully fetched school name: {school[0]}")
                print("---------------------\n")
                print("Your database connection is working correctly!")
            else:
                print("\n--- QUERY FAILED ---")
                print("Connected to the database, but could not find school with ID 1.")
                print("Please ensure you have populated the 'schools' table.")
                print("---------------------\n")

    except Exception as e:
        print("\n--- CONNECTION FAILED ---")
        print(f"An error occurred: {e}")
        print("-------------------------\n")
        print("Please double-check the following:")
        print(
            "1. Your DATABASE_URL in the .env file is the correct"
            " 'direct' connection string from Supabase."
        )
        print("2. Your computer has an active internet connection.")
        print("3. Your Supabase project is not paused.")


if __name__ == "__main__":
    asyncio.run(main())
