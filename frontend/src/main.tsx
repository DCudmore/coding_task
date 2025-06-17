// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "orange", // choose a palette: blue, green, red, etc.
    },
    "#root": {
      width: "100%",
      minHeight: "100vh",
    },
  },
})
const system = createSystem(defaultConfig, config)


// Remove the `extendTheme` line. We're directly importing `theme`.
// const theme = extendTheme({}); // DELETE THIS LINE

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});

// const theme = extendTheme(
//   withDefaultColorScheme({ colorScheme: 'blue' })
// )

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider value={system}> {/* PASS THE IMPORTED 'theme' PROP HERE */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>,
);