import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: 'orange',
    },
    '#root': {
      width: '100%',
      minHeight: '100vh',
    },
  },
});

export const chakraSystem = createSystem(defaultConfig, config);
