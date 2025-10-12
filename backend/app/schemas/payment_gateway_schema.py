from pydantic import BaseModel


class GatewayCredentialsCreate(BaseModel):
    razorpay_key_id: str
    razorpay_key_secret: str
    razorpay_webhook_secret: str
