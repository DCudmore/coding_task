import { toaster } from '@/components/toaster';

export const showErrorToast = (description: string, title = 'Error') =>
  toaster.create({
    title,
    description,
    type: 'error',
    duration: 3000,
    closable: true,
  });

export const showSuccessToast = (description: string, title = 'Success') =>
  toaster.create({
    title,
    description,
    type: 'success',
    duration: 3000,
    closable: true,
  });