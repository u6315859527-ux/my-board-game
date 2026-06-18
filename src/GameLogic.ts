import { GRID_WIDTH, GRID_HEIGHT, PLAYER1_BASES, PLAYER2_BASES,CELL_SIZE } from './config';

export class GameLogic {
  static isConnected(
    buildTiles: Phaser.GameObjects.Text[],
    uiOffset: number,
    startX: number,
    startY: number,
    player: 1 | 2
  ): boolean {
    const symbol = player === 1 ? "x" : "o";
    const bases = player === 1 ? PLAYER1_BASES : PLAYER2_BASES;

    if (bases.some(b => b.x === startX && b.y === startY)) return true;

    const visited = new Set<string>();
    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;

      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          const nx = cx + dx;
          const ny = cy + dy;

          if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) continue;

          if (bases.some(b => b.x === nx && b.y === ny)) return true;

          const neighbor = buildTiles.find(t => 
            Math.floor(t.x / CELL_SIZE) === nx && 
            Math.floor((t.y - uiOffset) / CELL_SIZE) === ny &&
            t.text === symbol
          );

          if (neighbor) {
            queue.push([nx, ny]);
          }
        }
      }
    }
    return false;
  }
}