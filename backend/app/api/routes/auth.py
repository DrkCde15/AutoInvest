from fastapi import APIRouter

from app.core.security import create_demo_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login() -> dict[str, str]:
    return {
        "user_id": "demo-user",
        "token": create_demo_token("demo-user"),
        "message": "Demo login successful. This endpoint simulates authentication only.",
    }
