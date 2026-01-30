# backend/app/api/v1/endpoints/timetable_proxy.py
"""
Timetable Generator Proxy Endpoints.

This module proxies requests to the standalone Timetable Generator service
running on localhost:8010. The standalone service uses OR-Tools CP-SAT solver
for advanced constraint-based timetable generation.

Proxy Pattern:
- ERP Frontend: /api/admin/timetable/* → This Proxy → localhost:8010/api/v1/timetable/*
- All requests are forwarded with appropriate headers
- Authentication is handled by ERP before reaching proxy

Security:
- All endpoints require Admin role
- Proxy validates requests before forwarding
- Target service should only accept requests from localhost
"""
import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.core.security import require_role

logger = logging.getLogger(__name__)

router = APIRouter()

# Timetable Generator service configuration
TIMETABLE_SERVICE_URL = "http://127.0.0.1:8010"
TIMETABLE_API_PREFIX = "/api/v1/timetable"
REQUEST_TIMEOUT = 300.0  # 5 minutes for solver operations


async def proxy_request(
    request: Request,
    path: str,
    method: str = "GET",
) -> Response:
    """
    Proxy a request to the Timetable Generator service.

    Args:
        request: Original FastAPI request
        path: Target path on timetable service
        method: HTTP method

    Returns:
        Proxied response from timetable service
    """
    target_url = f"{TIMETABLE_SERVICE_URL}{TIMETABLE_API_PREFIX}{path}"

    # Get request body if present
    body = None
    if method in ("POST", "PUT", "PATCH"):
        body = await request.body()

    # Forward relevant headers
    headers = {
        "Content-Type": request.headers.get("Content-Type", "application/json"),
        "Accept": request.headers.get("Accept", "application/json"),
        "X-Forwarded-For": request.client.host if request.client else "unknown",
        "X-ERP-Proxy": "true",  # Marker for timetable service to verify proxy
    }

    # Get query params
    query_params = dict(request.query_params)

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.request(
                method=method,
                url=target_url,
                content=body,
                headers=headers,
                params=query_params,
            )

            # Return the proxied response
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers={
                    "Content-Type": response.headers.get("Content-Type", "application/json"),
                },
            )

    except httpx.ConnectError:
        logger.error(f"Failed to connect to Timetable Generator at {target_url}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Timetable Generator service is unavailable. Please ensure it is running on port 8010.",
        )
    except httpx.TimeoutException:
        logger.error(f"Request to Timetable Generator timed out: {target_url}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Request to Timetable Generator timed out. The solver may be processing a complex schedule.",
        )
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error communicating with Timetable Generator: {str(e)}",
        )


# ============================================================================
# Health Check
# ============================================================================


@router.get(
    "/health",
    summary="Check Timetable Generator Health",
    description="Verify that the standalone Timetable Generator service is running.",
    dependencies=[Depends(require_role("Admin"))],
)
async def health_check(request: Request):
    """Check if the Timetable Generator service is healthy."""
    return await proxy_request(request, "/health", "GET")


# ============================================================================
# Sample Data
# ============================================================================


@router.get(
    "/sample-data",
    summary="Get Sample Timetable Data",
    description="Retrieve sample school data for demo/testing purposes.",
    dependencies=[Depends(require_role("Admin"))],
)
async def get_sample_data(request: Request):
    """Get bundled sample data for demonstration."""
    return await proxy_request(request, "/sample-data", "GET")


# ============================================================================
# Data Upload & Validation
# ============================================================================


@router.post(
    "/upload",
    summary="Upload School Data",
    description="Upload school data (teachers, subjects, classes, etc.) for timetable generation.",
    dependencies=[Depends(require_role("Admin"))],
)
async def upload_data(request: Request):
    """Upload school data for timetable generation."""
    return await proxy_request(request, "/upload", "POST")


@router.post(
    "/validate",
    summary="Validate School Data",
    description="Validate uploaded school data without creating a solve job.",
    dependencies=[Depends(require_role("Admin"))],
)
async def validate_data(request: Request):
    """Validate school data structure and constraints."""
    return await proxy_request(request, "/validate", "POST")


# ============================================================================
# Solve Jobs
# ============================================================================


@router.post(
    "/solve",
    summary="Create Solve Job",
    description="Submit a timetable generation job with constraints.",
    dependencies=[Depends(require_role("Admin"))],
)
async def create_solve_job(request: Request):
    """Create a new timetable solve job."""
    return await proxy_request(request, "/solve", "POST")


@router.get(
    "/jobs",
    summary="List Jobs",
    description="List all timetable generation jobs.",
    dependencies=[Depends(require_role("Admin"))],
)
async def list_jobs(request: Request):
    """List all solve jobs with optional filtering."""
    return await proxy_request(request, "/jobs", "GET")


@router.get(
    "/jobs/{job_id}",
    summary="Get Job Status",
    description="Get the status of a specific timetable generation job.",
    dependencies=[Depends(require_role("Admin"))],
)
async def get_job_status(job_id: str, request: Request):
    """Get status of a specific solve job."""
    return await proxy_request(request, f"/jobs/{job_id}", "GET")


@router.get(
    "/jobs/{job_id}/result",
    summary="Get Job Result",
    description="Get the result of a completed timetable generation job.",
    dependencies=[Depends(require_role("Admin"))],
)
async def get_job_result(job_id: str, request: Request):
    """Get the result of a completed solve job."""
    return await proxy_request(request, f"/jobs/{job_id}/result", "GET")


@router.get(
    "/jobs/{job_id}/logs",
    summary="Get Job Logs",
    description="Get solver logs for a specific job.",
    dependencies=[Depends(require_role("Admin"))],
)
async def get_job_logs(job_id: str, request: Request):
    """Get solver logs for a job."""
    return await proxy_request(request, f"/jobs/{job_id}/logs", "GET")


@router.post(
    "/jobs/{job_id}/cancel",
    summary="Cancel Job",
    description="Cancel a running timetable generation job.",
    dependencies=[Depends(require_role("Admin"))],
)
async def cancel_job(job_id: str, request: Request):
    """Cancel a running solve job."""
    return await proxy_request(request, f"/jobs/{job_id}/cancel", "POST")


@router.post(
    "/jobs/{job_id}/rerun",
    summary="Rerun Job",
    description="Rerun a completed or failed job with same or modified parameters.",
    dependencies=[Depends(require_role("Admin"))],
)
async def rerun_job(job_id: str, request: Request):
    """Rerun a job with same or modified parameters."""
    return await proxy_request(request, f"/jobs/{job_id}/rerun", "POST")


# ============================================================================
# Download Results
# ============================================================================


@router.get(
    "/jobs/{job_id}/download",
    summary="Download Result",
    description="Download timetable result in various formats (json, csv, xlsx).",
    dependencies=[Depends(require_role("Admin"))],
)
async def download_result(job_id: str, request: Request):
    """Download job result in specified format."""
    return await proxy_request(request, f"/jobs/{job_id}/download", "GET")
