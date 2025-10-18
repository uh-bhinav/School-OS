from typing import Dict

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.album import Album
from app.models.media_item import MediaItem
from app.models.product import Product
from app.models.product_album_link import ProductAlbumLink
from app.schemas.product_schema import ProductCreate, ProductUpdate
from app.services.media_service import media_service


class ProductService:
    def get_product(self, db: Session, product_id: int):
        return db.query(Product).filter(Product.product_id == product_id).first()

    def get_products(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(Product).offset(skip).limit(limit).all()

    def get_products_by_school(self, db: Session, school_id: int, skip: int = 0, limit: int = 100):
        return db.query(Product).filter(Product.school_id == school_id).offset(skip).limit(limit).all()

    def create_product(self, db: Session, product: ProductCreate, school_id: int):
        db_product = Product(**product.dict(), school_id=school_id)
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    def update_product(self, db: Session, product_id: int, product: ProductUpdate):
        db_product = self.get_product(db, product_id)
        if db_product:
            update_data = product.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_product, key, value)
            db.commit()
            db.refresh(db_product)
        return db_product

    def delete_product(self, db: Session, product_id: int):
        db_product = self.get_product(db, product_id)
        if db_product:
            db.delete(db_product)
            db.commit()
        return db_product

    # --- NEW METHODS FROM ROADMAP ---

    def link_product_to_album(self, db: Session, *, product_id: int, album_id: int, storage_path: str, is_primary: bool = False, display_order: int = 0) -> ProductAlbumLink:
        """
        Creates a link between a product and a media item's storage path.

        Args:
            db (Session): The database session.
            product_id (int): The ID of the product.
            album_id (int): The ID of the album.
            storage_path (str): The relative path of the image in storage.
            is_primary (bool): Whether this is the primary image for the product.
            display_order (int): The display order for the image.

        Returns:
            ProductAlbumLink: The created link record.
        """
        album = db.query(Album).filter(Album.id == album_id).first()
        if not album or album.album_type != "ecommerce":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Album not found or is not an 'ecommerce' type album.")

        db_link = ProductAlbumLink(product_id=product_id, album_id=album_id, storage_path=storage_path, is_primary=is_primary, display_order=display_order)
        db.add(db_link)
        db.commit()
        db.refresh(db_link)
        return db_link

    def get_product_images(self, db: Session, *, product_id: int, user_context: dict) -> list[Dict[str, any]]:
        """
        Fetches all images for a product and generates signed URLs for them.
        The underlying RLS policy will determine if the user has access.

        Args:
            db (Session): The database session.
            product_id (int): The ID of the product.
            user_context (dict): The user's context (required for the access check).

        Returns:
            List[Dict[str, any]]: A list of dictionaries, each with image metadata and a signed URL.
        """
        links = db.query(ProductAlbumLink).filter(ProductAlbumLink.product_id == product_id).order_by(ProductAlbumLink.display_order).all()

        image_list = []
        for link in links:
            # Find the corresponding media_item using the unique storage_path
            media_item = db.query(MediaItem).filter(MediaItem.storage_path == link.storage_path).first()

            if not media_item:
                continue  # Skip if media item record doesn't exist

            try:
                # generate_signed_url will succeed or fail based on the RLS policies we set up
                signed_url = media_service.generate_signed_url(db, media_item_id=media_item.id, user_context=user_context)
                image_list.append({"storage_path": link.storage_path, "is_primary": link.is_primary, "display_order": link.display_order, "signed_url": signed_url})
            except Exception as e:
                # This will catch errors if RLS denies access. We'll log it and continue,
                # so the user sees only the images they are permitted to see.
                print(f"Could not generate signed URL for {link.storage_path}. Error: {e}")
                continue

        return image_list


product_service = ProductService()
