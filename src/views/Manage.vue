<template>
  <!-- Main Content -->
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <AppUpload ref="upload" :addSong="addSong" />
      </div>
      <div class="col-span-2">
        <div class="bg-white rounded border border-gray-200 relative flex flex-col">
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">My Songs</span>
            <i class="fa fa-compact-disc float-right text-green-400 text-2xl"></i>
          </div>
          <div class="p-6">
            <!-- Composition item -->
            <CompositionItem
              v-for="(song, i) in songs"
              :key="song.docID"
              :song="song"
              :updateSong="updateSong"
              :removeSong="removeSong"
              :index="i"
              :updateUnsavedFlag="updateUnsavedFlag"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import AppUpload from '../components/Upload.vue'
import { songsCollection, auth } from '../plugins/firebase'
import { query, where, getDocs } from '@firebase/firestore'
import CompositionItem from '../components/CompositionItem.vue'

// Router Guards run in a specific order
export default {
  name: 'manage',
  components: {
    AppUpload,
    CompositionItem
  },
  data() {
    // putting the snapshot documents into the songs array
    return {
      songs: [],
      unsavedFlag: false
    }
  },
  // Quering
  async created() {
    try {
      if (auth.currentUser) {
        const q = query(songsCollection, where('uid', '==', auth.currentUser.uid))
        const snapshot = await getDocs(q)

        snapshot.forEach(this.addSong)
      }
    } catch (error) {
      console.error('Error in created hook:', error)
    }
  },
  methods: {
    updateSong(i, values) {
      // i stands for index
      this.songs[i].modified_name = values.modified_name
      this.songs[i].genre = values.genre
    },
    removeSong(i) {
      this.songs.splice(i, 1)
    },
    //updating the list of songs on the client side
    addSong(doc) {
      const song = { ...doc.data(), docID: doc.id }
      console.log('Fetched song:', song)
      this.songs.push(song)
    },
    updateUnsavedFlag(value) {
      this.unsavedFlag = value
    }
  },
  beforeRouteLeave(to, from, next) {
    if (!this.unsavedFlag) {
      next()
    } else {
      const leave = confirm('You have unsaved changes! Are you sure you want to leave ?')
      next(leave)
    }
  }
}
</script>
