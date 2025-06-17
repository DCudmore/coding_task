// frontend/src/App.tsx
import { useState } from 'react'; // Import useState
import { Heading, Button, Flex, Box } from '@chakra-ui/react';

import ItemTable from '@/components/ItemTable';
import ItemForm from '@/components/ItemForm'; // Import the ItemForm
import { Toaster } from '@/components/toaster';
import type { Item } from './types'; // Import the Item type
function App() {
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null); // State to hold item being edited

  // Function to open the form for creating a new item
  const handleAddItem = () => {
    setItemToEdit(null); // Clear any item being edited
    setShowForm(true);
  };

  // Function to open the form for editing an existing item
  const handleEditItem = (item: Item) => {
    setItemToEdit(item); // Set the item to be edited
    setShowForm(true);
  };

  // Function to close the form and return to the table view
  const handleCloseForm = () => {
    setShowForm(false);
    setItemToEdit(null); // Clear itemToEdit when form closes
  };

  return (
    <Box width="100%" minH="100vh">
      <Box width="100%" maxWidth="100%" px={4} py={8}>
        <Box width="100%" mb={6}>
          <Flex 
            width="100%" 
            justifyContent="space-between" 
            alignItems="center"
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Heading 
              as="h1" 
              fontSize={{ base: "1.5rem", md: "2rem" }}
            >
              Item Management App
            </Heading>
            <Button
              variant="solid"
              bg="orange.500"
              color="white"
              _hover={{ bg: 'orange.600' }}
              size="md"
              onClick={handleAddItem}
              width={{ base: "100%", md: "auto" }}
            >
              Add New Item
            </Button>
          </Flex>
        </Box>

        {showForm ? (
          <Box width="100%" overflowX="auto">
            <ItemForm
              itemToEdit={itemToEdit}
              onClose={handleCloseForm}
            />
          </Box>
        ) : (
          <Box width="100%" overflowX="auto">
            <ItemTable onEdit={handleEditItem} />
          </Box>
        )}
        <Toaster />
      </Box>
    </Box>
  );
}

export default App;