// frontend/src/hooks/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
} from '../api/items';
import type { Item, CreateItemPayload, UpdateItemPayload, PaginatedResponse } from '../types';
import { toaster } from '@/components/toaster'; // Assuming the snippet created this path

// --- Query Keys ---
// Define a centralized place for your query keys. This is a best practice for React Query.
export const itemKeys = {
    all: ['items'] as const, // For all items, usually used for invalidation
    lists: () => [...itemKeys.all, 'list'] as const, // For the list of items
    list: (page: number) => [...itemKeys.lists(), page] as const, // For a specific page of items
    details: () => [...itemKeys.all, 'detail'] as const, // For individual item details
    detail: (id: number) => [...itemKeys.details(), id] as const, // For a specific item's details
};


// --- Custom Hooks for Queries ---

// Hook to fetch a paginated list of items
export const useItems = (page: number = 1) => {
    return useQuery<PaginatedResponse<Item>, Error>({
        queryKey: itemKeys.list(page), // Unique key for this query, includes page number
        queryFn: () => getItems(page), // The async function that fetches the data
        // You can add more options here, e.g., staleTime, refetchInterval
    });
};

// Hook to fetch a single item by ID
export const useItem = (id: number) => {
    return useQuery<Item, Error>({
        queryKey: itemKeys.detail(id), // Unique key for this query
        queryFn: () => getItemById(id), // The async function to fetch the item
        enabled: !!id, // Only run the query if 'id' is truthy
    });
};


// --- Custom Hooks for Mutations ---

// Hook to create a new item
export const useCreateItem = () => {
    const queryClient = useQueryClient(); // Get the query client instance

    return useMutation<Item, Error, CreateItemPayload>({
        mutationFn: createItem, // The async function that performs the creation

        onSuccess: (newItem) => {
            // Invalidate the 'items' list queries so they refetch and show the new item
            queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
            toaster.create({
                title: 'Item created.',
                description: `Item "${newItem.name}" has been added.`,
                type: 'success',
                duration: 3000,
                closable: true,
            });
        },
        onError: (error, variables, context) => {
            const errorMessage = `Failed to create item:" ${error}, ${variables}, ${context}`
            console.error(errorMessage);
            toaster.create({
                title: 'Error',
                description: errorMessage,
                type: 'error',
                closable: true,
            });
        },
    });
};

// Hook to update an existing item
export const useUpdateItem = () => {
    const queryClient = useQueryClient();

    return useMutation<Item, Error, { id: number; data: UpdateItemPayload }>({
        mutationFn: ({ id, data }) => updateItem(id, data),
        onSuccess: (updatedItem) => {
            // Invalidate the specific item's detail query
            queryClient.invalidateQueries({ queryKey: itemKeys.detail(updatedItem.id) });
            // Invalidate all 'items' list queries to ensure lists reflect the update
            queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
            toaster.create({
                title: 'Item updated.',
                description: `Item "${updatedItem.name}" has been updated.`,
                type: 'success',
                duration: 3000,
                closable: true,
            });
        },
        onError: (error, variables, context) => {
            const errorMessage = `Failed to update item:" ${error}, ${variables}, ${context}`
            console.error(errorMessage);
            toaster.create({
                title: 'Error',
                description: errorMessage,
                type: 'error',
                closable: true,
            });
        },
    });
};

// Hook to delete an item
export const useDeleteItem = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({ // <void> because deleteItem returns Promise<void>
        mutationFn: deleteItem,

        onSuccess: () => {
            // Invalidate all 'items' list queries after deletion
            queryClient.invalidateQueries({ queryKey: itemKeys.lists() });

            toaster.create({
                title: 'Deletion',
                description: 'Item deleted successfully',
                type: 'error',
                closable: true,
            });

        },
        onError: (error, id, context) => {
            const errorMessage = `Failed to delete item:" ${error}, ${id}, ${context}`
            console.error(errorMessage);
            toaster.create({
                title: 'Error',
                description: errorMessage,
                type: 'error',
                closable: true,
            });
        },
    });
};