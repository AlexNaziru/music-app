<template>
  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div
        class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"
      ></div>
      <div class="container mx-auto flex items-center" v-if="song && song.modified_name">
        <!-- Play/Pause Button -->
        <button
          @click.prevent="newSong(song)"
          type="button"
          class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
        >
          <i class="fas fa-play"></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
          <div class="song-price">{{ $n(1, 'currency', 'ro') }}</div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6" id="comments">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
          <!-- Comment Count -->
          <span class="card-title">{{
            $tc('song.comment_count', song.comment_count, { count: song.comment_count })
          }}</span>
          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
          <div
            class="text-white text-center font-bold p-4 mb-4"
            v-if="comment_show_alert"
            :class="comment_alert_variant"
          >
            {{ comment_alert_msg }}
          </div>
          <vee-form :validation-schema="schema" @submit="addComment" v-if="userLoggedIn">
            <vee-field
              as="textarea"
              name="comment"
              class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
              placeholder="Your comment here..."
            ></vee-field>
            <ErrorMessage class="text-red-600" name="comment" />
            <button
              type="submit"
              class="py-1.5 px-3 rounded text-white bg-green-600 block"
              :disabled="comment_in_submission"
            >
              Submit
            </button>
          </vee-form>
          <!-- Sort Comments -->
          <select
            v-model="sort"
            class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          >
            <option value="1">Latest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto">
      <li
        class="p-6 bg-gray-50 border border-gray-200"
        v-for="comment in sortedComments"
        :key="comment.docID"
      >
        <!-- Comment Author -->
        <div class="mb-5">
          <div class="font-bold">{{ comment.name }}</div>
          <time>{{ comment.datePosted }}</time>
        </div>

        <p>
          {{ comment.content }}
        </p>
      </li>
    </ul>
  </main>
</template>
<script>
import { songsCollection, auth, commentsCollection } from '../plugins/firebase'
import { doc, getDoc, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { mapState, mapActions } from 'pinia'
import { useUserStore } from '../stores/users'
import usePlayerStore from '../stores/player'

export default {
  name: 'Song',
  data() {
    return {
      song: {},
      schema: {
        comment: 'required|min:3'
      },
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_variant: 'bg-blue-500',
      comment_alert_msg: 'Please wait! Your comment is being submitted',
      comments: [],
      sort: '1' // 1 indicates sorting order should be latest to oldest
    }
  },
  computed: {
    ...mapState(useUserStore, ['userLoggedIn']),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        // objects in an array where we can make a comparison between them
        if (this.sort === '1') {
          return new Date(b.datePosted) - new Date(a.datePosted) // oldest to latest
        }
        return new Date(a.datePosted) - new Date(b.datePosted) // latest to oldest
      })
    }
  },
  async beforeRouteEnter(to, from, next) {
    const docSnapshot = await getDoc(doc(songsCollection, to.params.id))

    next((vm) => {
      if (!docSnapshot.exists) {
        vm.$router.push({ name: 'home' })
        return
      }
      // saving the sorting order
      const sortQuery = vm.$route.query.sort
      if (sortQuery === '1' || sortQuery === '2') {
        vm.sort = sortQuery
      }

      vm.song = docSnapshot.data()
      vm.getComments()
    })
  },
  methods: {
    ...mapActions(usePlayerStore, ['newSong']),

    async addComment(values, { resetForm }) {
      this.comment_in_submission = true
      this.comment_show_alert = true
      this.comment_alert_variant = 'bg-blue-500'
      this.comment_alert_msg = 'Please wait! Your comment is being submitted'

      const comment = {
        content: values.comment,
        datePosted: new Date().toString(),
        sid: this.$route.params.id,
        name: auth.currentUser.displayName,
        uid: auth.currentUser.uid
      }

      try {
        await addDoc(commentsCollection, comment)

        // Update the comment count in the existing song document
        const newCommentCount = this.song.comment_count + 1
        const songDocRef = doc(songsCollection, this.$route.params.id)
        await updateDoc(songDocRef, {
          comment_count: newCommentCount
        })
        // Update the local song object to reflect the new comment count
        this.song.comment_count = newCommentCount

        this.getComments()

        this.comment_alert_variant = 'bg-green-500'
        this.comment_alert_msg = 'Comment added'
      } catch (error) {
        console.error('Error adding comment!', error)

        this.comment_alert_variant = 'bg-red-500'
        this.comment_alert_msg = 'Error adding comment! Please try again!'
      }
      this.comment_in_submission = false

      resetForm()
    },
    async getComments() {
      const q = query(commentsCollection, where('sid', '==', this.$route.params.id))
      const snapshots = await getDocs(q)
      this.comments = []

      snapshots.forEach((doc) => {
        this.comments.push({
          docID: doc.id,
          ...doc.data()
        })
      })
    }
  },
  watch: {
    sort(newValue) {
      // this condition will prevent the watcher from updating the route if the query paramater already matches the sort value
      // Update the query parameter without reloading the page
      this.$router.replace({ query: { ...this.$route.query, sort: newValue } })
    }
  }
}
</script>
