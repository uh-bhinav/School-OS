// ============================================================================
// MEDIA & PRODUCTS SCHEMAS
// ============================================================================
// Type definitions for albums, media, and products

// ============================================================================
// ALBUMS & MEDIA
// ============================================================================

export interface Album {
  album_id: number;
  school_id: number;
  title: string;
  description?: string;
  cover_image_url?: string;
  created_by_user_id?: number;
  created_at: string;
  updated_at?: string;
  media_count: number;
  target_audience?: "All" | "Class" | "Event" | "Club";
  target_id?: number;
  target_name?: string;
  is_public: boolean;
}

export interface Media {
  media_id: number;
  album_id: number;
  album_title?: string;
  file_url: string;
  thumbnail_url?: string;
  file_type: "Image" | "Video" | "Document";
  file_size: number;
  caption?: string;
  tags?: string[];
  uploaded_by_user_id?: number;
  uploaded_at: string;
  display_order?: number;
}

export interface AlbumKpi {
  total_albums: number;
  total_media: number;
  public_albums: number;
  recent_uploads: number;
}

// ============================================================================
// PRODUCTS
// ============================================================================

export interface ProductCategory {
  category_id: number;
  school_id: number;
  name: string;
  description?: string;
  parent_category_id?: number;
  display_order?: number;
  is_active: boolean;
}

export interface Product {
  product_id: number;
  school_id: number;
  name: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  sku?: string;
  unit_price: number;
  stock_quantity: number;
  min_order_quantity: number;
  max_order_quantity?: number;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductPackage {
  package_id: number;
  school_id: number;
  name: string;
  description?: string;
  products: ProductPackageItem[];
  total_price: number;
  discounted_price?: number;
  is_active: boolean;
  valid_from?: string;
  valid_to?: string;
}

export interface ProductPackageItem {
  package_item_id: number;
  package_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ProductKpi {
  total_products: number;
  active_products: number;
  low_stock_count: number;
  total_categories: number;
  featured_products: number;
  total_value: number;
}
