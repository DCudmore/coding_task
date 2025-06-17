import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
} from '@/api/items';
import { showErrorToast, showSuccessToast } from '@/lib/toastUtils';

import type { Item, CreateItemPayload, UpdateItemPayload, PaginatedResponse } from '../types';

export const itemKeys = {
    all: ['items'] as const,
    lists: () => [...itemKeys.all, 'list'] as const,
    list: (page: number) => [...itemKeys.lists(), page] as const,
    details: () => [...itemKeys.all, 'detail'] as const,
    detail: (id: number) => [...itemKeys.details(), id] as const,
};

// --- Custom Hooks for Queries ---

// Hook to fetch a paginated list of items
export const useItems = (page: number = 1) => {
    return useQuery<PaginatedResponse<Item>, Error>({
        queryKey: itemKeys.list(page),
        queryFn: () => getItems(page),
    });
};

// Hook to fetch a single item by ID
export const useItem = (id: number) => {
    return useQuery<Item, Error>({
        queryKey: itemKeys.detail(id),
        queryFn: () => getItemById(id),
        enabled: !!id, // Only run the query if 'id' is truthy
    });
};


// --- Custom Hooks for Mutations ---

// Hook to create a new item
export const useCreateItem = () => {
    const queryClient = useQueryClient();

    return useMutation<Item, Error, CreateItemPayload>({
        mutationFn: createItem,
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: itemKeys.all });
            showSuccessToast(`Item "${newItem.name}" has been added.`, 'Item created')
        },
        onError: (error) => {
            const errorMessage = `Failed to create item: ${error}`
            console.error(errorMessage);
            showErrorToast(errorMessage, 'Error')
        },
    });
};

// Hook to update an existing item
export const useUpdateItem = () => {
    const queryClient = useQueryClient();

    return useMutation<Item, Error, { id: number; data: UpdateItemPayload }>({
        mutationFn: ({ id, data }) => updateItem(id, data),
        onSuccess: (updatedItem) => {
            queryClient.invalidateQueries({ queryKey: itemKeys.all });
            showSuccessToast(`Item "${updatedItem.name}" has been updated.`, 'Item updated')
        },
        onError: (error) => {
            const errorMessage = `Failed to update item: ${error}`
            console.error(errorMessage);
            showErrorToast(errorMessage, 'Error')
        },
    });
};

// Hook to delete an item
export const useDeleteItem = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: deleteItem,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: itemKeys.all });
            showErrorToast('Item deleted successfully', 'Item Deleted')
        },
        onError: (error) => {
            const errorMessage = `Failed to delete item: ${error}`
            console.error(errorMessage);
            showErrorToast(errorMessage, 'Error')
        },
    });
};
