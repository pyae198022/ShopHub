// Configure your Spring Boot backend URL here
export const API_CONFIG = {
  // Change this to your Spring Boot backend URL
  BASE_URL: (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  
  // API Endpoints - adjust these to match your Spring Boot controller mappings
  ENDPOINTS: {
    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id: string) => `/products/${id}`,
    CART: '/cart',
    CART_ITEMS: '/cart/items',
    CART_ITEM: (id: string) => `/cart/items/${id}`,
    CHECKOUT: '/checkout',
    ORDERS: '/orders',
    ORDER_BY_ID: (id: string) => `/orders/${id}`,
  }
};
