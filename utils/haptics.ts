"use client"

// Haptic feedback utility for mobile devices
export const hapticFeedback = {
  // Light tap feedback
  tap: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10)
    }
  },

  // Selection feedback (slightly stronger)
  selection: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(20)
    }
  },

  // Press feedback (stronger)
  press: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([30, 10, 30])
    }
  },

  // Error feedback
  error: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  },

  // Success feedback
  success: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([50, 25, 50, 25, 50])
    }
  },

  // Sheet close feedback
  sheetClose: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15)
    }
  },
}
