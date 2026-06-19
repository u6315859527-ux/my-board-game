// src/config.ts

export const GRID_WIDTH = 30;
export const GRID_HEIGHT = 30;
export const CELL_SIZE = 24;

// === Easy customization area ===
export const NUM_BASES = 4;
export const BASE_CLUSTER_SPREAD = 6;     // minimum distance between enemy bases

const offsetY = 9;
const centerX = Math.floor(GRID_WIDTH / 2) - 1;

// Player 1 bases (top)
export const PLAYER1_BASES = [
  // { x: centerX - 1, y: offsetY },
  // { x: centerX,     y: offsetY },
  // { x: centerX + 1, y: offsetY },
  { x: centerX,     y: offsetY + 1 }
];

// Player 2 bases (bottom) - mirrored
export const PLAYER2_BASES = [
  // { x: centerX - 1, y: GRID_HEIGHT - offsetY - 1 },
  // { x: centerX,     y: GRID_HEIGHT - offsetY - 1 },
  // { x: centerX + 1, y: GRID_HEIGHT - offsetY - 1 },
  { x: centerX,     y: GRID_HEIGHT - offsetY - 2 }
];