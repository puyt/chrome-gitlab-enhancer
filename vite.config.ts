import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag === 'gl-emoji',
                },
            },
        }),
    ],
    resolve: {
        alias: [
            {
                find: '@',
                replacement: '@',
            },
        ],
        dedupe: [
            'vue',
            'pinia',
        ],
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
                main: './src/main.ts',
                popup: './src/popup/popup.ts',
            },
            output: {
                entryFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
                chunkFileNames: `assets/[name].js`,
            },
        },
    },
});
