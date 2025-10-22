# backend/app/schemas/product_album_link_schema.py
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProductAlbumLinkBase(BaseModel):
    """Base schema for a product-album link."""

    product_id: int = Field(..., gt=0, description="The ID of the product being linked.")
    album_id: int = Field(..., gt=0, description="The ID of the album containing the image.")
    is_primary: Optional[bool] = Field(False, description="Marks this as the primary product image.")
    display_order: Optional[int] = Field(0, description="Order for displaying multiple product images.")


class ProductAlbumLinkCreate(ProductAlbumLinkBase):
    """
    Schema used when creating a new product-album link in the database.
    This is intended for internal service-layer use after a file is uploaded.
    """

    storage_path: str = Field(..., max_length=1024, description="The relative path to the image in the storage bucket.")


class ProductAlbumLinkResponse(BaseModel):
    """
    Schema for returning a product-album link from the API.
    Exposes a secure, time-limited signed URL instead of the raw storage path.
    """

    id: int
    product_id: int
    album_id: int
    is_primary: bool
    display_order: int
    signed_url: Optional[HttpUrl] = Field(None, description="A time-limited, secure URL to access the image.")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
