import { defineStore } from 'pinia'
import { Howl, Howler } from 'howler'

// 'player' is an id
export default defineStore('player', {
  state: () => ({
    current_song: {},
    sound: null
  }),
  actions: {
    async newSong(song) {
      this.current_song = song

      if (this.sound) {
        this.sound.unload() // Unload the previous sound if any
      }

      this.sound = new Howl({
        src: [song.url],
        html5: true
      })
      this.sound.play()
    },

    async toggleAudio() {
      if (this.sound) {
        if (this.sound.playing()) {
          this.sound.pause()
        } else {
          this.sound.play()
        }
      }
    }
  },
  getters: {
    playing: (state) => {
      return state.sound ? state.sound.playing() : false
    }
  }
})
