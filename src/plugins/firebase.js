// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth' // Auth service
import { getFirestore, collection } from 'firebase/firestore' // Database package in firebase
import { getStorage } from 'firebase/storage' // Storage for music mp3

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAUgVz1azPqXrDEh_O6FpfLHk8q_nA8Xsg',
  authDomain: 'music-6d5d2.firebaseapp.com',
  projectId: 'music-6d5d2',
  storageBucket: 'music-6d5d2.appspot.com',
  messagingSenderId: '477821786224', // This is a notification between apps (you can remove it if you want to)
  appId: '1:477821786224:web:1d244caccee4115fd23cb5'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const auth = getAuth()
const db = getFirestore()

const usersCollection = collection(db, 'users')
const songsCollection = collection(db, 'songs')

// export as named exports
export { auth, db, usersCollection, songsCollection }
export const storage = getStorage(app)
