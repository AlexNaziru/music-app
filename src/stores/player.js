import { defineStore } from 'pinia'
import { Howl, Howler } from 'howler'
import helper from '../plugins/helper'

// 'player' is an id
export default defineStore('player', {
  state: () => ({
    current_song: {},
    sound: null,
    seek: '00:00',
    duration: '00:00',
    playerProgress: '0%'
  }),
  actions: {
    async newSong(song) {
      if (this.sound instanceof Howl) {
        this.sound.unload()
      }
      this.current_song = song

      if (this.sound) {
        this.sound.unload() // Unload the previous sound if any
      }

      this.sound = new Howl({
        src: [song.url],
        html5: true
      })
      this.sound.play()
      this.sound.on('play', () => {
        requestAnimationFrame(this.progress)
      })
    },

    async toggleAudio() {
      if (this.sound) {
        if (this.sound.playing()) {
          this.sound.pause()
        } else {
          this.sound.play()
        }
      }
    },
    progress() {
      this.seek = helper.formatTime(this.sound.seek())
      this.duration = helper.formatTime(this.sound.duration())
      this.playerProgress = `${(this.sound.seek() / this.sound.duration()) * 100}%`

      if (this.sound.playing()) {
        requestAnimationFrame(this.progress)
      }
    },
    updateSeek(event) {
      // this allows when you click on the progress music ball, to move it where you want
      if (!this.sound.playing) {
        return
      }
      const { x, width } = event.currentTarget.getBoundingClientRect()
      const clickX = event.clientX - x
      const percentage = clickX / width
      const seconds = this.sound.duration() * percentage

      this.sound.seek(seconds)
      this.sound.once('seek', this.progress)
    }
  },
  getters: {
    playing: (state) => {
      return state.sound ? state.sound.playing() : false
    }
  }
})
