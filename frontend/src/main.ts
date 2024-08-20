// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Particles from '@tsparticles/vue3'
import { loadFireworksPreset } from "@tsparticles/preset-fireworks"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.

import './index.css'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Particles, {
  init: async engine => {
    // await loadFull(engine);
    await loadFireworksPreset(engine);
  }
})

app.mount('#app')
