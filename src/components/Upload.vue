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
import { storage } from '../plugins/firebase'
import { ref, uploadBytesResumable } from 'firebase/storage'

export default {
  name: 'Upload',
  data() {
    return {
      is_dragover: false,
      uploads: []
    }
  },
  methods: {
    upload($event) {
      // Uploading to firebase
      this.is_dragover = false
      const files = [...$event.dataTransfer.files] // Converting an object into an array or Converting FileList to Array

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
            variant: 'bg-green-400',
            icon: 'fas fa-spinner fa-spin',
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
            // Handle unsuccessful uploads
            console.error('Upload failed', error)
          },
          () => {
            // Handle successful uploads on complete
            console.log('Upload is complete!')
          }
        )
      })
    }
  }
}
</script>
