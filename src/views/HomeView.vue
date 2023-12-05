<template>
  <main>
    <!-- Introduction -->
    <section class="mb-8 py-20 text-white text-center relative">
      <div
        class="absolute inset-0 w-full h-full bg-contain introduction-bg"
        style="background-image: url(assets/img/header.png)"
      ></div>
      <div class="container mx-auto">
        <div class="text-white main-header-content">
          <h1 class="font-bold text-5xl mb-5">Listen to Great Music!</h1>
          <p class="w-full md:w-8/12 mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus et dolor mollis,
            congue augue non, venenatis elit. Nunc justo eros, suscipit ac aliquet imperdiet,
            venenatis et sapien. Duis sed magna pulvinar, fringilla lorem eget, ullamcorper urna.
          </p>
        </div>
      </div>

      <img
        class="relative block mx-auto mt-5 -mb-20 w-auto max-w-full"
        src="/assets/img/introduction-music.png"
      />
    </section>

    <!-- Main Content -->
    <section class="container mx-auto">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div
          class="px-6 pt-6 pb-5 font-bold border-b border-gray-200"
          v-icon-secondary="{ icon: 'headphones-alt', right: true }"
        >
          <span class="card-title">Songs</span>
          <!-- Icon -->
        </div>
        <!-- Playlist -->
        <ol id="playlist">
          <SongItem v-for="song in songs" :key="song.docID" :song="song" />
        </ol>
        <!-- .. end Playlist -->
      </div>
    </section>
  </main>
</template>

<script>
import { songsCollection } from '../plugins/firebase'
import { query, doc, getDoc, getDocs, limit, startAfter, orderBy } from 'firebase/firestore'
import SongItem from '../components/SongItem.vue'
import iconSecondary from '../directives/iconSecondary'

export default {
  name: 'Home',
  components: {
    SongItem
  },
  directives: {
    'icon-secondary': iconSecondary
  },
  data() {
    return {
      songs: [],
      maxPerPage: 3
    }
  },
  // infinit page
  async created() {
    this.getSongs()

    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    // if the user navigates to a different page
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    // this method will add an infinit page with all the songs uploaded
    async getSongs() {
      let q
      if (this.songs.length > 0) {
        const lastDocSnap = await getDoc(
          doc(songsCollection, this.songs[this.songs.length - 1].docID)
        )
        q = query(
          songsCollection,
          orderBy('modified_name'),
          startAfter(lastDocSnap),
          limit(this.maxPerPage)
        )
      } else {
        q = query(songsCollection, orderBy('modified_name'), limit(this.maxPerPage))
      }
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        this.songs.push({
          docID: doc.id,
          ...doc.data()
        })
      })
    }
  }
}
</script>
