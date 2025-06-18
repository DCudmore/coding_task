import type { Item, CreateItemPayload, UpdateItemPayload, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json(); // Attempt to parse error message from backend
    throw new Error(errorData.detail || errorData.message || JSON.stringify(errorData));
  }
  return response.json();
}

export const getItems = async (page: number = 1): Promise<PaginatedResponse<Item>> => {
  const response = await fetch(`${API_BASE_URL}/items/?page=${page}`);
  return handleResponse<PaginatedResponse<Item>>(response);
};
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

export const deleteItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
    method: 'DELETE',
  });
  // For DELETE (204 No Content), the response body is empty, so no JSON parsing needed
  if (!response.ok) {
    return handleResponse(response);
  }
};