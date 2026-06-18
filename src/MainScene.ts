import Phaser from 'phaser';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, PLAYER1_BASES, PLAYER2_BASES } from './config';
import { GameUI } from './GameUI';

export default class MainScene extends Phaser.Scene {
  private gameUI!: GameUI;
  private buildTiles: Phaser.GameObjects.Text[] = [];
  private currentPlayer: 1 | 2 = 1;
  private selectedShotTile: Phaser.GameObjects.Text | null = null;
  private selectedBlinkTween: Phaser.Tweens.Tween | null = null;
  private uiOffset = 80;

  constructor() {
    super('MainScene');
  }
  create() {
    this.cameras.main.setBackgroundColor('#f8f8f8');

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x555555, 0.6);

    // Draw grid
    for (let x = 0; x <= GRID_WIDTH; x++) {
      graphics.moveTo(x * CELL_SIZE, this.uiOffset);
      graphics.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE + this.uiOffset);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      graphics.moveTo(0, y * CELL_SIZE + this.uiOffset);
      graphics.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE + this.uiOffset);
    }
    graphics.strokePath();

    // Draw bases
    PLAYER1_BASES.forEach(pos => this.createBase(pos.x, pos.y, 0x0066ff, "X"));
    PLAYER2_BASES.forEach(pos => this.createBase(pos.x, pos.y, 0xff2222, "O"));

    this.gameUI = new GameUI(this);
    this.gameUI.create();
    this.gameUI.setCurrentPlayer(this.currentPlayer);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleGridClick(pointer));

    this.events.on('fireShot', () => this.executeShot());

    // === HOVER TEST - Shows coordinates when moving mouse ===
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const gridX = Math.floor(pointer.x / CELL_SIZE);
      const gridY = Math.floor((pointer.y - this.uiOffset) / CELL_SIZE);
      
      console.log(`Mouse at grid: (${gridX}, ${gridY})`);
    });
        // === CLEAR VISUAL HOVER EFFECT ===
    let hoverBorder: Phaser.GameObjects.Rectangle | null = null;

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.gameUI.getCurrentAction() !== 'shoot') {
        if (hoverBorder) hoverBorder.setVisible(false);
        return;
      }

      const gridX = Math.floor(pointer.x / CELL_SIZE);
      const gridY = Math.floor((pointer.y - this.uiOffset) / CELL_SIZE);

      if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
        if (hoverBorder) hoverBorder.setVisible(false);
        return;
      }

      const isMyTile = this.buildTiles.some(t => 
        Math.floor(t.x / CELL_SIZE) === gridX && 
        Math.floor((t.y - this.uiOffset) / CELL_SIZE) === gridY &&
        t.text === (this.currentPlayer === 1 ? "x" : "o")
      );

      const isConnected = isMyTile && this.isConnected(gridX, gridY, this.currentPlayer);

      if (!hoverBorder) {
        hoverBorder = this.add.rectangle(0, 0, CELL_SIZE, CELL_SIZE, 0x000000, 0)
          .setStrokeStyle(4, 0xffff00)
          .setOrigin(0.5)
          .setDepth(100);
      }

      hoverBorder.setPosition(
        gridX * CELL_SIZE + CELL_SIZE/2, 
        gridY * CELL_SIZE + CELL_SIZE/2 + this.uiOffset
      );
      
      hoverBorder.setStrokeStyle(4, isConnected ? 0x00ff00 : 0xffff00);
      hoverBorder.setVisible(true);
    });

    console.log("✅ Full game with build + shooting selection loaded");
  }

  private createBase(x: number, y: number, color: number, symbol: string) {
    this.add.rectangle(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2 + this.uiOffset, CELL_SIZE-4, CELL_SIZE-4, color);
    this.add.text(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2 + this.uiOffset, symbol, {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private handleGridClick(pointer: Phaser.Input.Pointer) {
    const gridX = Math.floor(pointer.x / CELL_SIZE);
    const gridY = Math.floor((pointer.y - this.uiOffset) / CELL_SIZE);

    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) return;

    if (this.gameUI.getCurrentAction() === 'build') {
      this.placeBuildTile(gridX, gridY);
    } else if (this.gameUI.getCurrentAction() === 'shoot') {
      const clickedTile = this.buildTiles.find(t => 
        Math.floor(t.x / CELL_SIZE) === gridX && Math.floor((t.y - this.uiOffset) / CELL_SIZE) === gridY
      );
      if (clickedTile) this.selectShotTile(clickedTile);
    }
  }

  private placeBuildTile(gridX: number, gridY: number) {
    const isOccupied = this.buildTiles.some(t => 
      Math.floor(t.x / CELL_SIZE) === gridX && Math.floor((t.y - this.uiOffset) / CELL_SIZE) === gridY
    );
    if (isOccupied) return;

    const color = this.currentPlayer === 1 ? '#4488ff' : '#ff6666';
    const symbol = this.currentPlayer === 1 ? "x" : "o";

    const text = this.add.text(
      gridX * CELL_SIZE + CELL_SIZE / 2,
      gridY * CELL_SIZE + CELL_SIZE / 2 + this.uiOffset,
      symbol,
      { fontSize: '18px', color: color, fontStyle: 'bold' }
    ).setOrigin(0.5);

    this.buildTiles.push(text);

    if (this.gameUI.incrementBuildCount()) {
      this.switchPlayer();
    }
  }
private selectShotTile(tile: Phaser.GameObjects.Text) {
  const gridX = Math.floor(tile.x / CELL_SIZE);
  const gridY = Math.floor((tile.y - this.uiOffset) / CELL_SIZE);

  console.log(`[Select] Trying tile (${gridX},${gridY})`);

  if (!this.isConnected(gridX, gridY, this.currentPlayer)) {
    console.log("❌ Not connected");
    return;
  }else {     console.log("✅ Connected");  }


  // Clear previous selection
  if (this.selectedBlinkTween) {
    this.selectedBlinkTween.stop();
  }

  this.selectedShotTile = tile;

  this.selectedBlinkTween = this.tweens.add({
    targets: tile,
    alpha: 0.25,
    duration: 250,
    yoyo: true,
    repeat: -1
  });

  console.log("✅ Tile successfully selected and blinking");
}

private executeShot() {
  if (!this.selectedShotTile) return;

  // // Clear previous feedback
  // if (this.lastFeedback) {
  //   this.lastFeedback.destroy();
  //   this.lastFeedback = null;
  // }

  const dice = Phaser.Math.Between(1, 6);
  console.log(`🎲 Player ${this.currentPlayer} rolled ${dice}`);

  const shooterX = Math.floor(this.selectedShotTile.x / CELL_SIZE);
  const shooterY = Math.floor((this.selectedShotTile.y - this.uiOffset) / CELL_SIZE);

  let hits = 0;

  for (let dx = -dice; dx <= dice; dx++) {
    for (let dy = -dice; dy <= dice; dy++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== dice) continue;

      const targetX = shooterX + dx;
      const targetY = shooterY + dy;

      if (targetX < 0 || targetX >= GRID_WIDTH || targetY < 0 || targetY >= GRID_HEIGHT) continue;

      // Find enemy build tile
      const buildTileIndex = this.buildTiles.findIndex(tile => {
        const tx = Math.floor(tile.x / CELL_SIZE);
        const ty = Math.floor((tile.y - this.uiOffset) / CELL_SIZE);
        return tx === targetX && ty === targetY && 
               ((this.currentPlayer === 1 && tile.text === "o") || 
                (this.currentPlayer === 2 && tile.text === "x"));
      });

      if (buildTileIndex !== -1) {
        const tile = this.buildTiles[buildTileIndex];
        this.highlightAndDestroy(tile);
        this.buildTiles.splice(buildTileIndex, 1);
        hits++;
        continue;
      }

      // Check enemy base
      const isEnemyBase = (this.currentPlayer === 1 && PLAYER2_BASES.some(b => b.x === targetX && b.y === targetY)) ||
                          (this.currentPlayer === 2 && PLAYER1_BASES.some(b => b.x === targetX && b.y === targetY));

      if (isEnemyBase) {
        const baseObjects = this.children.getAll().filter(child => 
          child instanceof Phaser.GameObjects.Rectangle &&
          Math.floor(child.x / CELL_SIZE) === targetX &&
          Math.floor((child.y - this.uiOffset) / CELL_SIZE) === targetY
        );

        baseObjects.forEach(base => this.highlightAndDestroy(base));
        hits++;
        // Clear selection if the selected tile was destroyed
if (this.selectedShotTile && !this.selectedShotTile.active) {
  if (this.selectedBlinkTween) this.selectedBlinkTween.stop();
  this.selectedShotTile = null;
}
      }
    }
  }

  const resultText = hits > 0 ? `HIT! ${hits} destroyed` : "Miss...";
  const color = hits > 0 ? '#00ff00' : '#ff6666';

  this.lastFeedback = this.add.text(400, 150, `Rolled: ${dice} → ${resultText}`, {
    fontSize: '32px', color: color, fontStyle: 'bold'
  }).setOrigin(0.5).setScrollFactor(0);

  if (this.selectedBlinkTween) this.selectedBlinkTween.stop();
  this.selectedShotTile = null;
// Clear selection if the selected tile was destroyed
if (this.selectedShotTile && !this.selectedShotTile.active) {
  if (this.selectedBlinkTween) this.selectedBlinkTween.stop();
  this.selectedShotTile = null;
}
  if (hits === 0) {
    this.switchPlayer();
  }
}






private highlightAndDestroy(target: Phaser.GameObjects.GameObject) {
  if (!target) return;

  // Longer flash for development
  this.tweens.add({
    targets: target,
    scaleX: 1.8,
    scaleY: 1.8,
    tint: 0xff0000,
    duration: 280,           // longer flash
    yoyo: true,
    repeat: 1,               // flash twice
    onComplete: () => {
      target.destroy();
    }
  });
}
  private switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.gameUI.setCurrentPlayer(this.currentPlayer);
  }
  private isConnected(startX: number, startY: number, player: 1 | 2): boolean {
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

      // Check 8 neighbors
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          const nx = cx + dx;
          const ny = cy + dy;

          if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) continue;

          // Is our tile?
          const isOurTile = this.buildTiles.some(t =>
            Math.floor(t.x / CELL_SIZE) === nx &&
            Math.floor((t.y - this.uiOffset) / CELL_SIZE) === ny &&
            t.text === symbol
          );

          if (isOurTile) {
            if (bases.some(b => b.x === nx && b.y === ny)) {
              console.log("CONNECTED ");

              return true;
            }
            queue.push([nx, ny]);
          }
        }
      }
    }
    console.log("❌ No connection found");
    return false;
  }


}