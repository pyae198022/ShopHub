import { API_CONFIG } from '@/config/api';
import type { Product, Cart, CartItem, Order, CheckoutData } from '@/types/ecommerce';

const { BASE_URL, ENDPOINTS } = API_CONFIG;

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Product API calls
export const productApi = {
  getAll: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return apiFetch<Product[]>(`${ENDPOINTS.PRODUCTS}${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Product> => {
    return apiFetch<Product>(ENDPOINTS.PRODUCT_BY_ID(id));
  },

  getCategories: async (): Promise<string[]> => {
    return apiFetch<string[]>(`${ENDPOINTS.PRODUCTS}/categories`);
  },
};

// Cart API calls
export const cartApi = {
  get: async (): Promise<Cart> => {
    return apiFetch<Cart>(ENDPOINTS.CART);
  },

  addItem: async (productId: string, quantity: number): Promise<Cart> => {
    return apiFetch<Cart>(ENDPOINTS.CART_ITEMS, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    return apiFetch<Cart>(ENDPOINTS.CART_ITEM(itemId), {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    return apiFetch<Cart>(ENDPOINTS.CART_ITEM(itemId), {
      method: 'DELETE',
    });
  },

  clear: async (): Promise<void> => {
    return apiFetch<void>(ENDPOINTS.CART, {
      method: 'DELETE',
    });
  },
};

// Order API calls
export const orderApi = {
  create: async (checkoutData: CheckoutData): Promise<Order> => {
    return apiFetch<Order>(ENDPOINTS.CHECKOUT, {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },

  getAll: async (): Promise<Order[]> => {
    return apiFetch<Order[]>(ENDPOINTS.ORDERS);
  },

  getById: async (id: string): Promise<Order> => {
    return apiFetch<Order>(ENDPOINTS.ORDER_BY_ID(id));
  },
};
