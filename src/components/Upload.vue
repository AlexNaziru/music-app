<template>
  <div class="bg-white rounded border border-gray-200 relative flex flex-col">
    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
      <span class="card-title">Upload</span>
      <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
    </div>
    <div class="p-6">
      <!-- Upload Dropbox -->
      <div
        class="w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid"
        :class="{ 'bg-green-400 border-green-400 border-solid': is_dragover }"
        @drag.prevent.stop=""
        @dragstart.prevent.stop=""
        @dragend.prevent.stop="is_dragover = false"
        @dragover.prevent.stop="is_dragover = true"
        @dragenter.prevent.stop="is_dragover = true"
        @dragleave.prevent.stop="is_dragover = false"
        @drop.prevent.stop="upload($event)"
      >
        <h5>Drop your files here</h5>
      </div>
      <input type="file" multiple @change="upload($event)" />
      <hr class="my-6" />
      <!-- Progess Bars -->
      <div class="mb-4" v-for="upload in uploads" :key="upload.name">
        <!-- File Name -->
        <div class="font-bold text-sm" :class="upload.text_class">
          <i :class="upload.icon"></i> {{ upload.name }}
        </div>
        <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
          <!-- Inner Progress Bar -->
          <div
            class="transition-all progress-bar"
            :class="upload.variant"
            :style="{ width: upload.current_progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storage, auth, songsCollection } from '../plugins/firebase'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { addDoc, setDoc, getDoc, doc } from 'firebase/firestore'

export default {
  name: 'Upload',
  data() {
    return {
      is_dragover: false,
      uploads: []
    }
  },
  props: ['addSong'],
  methods: {
    upload($event) {
      // Uploading to firebase
      this.is_dragover = false

      const files = $event.dataTransfer // this is so the upload button works
        ? [...$event.dataTransfer.files] // Converting an object into an array or Converting FileList to Array
        : [...$event.target.files] // the spread operator

      files.forEach((file) => {
        if (file.type !== 'audio/mpeg') {
          console.error('File format not supported')
          return
        }

        // Create a storage reference from our storage service
        const storageReference = ref(storage, `songs/${file.name}`)

        // Start the upload
        const uploadTask = uploadBytesResumable(storageReference, file)

        // Add to uploads array for progress tracking
        const uploadIndex =
          this.uploads.push({
            name: file.name,
            current_progress: 0,
            variant: 'bg-blue-500',
            icon: 'fas fa-spinn er fa-spin',
            text_class: ''
          }) - 1 //the object is inserted as the last item in the array. We subtract 1 to get the last item in the array

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            this.uploads[uploadIndex].current_progress = progress
            console.log('Upload is ' + progress + '% done')
          },
          (error) => {
            this.uploads[uploadIndex].variant = 'bg-red-400'
            this.uploads[uploadIndex].icon = 'fas fa-times'
            this.uploads[uploadIndex].text_class = 'text-red-400'
            // Handle unsuccessful uploads
            console.error('Upload failed', error)
          },
          async () => {
            // Handle successful uploads on complete
            try {
              const downloadURL = await getDownloadURL(storageReference) // Correct usage of getDownloadURL
              const song = {
                uid: auth.currentUser.uid,
                display_name: auth.currentUser.displayName,
                original_name: uploadTask.snapshot.ref.name,
                modified_name: uploadTask.snapshot.ref.name,
                genre: '',
                comment_count: 0,
                url: downloadURL
              }
              // storing the id of a user that uploaded

              // Add song metadata to Firestore
              const songRef = doc(songsCollection)
              await setDoc(songRef, song)
              const songSnapshot = await getDoc(songRef)
              this.addSong(songSnapshot)

              this.uploads[uploadIndex].variant = 'bg-green-500'
              this.uploads[uploadIndex].icon = 'fas fa-check'
              this.uploads[uploadIndex].text_class = 'text-green-500'
              // Handle successful uploads on complete
              console.log('Upload is complete!')
            } catch (error) {
              console.error('Error getting download URL', error)
            }
          }
        )
      })
    },
    // another method of cancelling uploads
    cencelUploads() {
      this.uploads.forEach((upload) => {
        upload.task.cancel()
      })
    }
  },
  // Cancelling uploads
  beforeMount() {
    this.uploads.forEach((upload) => {
      upload.task.cancel()
    })
  }
}
</script>
