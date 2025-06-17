// frontend/src/components/ItemTable.tsx
import React, { useState } from 'react';
import {
  Box,
  Text,
  Spinner,
  Alert,
  Button,
  Flex,
  IconButton,
} from '@chakra-ui/react';
// Correct Chakra UI v3 Table import and usage
import { Table } from '@chakra-ui/react'; // Table.Root, Table.Header, etc. are accessed via this import
import { MdEdit, MdDelete, MdChevronLeft, MdChevronRight, MdArrowUpward, MdArrowDownward, MdUnfoldMore } from 'react-icons/md';

import { useItems, useDeleteItem } from '../hooks/useItems';
import type { Item } from '../types'; // Using 'type' for type imports
import { Tooltip } from "./Tooltip"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

interface ItemTableProps {
  onEdit: (item: Item) => void; // Callback when edit button is clicked
}

type SortField = 'name' | 'group' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const ItemTable: React.FC<ItemTableProps> = ({ onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { data, isLoading, isError, error } = useItems(currentPage);
  const deleteMutation = useDeleteItem();

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) {
      return <MdUnfoldMore style={{ opacity: 0.5 }} />;
    }
    return sortDirection === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="teal.500" />
        <Text ml={4}>Loading items...</Text>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert.Root status="error" mt={4}> {/* Use Alert.Root */}
        <Alert.Indicator /> {/* <-- NEW: Use Alert.Indicator */}
        <Alert.Content> {/* NEW: Wrap content in Alert.Content */}
          <Alert.Description> {/* NEW: Use Alert.Description for the message */}
            Error loading items: {error?.message || 'An unknown error occurred.'}
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <Box p={4} textAlign="center" mt={4}>
        <Text fontSize="xl" color="gray.500">No items found.</Text>
      </Box>
    );
  }

  const { results, count, next, previous } = data;
  const totalPages = Math.ceil(count / 10); // Assuming page_size = 10 from your backend

  const sortedResults = [...results].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'group':
        return multiplier * a.group.localeCompare(b.group);
      case 'created_at':
        return multiplier * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'updated_at':
        return multiplier * (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
      default:
        return 0;
    }
  });

  return (
    <Box>
      {/* Use Table.Root and its sub-components for Chakra UI v3 */}
      <Table.Root width="100%">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader 
              width="25%" 
              cursor="pointer" 
              onClick={() => handleSort('name')}
              _hover={{ bg: 'gray.50' }}
            >
              <Flex align="center" gap={2}>
                Name
                <SortIcon field="name" />
              </Flex>
            </Table.ColumnHeader>
            <Table.ColumnHeader 
              width="20%" 
              cursor="pointer"
              onClick={() => handleSort('group')}
              _hover={{ bg: 'gray.50' }}
            >
              <Flex align="center" gap={2}>
                Group
                <SortIcon field="group" />
              </Flex>
            </Table.ColumnHeader>
            <Table.ColumnHeader 
              width="25%" 
              textAlign="right" 
              pr={{ base: 4, md: 8 }}
              cursor="pointer"
              onClick={() => handleSort('created_at')}
              _hover={{ bg: 'gray.50' }}
            >
              <Flex align="center" justify="flex-end" gap={2}>
                Created At
                <SortIcon field="created_at" />
              </Flex>
            </Table.ColumnHeader>
            <Table.ColumnHeader 
              width="25%" 
              textAlign="right" 
              pr={{ base: 4, md: 8 }}
              cursor="pointer"
              onClick={() => handleSort('updated_at')}
              _hover={{ bg: 'gray.50' }}
            >
              <Flex align="center" justify="flex-end" gap={2}>
                Updated At
                <SortIcon field="updated_at" />
              </Flex>
            </Table.ColumnHeader>
            <Table.ColumnHeader width="5%">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedResults.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.group}</Table.Cell>
              <Table.Cell textAlign="right" whiteSpace="nowrap" pr={{ base: 4, md: 8 }}>{formatDate(item.created_at)}</Table.Cell>
              <Table.Cell textAlign="right" whiteSpace="nowrap" pr={{ base: 4, md: 8 }}>{formatDate(item.updated_at)}</Table.Cell>
              <Table.Cell>
                <Flex>
                  <Tooltip content="Edit Item">
                    <IconButton
                      aria-label="Edit Item"
                      size="sm"
                      mr={2}
                      onClick={() => onEdit(item)}
                      variant="outline"
                      bg="gray.200"
                      color="gray.700"
                      _hover={{ bg: 'gray.300' }}
                    >
                      <MdEdit />
                    </IconButton>
                  </Tooltip>

                  <Tooltip content="Delete Item">
                    <IconButton
                      aria-label="Delete Item"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      loading={deleteMutation.isPending && deleteMutation.variables === item.id}
                      variant="solid"
                      bg="red.500"
                      color="white"
                      _hover={{ bg: 'red.600' }}
                    >
                      <MdDelete />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Flex mt={6} justifyContent="center" alignItems="center" gap={4}>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!previous || currentPage === 1}
            variant="outline"
            size="sm"
            _hover={{ bg: 'gray.50' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <MdChevronLeft style={{ marginRight: '4px' }} />
            Previous
          </Button>
          
          <Flex align="center" gap={2}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={page === currentPage ? "solid" : "ghost"}
                colorScheme={page === currentPage ? "orange" : "gray"}
                bg={page === currentPage ? "orange.500" : undefined}
                color={page === currentPage ? "white" : undefined}
                _hover={page === currentPage ? { bg: "orange.600" } : { bg: "gray.100" }}
                onClick={() => handlePageChange(page)}
                minW="8"
                h="8"
                p={0}
              >
                {page}
              </Button>
            ))}
          </Flex>

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!next || currentPage === totalPages}
            variant="outline"
            size="sm"
            _hover={{ bg: 'gray.50' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            Next
            <MdChevronRight style={{ marginLeft: '4px' }} />
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default ItemTable;