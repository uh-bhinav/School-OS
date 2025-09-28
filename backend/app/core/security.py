# app/core/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client
from app.core.config import settings
from app.db.session import get_db # We will create this next
# ... other imports ...

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # We won't use tokenUrl, just for dependency

async def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        user_response = await supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

# We will expand this function later to check roles from our database
def require_role(required_role: str):
    # This is a placeholder for now. We will build this out in Sprint 1.
    def role_checker(user = Depends(get_current_user)):
        print(f"User {user.email} is trying to access a route that requires {required_role} role.")
        # In the future, this will query the user_roles table
        return user
    return role_checker