export const EASE_OUT = [0.23, 1, 0.32, 1];

export const TRANSITIONS = {
  SPRING: { type: 'spring', stiffness: 300, damping: 30 },
  EASE_OUT: { duration: 0.3, ease: EASE_OUT },
  EASE_IN_OUT: { duration: 0.3, ease: 'easeInOut' },
  FAST: { duration: 0.15 },
  NORMAL: { duration: 0.2 },
  SLOW: { duration: 0.4, ease: EASE_OUT },
};

export const REDUCED_TRANSITIONS = {
  SPRING: { duration: 0.01 },
  EASE_OUT: { duration: 0.01 },
  EASE_IN_OUT: { duration: 0.01 },
  FAST: { duration: 0.01 },
  NORMAL: { duration: 0.01 },
  SLOW: { duration: 0.01 },
};

export const VARIANTS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  FADE_UP: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

export const REDUCED_VARIANTS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  FADE_UP: {
    initial: { opacity: 0, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 1 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1 },
  },
};
