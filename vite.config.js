import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite'

const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    define: {
      __APP_ENV__: env.APP_ENV
    },
    root,
    build:{
      outDir,
      emptyOutDir: true,
      rollupOptions:{
        input:{
          main: resolve(root, 'index.html'),
          dashboard: resolve(root, 'dashboard', 'index.html'),
          login: resolve(root, 'login', 'index.html'),

        }
      }
    }
  }
})
