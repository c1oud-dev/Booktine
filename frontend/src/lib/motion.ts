export const pageSpring = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.9,
} as const;

export const panelSpring = {
  type: 'spring',
  stiffness: 520,
  damping: 32,
  mass: 0.75,
} as const;

export const softSpring = {
  type: 'spring',
  stiffness: 360,
  damping: 30,
  mass: 0.8,
} as const;