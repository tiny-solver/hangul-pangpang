import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// get git HEAD`s short sha and set it as VITE_GIT_SHA
import { execSync } from 'child_process'

// if not in docker, use local git sha
try {
  if (process.env.SHORT_SHA) {
    process.env.VITE_GIT_SHA = process.env.SHORT_SHA
    console.log(`VITE_GIT_SHA: ${process.env.SHORT_SHA}`)
  } else {
    const gitSha = execSync('git rev-parse --short HEAD').toString().trim()
    process.env.VITE_GIT_SHA = gitSha + '-local'
    console.log(`VITE_GIT_SHA: ${gitSha}`)
  }
} catch(error) {
  process.env.VITE_GIT_SHA = "undefined"
  console.error(`Error getting git sha: ${error}`)
}

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/timecapsule/',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
