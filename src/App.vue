<template>
  <AppHeader></AppHeader>

  <RouterView></RouterView>

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
