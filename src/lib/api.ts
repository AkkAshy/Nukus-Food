import axios from 'axios';
import type {
  AuthResponse,
  Restaurant,
  Place,
  AvailabilityResponse,
  Reservation,
  ReservationCreate,
  PaginatedResponse,
  Feature,
  OwnerStats,
  WorkingHours,
  MenuCategory,
  MenuItem,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: { username: string; full_name: string; password: string; password_confirm: string; phone?: string }) => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  login: async (data: { username: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    return response.data;
  },

  logout: async (refresh: string) => {
    await api.post('/auth/logout/', { refresh });
  },

  getMe: async () => {
    const response = await api.get<AuthResponse['user']>('/auth/me/');
    return response.data;
  },

  updateProfile: async (data: { full_name?: string; email?: string }) => {
    const response = await api.patch<AuthResponse['user']>('/auth/me/', data);
    return response.data;
  },
};

// Restaurants API
export const restaurantsApi = {
  getAll: async (params?: { type?: string; search?: string; feature?: number }) => {
    const response = await api.get<PaginatedResponse<Restaurant>>('/restaurants/', { params });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<Restaurant>(`/restaurants/${slug}/`);
    return response.data;
  },

  getPlaces: async (slug: string) => {
    const response = await api.get<Place[]>(`/restaurants/${slug}/places/`);
    return response.data;
  },

  getFeatures: async () => {
    const response = await api.get<Feature[]>('/restaurants/features/');
    return response.data;
  },

  getMenu: async (slug: string) => {
    const response = await api.get<MenuCategory[]>(`/restaurants/${slug}/menu/`);
    return response.data;
  },
};

// Reservations API
// Owner API
export const ownerApi = {
  // Restaurant
  getMyRestaurant: async () => {
    const response = await api.get<Restaurant>('/restaurants/owner/');
    return response.data;
  },

  updateRestaurant: async (data: Partial<Restaurant>) => {
    const response = await api.patch<Restaurant>('/restaurants/owner/', data);
    return response.data;
  },

  // Places
  getPlaces: async () => {
    const response = await api.get<Place[]>('/restaurants/owner/places/');
    return response.data;
  },

  createPlace: async (data: Partial<Place>) => {
    const response = await api.post<Place>('/restaurants/owner/places/', data);
    return response.data;
  },

  updatePlace: async (id: number, data: Partial<Place>) => {
    const response = await api.patch<Place>(`/restaurants/owner/places/${id}/`, data);
    return response.data;
  },

  deletePlace: async (id: number) => {
    await api.delete(`/restaurants/owner/places/${id}/`);
  },

  // Reservations
  getReservations: async (params?: { date?: string; status?: string }) => {
    const response = await api.get<PaginatedResponse<Reservation>>('/reservations/owner/', { params });
    return response.data;
  },

  updateReservation: async (id: number, data: { status: string }) => {
    const response = await api.patch<Reservation>(`/reservations/owner/${id}/`, data);
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await api.get<OwnerStats>('/reservations/owner/stats/');
    return response.data;
  },

  // Images
  uploadImage: async (formData: FormData) => {
    const response = await api.post<{ id: number; url: string; is_main: boolean }>(
      '/restaurants/owner/images/',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  deleteImage: async (imageId: number) => {
    await api.delete(`/restaurants/owner/images/${imageId}/`);
  },

  setMainImage: async (imageId: number) => {
    const response = await api.post(`/restaurants/owner/images/${imageId}/set_main/`);
    return response.data;
  },

  // Working Hours
  getWorkingHours: async () => {
    const response = await api.get<WorkingHours[]>('/restaurants/owner/hours/');
    return response.data;
  },

  updateWorkingHours: async (data: Partial<WorkingHours>[]) => {
    const response = await api.post<WorkingHours[]>('/restaurants/owner/hours/bulk_update/', data);
    return response.data;
  },

  // Menu Categories
  getMenuCategories: async () => {
    const response = await api.get<MenuCategory[]>('/restaurants/owner/menu-categories/');
    return response.data;
  },

  createMenuCategory: async (data: { name: string; description?: string; order?: number; is_active?: boolean }) => {
    const response = await api.post<MenuCategory>('/restaurants/owner/menu-categories/', data);
    return response.data;
  },

  updateMenuCategory: async (id: number, data: Partial<MenuCategory>) => {
    const response = await api.patch<MenuCategory>(`/restaurants/owner/menu-categories/${id}/`, data);
    return response.data;
  },

  deleteMenuCategory: async (id: number) => {
    await api.delete(`/restaurants/owner/menu-categories/${id}/`);
  },

  // Menu Items
  getMenuItems: async (categoryId?: number) => {
    const params = categoryId ? { category: categoryId } : {};
    const response = await api.get<MenuItem[]>('/restaurants/owner/menu-items/', { params });
    return response.data;
  },

  createMenuItem: async (data: Partial<MenuItem> & { category: number }) => {
    const response = await api.post<MenuItem>('/restaurants/owner/menu-items/', data);
    return response.data;
  },

  updateMenuItem: async (id: number, data: Partial<MenuItem>) => {
    const response = await api.patch<MenuItem>(`/restaurants/owner/menu-items/${id}/`, data);
    return response.data;
  },

  deleteMenuItem: async (id: number) => {
    await api.delete(`/restaurants/owner/menu-items/${id}/`);
  },

  uploadMenuItemImage: async (id: number, formData: FormData) => {
    const response = await api.patch<MenuItem>(
      `/restaurants/owner/menu-items/${id}/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};

// Admin API
interface AdminStats {
  users: { total: number; owners: number; admins: number };
  restaurants: { total: number; active: number };
  reservations: { total: number; today: number; pending: number };
}

export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  phone?: string;
  email?: string;
  role: 'user' | 'owner' | 'admin';
  is_verified: boolean;
  created_at: string;
}

export const adminApi = {
  // Stats
  getStats: async () => {
    const response = await api.get<AdminStats>('/admin/stats/');
    return response.data;
  },

  // Users
  getUsers: async (params?: { search?: string; role?: string }) => {
    const response = await api.get<PaginatedResponse<AdminUser>>('/admin/users/', { params });
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await api.get<AdminUser>(`/admin/users/${id}/`);
    return response.data;
  },

  createUser: async (data: { username: string; full_name: string; phone?: string; password: string; role: string }) => {
    const response = await api.post<AdminUser>('/admin/users/', data);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<AdminUser>) => {
    const response = await api.patch<AdminUser>(`/admin/users/${id}/`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await api.delete(`/admin/users/${id}/`);
  },

  // Restaurants
  getRestaurants: async (params?: { search?: string; is_active?: boolean }) => {
    const response = await api.get<PaginatedResponse<Restaurant>>('/admin/restaurants/', { params });
    return response.data;
  },

  getRestaurant: async (id: number) => {
    const response = await api.get<Restaurant>(`/admin/restaurants/${id}/`);
    return response.data;
  },

  createRestaurant: async (data: Partial<Restaurant> & { owner_id: number }) => {
    const response = await api.post<Restaurant>('/admin/restaurants/', data);
    return response.data;
  },

  updateRestaurant: async (id: number, data: Partial<Restaurant>) => {
    const response = await api.patch<Restaurant>(`/admin/restaurants/${id}/`, data);
    return response.data;
  },

  deleteRestaurant: async (id: number) => {
    await api.delete(`/admin/restaurants/${id}/`);
  },

  // Reservations
  getReservations: async (params?: { date?: string; status?: string; restaurant?: number }) => {
    const response = await api.get<PaginatedResponse<Reservation>>('/admin/reservations/', { params });
    return response.data;
  },
};

export const reservationsApi = {
  getAvailability: async (slug: string, date: string, guestCount?: number) => {
    const response = await api.get<AvailabilityResponse>(
      `/reservations/availability/${slug}/`,
      { params: { date, guest_count: guestCount } }
    );
    return response.data;
  },

  create: async (data: ReservationCreate) => {
    const response = await api.post<Reservation>('/reservations/', data);
    return response.data;
  },

  getMyReservations: async () => {
    const response = await api.get<PaginatedResponse<Reservation>>('/reservations/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Reservation>(`/reservations/${id}/`);
    return response.data;
  },

  cancel: async (id: number) => {
    await api.delete(`/reservations/${id}/`);
  },
};

export default api;
