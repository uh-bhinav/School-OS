// ============================================================================
// MOCK MEDIA & PRODUCTS DATA PROVIDER
// ============================================================================

import type {
  Album,
  Media,
  AlbumKpi,
  Product,
  ProductCategory,
  ProductPackage,
  ProductKpi,
} from "../services/media.schema";

let mockAlbums: Album[] = [];
let mockMedia: Media[] = [];
let mockProductCategories: ProductCategory[] = [];
let mockProducts: Product[] = [];
let mockProductPackages: ProductPackage[] = [];

function initializeMockMedia() {
  if (mockAlbums.length > 0) return;

  // Albums
  const albumNames = [
    { title: "Annual Day 2025", audience: "All" as const },
    { title: "Sports Day", audience: "All" as const },
    { title: "Class 10 Farewell", audience: "Class" as const },
    { title: "Science Exhibition", audience: "Event" as const },
    { title: "Independence Day Celebration", audience: "All" as const },
  ];

  albumNames.forEach((album, index) => {
    const albumId = index + 1;
    const mediaCount = Math.floor(Math.random() * 30) + 10;

    mockAlbums.push({
      album_id: albumId,
      school_id: 1,
      title: album.title,
      description: `Photos from ${album.title}`,
      cover_image_url: `https://picsum.photos/seed/${albumId}/400/300`,
      created_at: "2025-10-01T00:00:00Z",
      media_count: mediaCount,
      target_audience: album.audience,
      is_public: true,
    });

    // Generate media items
    for (let i = 0; i < mediaCount; i++) {
      mockMedia.push({
        media_id: albumId * 100 + i,
        album_id: albumId,
        album_title: album.title,
        file_url: `https://picsum.photos/seed/${albumId * 100 + i}/800/600`,
        thumbnail_url: `https://picsum.photos/seed/${albumId * 100 + i}/200/150`,
        file_type: "Image",
        file_size: Math.floor(Math.random() * 5000000) + 500000,
        caption: `Photo ${i + 1}`,
        uploaded_at: "2025-10-15T00:00:00Z",
      });
    }
  });

  // Product Categories
  mockProductCategories = [
    { category_id: 1, school_id: 1, name: "Uniforms", description: "School uniforms", display_order: 1, is_active: true },
    { category_id: 2, school_id: 1, name: "Books & Stationery", description: "Textbooks and stationery", display_order: 2, is_active: true },
    { category_id: 3, school_id: 1, name: "Sports Equipment", description: "Sports items", display_order: 3, is_active: true },
    { category_id: 4, school_id: 1, name: "School Merchandise", description: "Bags, water bottles, etc.", display_order: 4, is_active: true },
  ];

  // Products
  const productList = [
    { name: "Summer Uniform - Shirt", category: 1, price: 500, stock: 200 },
    { name: "Summer Uniform - Trousers", category: 1, price: 600, stock: 150 },
    { name: "Winter Uniform - Blazer", category: 1, price: 1500, stock: 80 },
    { name: "Sports Uniform", category: 1, price: 800, stock: 120 },
    { name: "Class 10 NCERT Textbook Set", category: 2, price: 2000, stock: 50 },
    { name: "Geometry Box", category: 2, price: 150, stock: 300 },
    { name: "School Diary", category: 2, price: 100, stock: 500 },
    { name: "Cricket Kit", category: 3, price: 3000, stock: 20 },
    { name: "Football", category: 3, price: 500, stock: 40 },
    { name: "School Bag", category: 4, price: 1200, stock: 100 },
    { name: "Water Bottle", category: 4, price: 200, stock: 200 },
  ];

  productList.forEach((product, index) => {
    mockProducts.push({
      product_id: index + 1,
      school_id: 1,
      name: product.name,
      description: `High quality ${product.name.toLowerCase()}`,
      category_id: product.category,
      category_name: mockProductCategories.find(c => c.category_id === product.category)?.name,
      sku: `SKU-${String(index + 1).padStart(4, "0")}`,
      unit_price: product.price,
      stock_quantity: product.stock,
      min_order_quantity: 1,
      max_order_quantity: 10,
      image_url: `https://picsum.photos/seed/product${index + 1}/400/400`,
      is_active: true,
      is_featured: index < 3,
      created_at: "2025-04-01T00:00:00Z",
    });
  });

  // Product Packages
  mockProductPackages = [
    {
      package_id: 1,
      school_id: 1,
      name: "Class 1-5 Starter Kit",
      description: "Complete starter kit for junior classes",
      products: [
        { package_item_id: 1, package_id: 1, product_id: 1, product_name: "Summer Uniform - Shirt", quantity: 2, unit_price: 500, subtotal: 1000 },
        { package_item_id: 2, package_id: 1, product_id: 2, product_name: "Summer Uniform - Trousers", quantity: 2, unit_price: 600, subtotal: 1200 },
        { package_item_id: 3, package_id: 1, product_id: 10, product_name: "School Bag", quantity: 1, unit_price: 1200, subtotal: 1200 },
      ],
      total_price: 3400,
      discounted_price: 3200,
      is_active: true,
    },
  ];

  console.log(`[MOCK MEDIA] Initialized ${mockAlbums.length} albums, ${mockMedia.length} media, ${mockProducts.length} products`);
}

export async function getMockAlbums(): Promise<Album[]> {
  initializeMockMedia();
  await simulateDelay();
  return mockAlbums;
}

export async function getMockMedia(albumId?: number): Promise<Media[]> {
  initializeMockMedia();
  await simulateDelay();
  if (albumId) {
    return mockMedia.filter(m => m.album_id === albumId);
  }
  return mockMedia;
}

export async function getMockAlbumKpi(): Promise<AlbumKpi> {
  initializeMockMedia();
  await simulateDelay();

  const publicAlbums = mockAlbums.filter(a => a.is_public).length;
  const currentMonth = new Date().getMonth();
  const recentUploads = mockMedia.filter(m => {
    const uploadMonth = new Date(m.uploaded_at).getMonth();
    return uploadMonth === currentMonth;
  }).length;

  return {
    total_albums: mockAlbums.length,
    total_media: mockMedia.length,
    public_albums: publicAlbums,
    recent_uploads: recentUploads,
  };
}

export async function getMockProducts(): Promise<Product[]> {
  initializeMockMedia();
  await simulateDelay();
  return mockProducts;
}

export async function getMockProductCategories(): Promise<ProductCategory[]> {
  initializeMockMedia();
  await simulateDelay();
  return mockProductCategories;
}

export async function getMockProductPackages(): Promise<ProductPackage[]> {
  initializeMockMedia();
  await simulateDelay();
  return mockProductPackages;
}

export async function getMockProductKpi(): Promise<ProductKpi> {
  initializeMockMedia();
  await simulateDelay();

  const activeProducts = mockProducts.filter(p => p.is_active).length;
  const lowStockCount = mockProducts.filter(p => p.stock_quantity < 50).length;
  const featuredProducts = mockProducts.filter(p => p.is_featured).length;
  const totalValue = mockProducts.reduce((sum, p) => sum + (p.unit_price * p.stock_quantity), 0);

  return {
    total_products: mockProducts.length,
    active_products: activeProducts,
    low_stock_count: lowStockCount,
    total_categories: mockProductCategories.length,
    featured_products: featuredProducts,
    total_value: Math.round(totalValue),
  };
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockMediaProvider = {
  getAlbums: getMockAlbums,
  getMedia: getMockMedia,
  getAlbumKpi: getMockAlbumKpi,
  getProducts: getMockProducts,
  getProductCategories: getMockProductCategories,
  getProductPackages: getMockProductPackages,
  getProductKpi: getMockProductKpi,
};
