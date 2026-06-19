import Phaser from 'phaser';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, PLAYER1_BASES, PLAYER2_BASES } from './config';
import { GameUI } from './GameUI';
import { GameLogic } from './GameLogic';

export default class MainScene extends Phaser.Scene {
  private gameUI!: GameUI;
  private buildTiles: Phaser.GameObjects.Text[] = [];
  private currentPlayer: 1 | 2 = 1;
  private selectedShotTile: Phaser.GameObjects.Text | null = null;
  private selectedBlinkTween: Phaser.Tweens.Tween | null = null;
  private lastFeedback: Phaser.GameObjects.Text | null = null;
  private uiOffset = 80;

  constructor() {
    super('MainScene');
  }

  create() {
    // Listen for clearing shot selection when switching to Build
    // === HOVER HIGHLIGHTING FOR SHOOT MODE ===
this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
  if (this.gameUI.getCurrentAction() !== 'shoot') return;

  const gridX = Math.floor(pointer.x / CELL_SIZE);
  const gridY = Math.floor((pointer.y - this.uiOffset) / CELL_SIZE);

  if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) return;

  const hoveredTile = this.buildTiles.find(t => 
    Math.floor(t.x / CELL_SIZE) === gridX && 
    Math.floor((t.y - this.uiOffset) / CELL_SIZE) === gridY
  );

  if (hoveredTile) {
const isConn = GameLogic.isConnected(this.buildTiles, this.uiOffset, gridX, gridY, this.currentPlayer);
    if (isConn) {
      hoveredTile.setTint(0x00ff88);     // Nice bright green
      hoveredTile.setScale(1.2);         // Slightly bigger
      hoveredTile.setStyle({ fontStyle: 'bold' });
    } else {
      hoveredTile.setTint(0xff6666);     // Soft red for not connected
    }
  }
});

// Clear hover effects
this.input.on('pointerout', () => {
  this.buildTiles.forEach(tile => {
    tile.clearTint();
    tile.setScale(1);
    tile.setStyle({ fontStyle: 'bold' });
  });
});
this.events.on('clearShotSelection', () => {
  if (this.selectedBlinkTween) {
    this.selectedBlinkTween.stop();
    this.selectedBlinkTween = null;
  }
  this.selectedShotTile = null;
});
// Hover highlighting for shoot mode
// Hover highlighting - safe version
// Hover effect - Shoot mode
this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
  if (this.gameUI.getCurrentAction() !== 'shoot') return;

  // Reset all tiles
  this.buildTiles.forEach(t => {
    t.clearTint();
    t.setScale(1);
  });

  const gridX = Math.floor(pointer.x / CELL_SIZE);
  const gridY = Math.floor((pointer.y - this.uiOffset) / CELL_SIZE);

  const hoveredTile = this.buildTiles.find(t => 
    Math.floor(t.x / CELL_SIZE) === gridX && 
    Math.floor((t.y - this.uiOffset) / CELL_SIZE) === gridY
  );

  if (hoveredTile) {
    const isConnected = GameLogic.isConnected(this.buildTiles, this.uiOffset, gridX, gridY, this.currentPlayer);

    if (isConnected) {
      hoveredTile.setTint(0x00ff88);
      hoveredTile.setScale(1.25);
    } else {
      hoveredTile.setTint(0xff6666);
    }
  }
});

// Reset when mouse leaves the game
this.input.on('pointerout', () => {
  this.buildTiles.forEach(t => {
    t.clearTint();
    t.setScale(1);
  });
});

// Clear tint
this.input.on('pointerout', () => {
  this.buildTiles.forEach(tile => tile.clearTint());
});

// Clear tint when mouse leaves a tile
this.input.on('pointerout', () => {
  this.buildTiles.forEach(tile => tile.clearTint());
});

this.input.on('pointerout', () => {
  this.buildTiles.forEach(t => {
    t.clearTint();
    t.setScale(1);
  });
});
    




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

    // Click handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleGridClick(pointer);
    });

    this.events.on('fireShot', () => this.executeShot());

    console.log("✅ Game loaded with GameLogic");
  }

  private createBase(x: number, y: number, color: number, symbol: string) {
    this.add.rectangle(
      x * CELL_SIZE + CELL_SIZE / 2,
      y * CELL_SIZE + CELL_SIZE / 2 + this.uiOffset,
      CELL_SIZE - 4,
      CELL_SIZE - 4,
      color
    );
    this.add.text(
      x * CELL_SIZE + CELL_SIZE / 2,
      y * CELL_SIZE + CELL_SIZE / 2 + this.uiOffset,
      symbol,
      { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }
    ).setOrigin(0.5);
  }

  private handleGridClick(pointer: Phaser.Input.Pointer) {
    const gridX = Math.floor(pointer.x / CELL_SIZE);
    const gridY = Math.floor((pointer.y - this.uiOffset) / CELL_SIZE);

    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) return;

    if (this.gameUI.getCurrentAction() === 'build') {
      this.placeBuildTile(gridX, gridY);
    } else if (this.gameUI.getCurrentAction() === 'shoot') {
      const clickedTile = this.buildTiles.find(t => 
        Math.floor(t.x / CELL_SIZE) === gridX && 
        Math.floor((t.y - this.uiOffset) / CELL_SIZE) === gridY
      );
      if (clickedTile) this.selectShotTile(clickedTile);
    }
  }
private placeBuildTile(gridX: number, gridY: number) {
  if (this.gameUI.getCurrentAction() !== 'build') {
    console.log("❌ Click the BUILD button first!");
    return;
  }

  console.log(`[Build] Trying to place at (${gridX}, ${gridY})`);

  // === BLOCK PLACEMENT ON BASE TILES ===
  const onBase = [...PLAYER1_BASES, ...PLAYER2_BASES].some(b => b.x === gridX && b.y === gridY);
  if (onBase) {
    console.log("❌ Cannot build on a Base tile");
    return;
  }

  // Check if occupied by build tile
  const isOccupied = this.buildTiles.some(t => 
    Math.floor(t.x / CELL_SIZE) === gridX && 
    Math.floor((t.y - this.uiOffset) / CELL_SIZE) === gridY
  );

  if (isOccupied) {
    console.log("❌ Cell occupied");
    return;
  }

  // Place tile
  const color = this.currentPlayer === 1 ? '#4488ff' : '#ff6666';
  const symbol = this.currentPlayer === 1 ? "x" : "o";

  const text = this.add.text(
    gridX * CELL_SIZE + CELL_SIZE / 2,
    gridY * CELL_SIZE + CELL_SIZE / 2 + this.uiOffset,
    symbol,
    { fontSize: '18px', color: color, fontStyle: 'bold' }
  ).setOrigin(0.5);

  this.buildTiles.push(text);

  const turnOver = this.gameUI.incrementBuildCount();

  if (turnOver) {
    this.switchPlayer();
  }
}
  // ... rest of your placeBuildTile code stays the same
private selectShotTile(tile: Phaser.GameObjects.Text) {
  const gridX = Math.floor(tile.x / CELL_SIZE);
  const gridY = Math.floor((tile.y - this.uiOffset) / CELL_SIZE);

  console.log(`[SELECT] Clicked tile at (${gridX}, ${gridY})`);

  const isConnected = GameLogic.isConnected(this.buildTiles, this.uiOffset, gridX, gridY, this.currentPlayer);
  console.log(`[SELECT] Is connected? ${isConnected}`);

  if (!isConnected) {
    console.log("❌ Selection blocked - not connected to base");
    return;
  }

  console.log("✅ Tile selected successfully");

  // Clear old selection
  if (this.selectedBlinkTween) this.selectedBlinkTween.stop();

  this.selectedShotTile = tile;

this.selectedBlinkTween = this.tweens.add({
  targets: tile,
  alpha: 0.4,
  scale: 1.6,
  tint: 0xffff00,        // yellow
  duration: 180,
  yoyo: true,
  repeat: -1
});
}
private executeShot() {
  if (!this.selectedShotTile) return;

  // Clear previous feedback
  if (this.lastFeedback) {
    this.lastFeedback.destroy();
    this.lastFeedback = null;
  }

  //const dice = Phaser.Math.Between(1, 6);
  const dice = Phaser.Math.Between(1, 2);
  console.log(`🎲 Player ${this.currentPlayer} rolled: ${dice}`);

  const shooterX = Math.floor(this.selectedShotTile.x / CELL_SIZE);
  const shooterY = Math.floor((this.selectedShotTile.y - this.uiOffset) / CELL_SIZE);

  let hits = 0;
  const markers: Phaser.GameObjects.Text[] = [];

  // 8 directions
  const directions = [
    [dice, 0], [-dice, 0], [0, dice], [0, -dice],     // straight
    [dice, dice], [dice, -dice], [-dice, dice], [-dice, -dice]  // diagonal
  ];

  for (const [dx, dy] of directions) {
    const targetX = shooterX + dx;
    const targetY = shooterY + dy;

    // Skip out of bounds
    if (targetX < 0 || targetX >= GRID_WIDTH || targetY < 0 || targetY >= GRID_HEIGHT) continue;

    const worldX = targetX * CELL_SIZE + CELL_SIZE / 2;
    const worldY = targetY * CELL_SIZE + CELL_SIZE / 2 + this.uiOffset;

    // Skip own tiles
    const isOwnTile = this.buildTiles.some(t => 
      Math.floor(t.x / CELL_SIZE) === targetX && 
      Math.floor((t.y - this.uiOffset) / CELL_SIZE) === targetY &&
      t.text === (this.currentPlayer === 1 ? "x" : "o")
    );
    if (isOwnTile) continue;

    // Visual marker
    const marker = this.add.text(worldX, worldY, "◉", {
      fontSize: '34px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(50);

    markers.push(marker);

    // Destroy enemy build tile
    const buildIndex = this.buildTiles.findIndex(t => 
      Math.floor(t.x / CELL_SIZE) === targetX && 
      Math.floor((t.y - this.uiOffset) / CELL_SIZE) === targetY &&
      ((this.currentPlayer === 1 && t.text === "o") || 
       (this.currentPlayer === 2 && t.text === "x"))
    );

    if (buildIndex !== -1) {
      this.highlightAndDestroy(this.buildTiles[buildIndex]);
      this.buildTiles.splice(buildIndex, 1);
      hits++;
      continue;
    }

    // Destroy enemy base tile
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
    }
  }
// After the hits loop and feedback
if (hits > 0) {
  const gameOver = this.checkGameOver();
  if (gameOver) {
    return; // Game ended
  }
} else {
  this.switchPlayer();
}
  // Result feedback
  const resultText = hits > 0 ? `HIT! ${hits} destroyed` : "Miss...";
  const color = hits > 0 ? '#00ff00' : '#ff6666';

  this.lastFeedback = this.add.text(400, 150, `Rolled: ${dice} → ${resultText}`, {
    fontSize: '32px',
    color: color,
    fontStyle: 'bold'
  }).setOrigin(0.5).setScrollFactor(0);

  // Remove markers after 2 seconds
  this.time.delayedCall(2000, () => {
    markers.forEach(m => m.destroy());
  });

  // Clean up selection
  if (this.selectedBlinkTween) this.selectedBlinkTween.stop();
  this.selectedShotTile = null;

  // Keep turn on hit, switch on miss
  if (hits === 0) {
    this.switchPlayer();
  }

}
private switchPlayer() {
//private switchPlayer() {
  this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  
  console.log(`🔄 Switching to Player ${this.currentPlayer}`);
  
  this.gameUI.setCurrentPlayer(this.currentPlayer);
  this.gameUI.resetToBuildRequired();   // Strong reset
}

  private highlightAndDestroy(target: any) {
  if (!target) return;

  this.tweens.add({
    targets: target,
    scaleX: 1.6,
    scaleY: 1.6,
    tint: 0xff0000,
    duration: 250,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      target.destroy();
    }
  });
}private checkGameOver() {
  const enemyBases = this.currentPlayer === 1 ? PLAYER2_BASES : PLAYER1_BASES;

  const remainingBases = enemyBases.filter(base => {
    // Check if this base still exists on the board
    return this.children.getAll().some(child => 
      child instanceof Phaser.GameObjects.Rectangle &&
      Math.floor(child.x / CELL_SIZE) === base.x &&
      Math.floor((child.y - this.uiOffset) / CELL_SIZE) === base.y
    );
  });

  if (remainingBases.length === 0) {
    const winner = this.currentPlayer;
    this.add.text(400, 300, `PLAYER ${winner} WINS!`, {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    console.log(`🎉 GAME OVER - Player ${winner} wins!`);
    return true;
  }
  return false;
}
}
