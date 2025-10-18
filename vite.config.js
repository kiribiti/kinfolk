import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';
import { renameSync } from 'fs';

// Plugin to rename index.html to index.php after build
const renameIndexPlugin = () => {
    return {
        name: 'rename-index',
        closeBundle() {
            const htmlPath = resolve(__dirname, 'public/index.html');
            const phpPath = resolve(__dirname, 'public/index.php');
            try {
                renameSync(htmlPath, phpPath);
                console.log('✓ Renamed index.html to index.php');
            } catch (err) {
                console.error('Failed to rename index.html:', err);
            }
        }
    };
};

export default defineConfig({
    plugins: [react(), renameIndexPlugin()],
    publicDir: 'static',
    build: {
        outDir: 'public',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
        },
    },
});
