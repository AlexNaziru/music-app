import { defineStore } from 'pinia'
import { auth, db } from '../plugins/firebase'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
// This tracks user auth inside the store. When he is registerd and logged in, Logout will pop up
export const useUserStore = defineStore('user', {
  state: () => ({
    userLoggedIn: false
  }),
  actions: {
    // This will auth the user both in the firestore auth and database
    async register(values) {
      const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password)

      const newDocument = doc(db, 'users', userCred.user.uid)

      await setDoc(newDocument, {
        name: values.name,
        email: values.email,
        age: values.age,
        country: values.country
      })

      await updateProfile(userCred.user, {
        // matching the user id with the user db
        displayName: values.name
      })

      this.userLoggedIn = true
    },
    async authenticate(values) {
      await signInWithEmailAndPassword(auth, values.email, values.password)

      this.userLoggedIn = true
    },
    async signOut() {
      await auth.signOut() // Firebase method

      this.userLoggedIn = false // Updating the state
    }
  }
})
