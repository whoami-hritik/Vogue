import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Polyfill Node.js globals (Buffer, process, stream, etc.) for Midnight SDK
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'util', 'events'],
      globals: { Buffer: true, process: true, global: true },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Allow src/lib files to import compiled contract JS from contracts/
      '../../contracts': path.resolve(__dirname, './contracts'),
    },
  },
  optimizeDeps: {
    include: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/compact-js',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-network-id',
    ],
    // ledger-v8 and dapp-connector-api may ship WASM — exclude from pre-bundle
    exclude: ['@midnight-ntwrk/ledger-v8', '@midnight-ntwrk/dapp-connector-api'],
  },
  test: {
    globals: true,
    environment: 'node',
  },
} as any);
