import inspect

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client

from app.core.config import settings
from app.core.security import get_supabase_client


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


router = APIRouter()


@router.post("/auth/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(
    req: LoginRequest,
    supabase: Client = Depends(get_supabase_client),
) -> TokenResponse:
    """
    Authenticate user with email and password using Supabase.
    Returns a JWT access token for API authentication.
    """
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })
        
        # Handle both sync and async responses
        if inspect.isawaitable(auth_response):
            auth_response = await auth_response
        
        # Extract the access token from the response
        # The Python Supabase client returns a dict-like object with 'session' key
        access_token = None
        
        if isinstance(auth_response, dict):
            if 'session' in auth_response and auth_response['session']:
                session = auth_response['session']
                if isinstance(session, dict):
                    access_token = session.get('access_token')
                elif hasattr(session, 'access_token'):
                    access_token = session.access_token
            elif 'data' in auth_response and isinstance(auth_response['data'], dict):
                # Handle {data: {session: {...}}} structure
                if 'session' in auth_response['data']:
                    session = auth_response['data']['session']
                    if isinstance(session, dict):
                        access_token = session.get('access_token')
                    elif hasattr(session, 'access_token'):
                        access_token = session.access_token
        elif hasattr(auth_response, 'session'):
            session = auth_response.session
            if hasattr(session, 'access_token'):
                access_token = session.access_token
        elif hasattr(auth_response, 'access_token'):
            access_token = auth_response.access_token
        
        if not access_token:
            # Check for error in response
            error_msg = None
            if isinstance(auth_response, dict):
                if 'error' in auth_response:
                    error_msg = str(auth_response['error'])
                elif 'message' in auth_response:
                    error_msg = str(auth_response['message'])
            
            if error_msg and "Invalid login credentials" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            elif error_msg and "Email not confirmed" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Please confirm your email address before logging in"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid login credentials"
                )
        
        return TokenResponse(access_token=access_token, token_type="bearer")
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle Supabase authentication errors
        error_message = str(e)
        if "Invalid login credentials" in error_message or "invalid" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        elif "Email not confirmed" in error_message or "not confirmed" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please confirm your email address before logging in"
            )
        else:
            # Log the error for debugging but don't expose internal details
            print(f"Login error: {error_message}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Login failed. Please try again."
            )


