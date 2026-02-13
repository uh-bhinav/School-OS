from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabase import Client

from app.core.supabase import get_supabase_client

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Login endpoint - Backend acts as proxy to Supabase Auth
    
    Flow:
    1. Phone sends credentials to backend (phone DNS blocked)
    2. Backend authenticates with Supabase (Mac DNS works!)
    3. Backend returns Supabase JWT tokens to phone
    4. Phone uses these tokens for all subsequent API calls
    
    This works because:
    - Phone can reach backend (same network)
    - Backend can reach Supabase (Mac DNS working)
    - Backend acts as proxy between phone and Supabase
    """
    try:
        # Get Supabase client (backend can access it)
        from supabase import create_client
        import os
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        supabase = create_client(supabase_url, supabase_key)
        
        # Authenticate with Supabase on behalf of the phone
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not response.user or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        return LoginResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user_id=response.user.id,
            email=response.user.email
        )
        
    except Exception as e:
        # Handle Supabase auth errors
        error_msg = str(e)
        if "Invalid login credentials" in error_msg or "Invalid" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Authentication error: {error_msg}"
            )
