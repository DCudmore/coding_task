// frontend/src/api/items.ts
import type { Item, CreateItemPayload, UpdateItemPayload, PaginatedResponse } from '../types';

// Define your Django backend API base URL
// Make sure this matches where your Django dev server is running
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to handle fetch responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json(); // Attempt to parse error message from backend
    throw new Error(errorData.detail || errorData.message || JSON.stringify(errorData));
  }
  return response.json();
}

// --- API Functions for Items ---

// Get all items (paginated)
export const getItems = async (page: number = 1): Promise<PaginatedResponse<Item>> => {
  const response = await fetch(`${API_BASE_URL}/items/?page=${page}`);
  return handleResponse<PaginatedResponse<Item>>(response);
};

// Get a single item by ID
export const getItemById = async (id: number): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/items/${id}/`);
  return handleResponse<Item>(response);
};

// Create a new item
export const createItem = async (data: CreateItemPayload): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/items/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Item>(response);
};

// Partially update an item
export const updateItem = async (id: number, data: UpdateItemPayload): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Item>(response);
};

// Delete an item
export const deleteItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
    method: 'DELETE',
  });
  // For DELETE (204 No Content), the response body is empty, so no JSON parsing needed
  if (!response.ok) {
    const errorData = await response.json(); // Attempt to parse error for non-2xx status
    throw new Error(errorData.detail || errorData.message || JSON.stringify(errorData));
  }
};