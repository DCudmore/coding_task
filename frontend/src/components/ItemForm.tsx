import React, { useEffect } from 'react';
import {
    Box,
    Button,
    Input,
    Stack,
    Heading,
    Flex,
    Field,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useCreateItem, useUpdateItem } from '@/hooks/useItems';

import type { Item } from '../types';
import { ItemGroup } from '../types';

const itemFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    group: z.nativeEnum(ItemGroup, {
        errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
                return { message: "Please select a valid group." };
            }
            return { message: ctx.defaultError };
        },
    }),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
    itemToEdit?: Item | null;
    onClose: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ itemToEdit, onClose }) => {
    const createMutation = useCreateItem();
    const updateMutation = useUpdateItem();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ItemFormData>({
        resolver: zodResolver(itemFormSchema),
    });

    useEffect(() => {
        reset({
            name: itemToEdit?.name || '',
            group: itemToEdit?.group || ItemGroup.PRIMARY,
        });
    }, [itemToEdit, reset]);

    const onSubmit = async (data: ItemFormData) => {
        try {
            if (itemToEdit) {
                await updateMutation.mutateAsync({ id: itemToEdit.id, data });

            } else {
                await createMutation.mutateAsync(data);
            }
            onClose();
        } catch (error) {
            console.error(error)
        }
    };

    return (
        <Box p={6} borderWidth="1px" borderRadius="lg" shadow="md">
            <Heading as="h2" size="lg" mb={6}>
                {itemToEdit ? 'Edit Item' : 'Create New Item'}
            </Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="4">
                    <Field.Root invalid={!!errors.name}>
                        <Field.Label htmlFor="name">Name</Field.Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="Enter item name"
                        />
                        {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
                    </Field.Root>

                    <Field.Root invalid={!!errors.group}>
                        <Field.Label htmlFor="group">Group</Field.Label>
                        <select
                            id="group"
                            {...register('group')}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                border: '1px solid',
                                borderColor: errors.group ? 'red.500' : 'gray.200',
                            }}
                        >
                            <option value="">Select a group</option>
                            {Object.values(ItemGroup).map((group) => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>
                        {errors.group && <Field.ErrorText>{errors.group.message}</Field.ErrorText>}
                    </Field.Root>

                    <Flex justifyContent="flex-end">
                        <Button 
                        variant="outline"
                        bg="red.400"
                        color="white" 
                        _hover={{ bg: 'red.500' }}
                        mr={3} 
                        onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            bg="green.500"
                            color="white"
                            _hover={{ bg: 'green.600' }}
                            type="submit"
                            loading={createMutation.isPending || updateMutation.isPending}
                        >
                            {itemToEdit ? 'Save Changes' : 'Create Item'}
                        </Button>
                    </Flex>
                </Stack>
            </form>
        </Box>
    );
};

export default ItemForm;