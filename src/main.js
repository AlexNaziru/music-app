import './assets/base.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './plugins/validation'
import { auth } from './plugins/firebase'
import Icon from './directives/icon'

// this will automatically log in a user if he is registered and logged in.
// if we didn't do this, each time we refresh the page, he will have to log again

let app

auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App)

    app.use(createPinia())
    app.use(router)
    app.use(VeeValidatePlugin)
    app.directive('icon', Icon)

    app.mount('#app')
  }
})
