<template>
  <AppHeader></AppHeader>

  <RouterView v-slot="{ Component }">
    <transition name="fade">
      <component :is="Component"></component
      ><!-- you can use loading component dynamically -->
    </transition>
  </RouterView>

  <AppPlayer></AppPlayer>

  <AppAuth></AppAuth>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppAuth from './components/AppAuth.vue'
import { mapWritableState } from 'pinia'
import { useUserStore } from './stores/users'
import { auth } from './plugins/firebase'
import AppPlayer from './components/Player.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppAuth,
    AppPlayer
  },
  computed: {
    ...mapWritableState(useUserStore, ['userLoggedIn'])
  },
  created() {
    if (auth.currentUser) {
      this.userLoggedIn = true
    }
  }
}
</script>

<style>
.fade-enter-from {
  opacity: 0;
}
.fade-enter-active {
  transition: all 0.5s linear;
}
.fade-leave-to {
  transition: all 0.5s linear;
  opacity: 0;
}
</style>
