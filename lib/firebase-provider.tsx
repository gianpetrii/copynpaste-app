"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { logEvent, getAnalytics } from "firebase/analytics"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signUp: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      if (typeof window !== "undefined") {
        const analytics = getAnalytics();
        logEvent(analytics, "login", {
          method: "google",
        })
      }
      return undefined;
    } catch (error) {
      console.error("Error during sign in:", error)
      throw error
    }
  }

  // For this app, signUp is the same as signIn since we're using Google auth
  const signUp = async () => {
    await signIn()
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      if (typeof window !== "undefined") {
        const analytics = getAnalytics();
        logEvent(analytics, "logout")
      }
    } catch (error) {
      console.error("Error during sign out:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within a FirebaseProvider")
  }
  return context
}

