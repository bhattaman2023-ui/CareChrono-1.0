import type { Variants } from "framer-motion"

/* ───────────────────────────────────────────────
   PAGE TRANSITIONS
─────────────────────────────────────────────── */
export const pageFade: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.50, ease: [0.22, 1, 0.36, 1] },
  },
}

export const pageSlideUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ───────────────────────────────────────────────
   SECTION REVEALS
─────────────────────────────────────────────── */
export const sectionReveal: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
}

export const sectionRevealLeft: Variants = {
  hidden:  { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1] },
  },
}

export const sectionRevealRight: Variants = {
  hidden:  { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.60, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ───────────────────────────────────────────────
   STAGGER CONTAINERS
─────────────────────────────────────────────── */
export const staggerChildren: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren:   0.08,
    },
  },
}

export const staggerFast: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren:   0.05,
    },
  },
}

export const staggerSlow: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren:   0.10,
    },
  },
}

/* ───────────────────────────────────────────────
   CARD ANIMATIONS
─────────────────────────────────────────────── */
export const cardReveal: Variants = {
  hidden:  { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
}

export const cardRevealLeft: Variants = {
  hidden:  { opacity: 0, x: -20, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
}

export const softPop: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ───────────────────────────────────────────────
   LIST ITEMS
─────────────────────────────────────────────── */
export const listItem: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
}

export const listItemUp: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ───────────────────────────────────────────────
   TIMELINE
─────────────────────────────────────────────── */
export const timelineNodeReveal: Variants = {
  hidden:  { opacity: 0, scale: 0, x: -12 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.48, ease: [0.34, 1.56, 0.64, 1] },
  },
}

export const timelineLineGrow: Variants = {
  hidden:  { scaleY: 0, originY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ───────────────────────────────────────────────
   CHAT
─────────────────────────────────────────────── */
export const chatSlideUp: Variants = {
  hidden:  { opacity: 0, y: 24, scale: 0.96, transformOrigin: "bottom right" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.95,
    transition: { duration: 0.28, ease: [0.36, 0, 0.66, -0.56] },
  },
}

export const chatMessage: Variants = {
  hidden:  { opacity: 0, y: 10, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ───────────────────────────────────────────────
   COUNTER / NUMBER POP
─────────────────────────────────────────────── */
export const counterReveal: Variants = {
  hidden:  { opacity: 0, scale: 0.7, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.56, ease: [0.34, 1.56, 0.64, 1] },
  },
}

/* ───────────────────────────────────────────────
   FLOAT (looping)
─────────────────────────────────────────────── */
export const floatY = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
}

/* ───────────────────────────────────────────────
   HERO WORD REVEAL
─────────────────────────────────────────────── */
export const heroWord: Variants = {
  hidden:  { opacity: 0, y: 30, rotateX: -20 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ───────────────────────────────────────────────
   BADGE / CHIP
─────────────────────────────────────────────── */
export const badgeReveal: Variants = {
  hidden:  { opacity: 0, scale: 0.75, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.40, ease: [0.34, 1.56, 0.64, 1] },
  },
}

/* ───────────────────────────────────────────────
   MODAL
─────────────────────────────────────────────── */
export const modalReveal: Variants = {
  hidden:  { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.40, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.25, ease: "easeIn" },
  },
}
