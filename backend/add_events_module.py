#!/usr/bin/env python3
"""
Script to add 'events' module to school configuration
Run this script to update your school's configuration to include the Events module
"""

import asyncio

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.school import School


async def add_events_module():
    """Add 'events' to the subscribed modules in school configuration"""

    db = SessionLocal()
    try:
        # Get all schools
        result = db.execute(select(School))
        schools = result.scalars().all()

        if not schools:
            print("❌ No schools found in database")
            return

        for school in schools:
            print(f"\n📚 Processing school: {school.name} (ID: {school.school_id})")

            # Get current configuration
            config = school.configuration or {}

            # Initialize modules if not exists
            if "modules" not in config:
                config["modules"] = {
                    "catalog_version": "2025.11",
                    "subscribed": [],
                    "available": [],
                    "settings": {},
                    "dependencies": {},
                }

            # Get subscribed modules
            subscribed = config["modules"].get("subscribed", [])

            # Check if events already exists
            if "events" in subscribed:
                print("   ✅ 'events' module already subscribed")
                continue

            # Add events to subscribed modules
            subscribed.append("events")
            config["modules"]["subscribed"] = subscribed

            # Also add to nav_order if ui section exists
            if "ui" in config:
                nav_order = config["ui"].get("nav_order", [])
                if "events" not in nav_order:
                    # Add events before media.media
                    if "media.media" in nav_order:
                        idx = nav_order.index("media.media")
                        nav_order.insert(idx, "events")
                    else:
                        nav_order.append("events")
                    config["ui"]["nav_order"] = nav_order

            # Update the school configuration
            school.configuration = config
            db.commit()

            print("   ✅ Added 'events' module to subscribed list")
            print(f"   📋 Subscribed modules: {subscribed}")

        print("\n✨ All schools updated successfully!")
        print("\n🔄 Please refresh your browser to see the Events menu item")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(add_events_module())
