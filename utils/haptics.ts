// Haptic feedback utility for mobile devices
export const hapticFeedback = {
  // Check if device supports haptic feedback
  isSupported: () => {
    return (
      typeof window !== "undefined" &&
      "navigator" in window &&
      ("vibrate" in navigator || "hapticFeedback" in navigator)
    )
  },

  // Check if device is mobile
  isMobile: () => {
    return (
      typeof window !== "undefined" &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )
  },

  // Light tap feedback
  tap: () => {
    if (hapticFeedback.isSupported() && hapticFeedback.isMobile()) {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate(25)
        }
      } catch (error) {
        // Silently fail if haptic feedback is not available
      }
    }
  },

  // Medium press feedback
  press: () => {
    if (hapticFeedback.isSupported() && hapticFeedback.isMobile()) {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate(50)
        }
      } catch (error) {
        // Silently fail if haptic feedback is not available
      }
    }
  },

  // Selection feedback (for toggles, checkboxes)
  selection: () => {
    if (hapticFeedback.isSupported() && hapticFeedback.isMobile()) {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate([25, 25])
        }
      } catch (error) {
        // Silently fail if haptic feedback is not available
      }
    }
  },

  // Impact feedback (for errors, deletions)
  impact: () => {
    if (hapticFeedback.isSupported() && hapticFeedback.isMobile()) {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate([50, 25, 50])
        }
      } catch (error) {
        // Silently fail if haptic feedback is not available
      }
    }
  },

  // Success feedback (for confirmations)
  success: () => {
    if (hapticFeedback.isSupported() && hapticFeedback.isMobile()) {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate([100, 50, 100, 50, 100])
        }
      } catch (error) {
        // Silently fail if haptic feedback is not available
      }
    }
  },

  // Sheet open feedback
  sheetOpen: () => {
    if (hapticFeedback.isSupported() && hapticFeedback.isMobile()) {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate(50)
        }
      } catch (error) {
        // Silently fail if haptic feedback is not available
      }
    }
  },

  // Sheet close feedback
  sheetClose: () => {
    if (hapticFeedback.isSupported() && hapticFeedback.isMobile()) {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate(25)
        }
      } catch (error) {
        // Silently fail if haptic feedback is not available
      }
    }
  },
}
