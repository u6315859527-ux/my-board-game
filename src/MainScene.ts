import Phaser from 'phaser';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, PLAYER1_BASES, PLAYER2_BASES } from './config';
import { GameUI } from './GameUI';

export default class MainScene extends Phaser.Scene {
  private gameUI!: GameUI;

  constructor() {
    super('MainScene');
  }

  create() {
   console.log("🎮 MainScene started successfully");
    this.cameras.main.setBackgroundColor('#f8f8f8');

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x555555, 0.6);

    // Draw grid
    for (let x = 0; x <= GRID_WIDTH; x++) {
      graphics.moveTo(x * CELL_SIZE, 0);
      graphics.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      graphics.moveTo(0, y * CELL_SIZE);
      graphics.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
    }
    graphics.strokePath();

    // Draw bases
    PLAYER1_BASES.forEach(pos => this.createBase(pos.x, pos.y, 0x0066ff, "X"));
    PLAYER2_BASES.forEach(pos => this.createBase(pos.x, pos.y, 0xff2222, "O"));

    // Create UI
    this.gameUI = new GameUI(this);
    this.gameUI.create();

    console.log("Game initialized with UI");
  }

  private createBase(x: number, y: number, color: number, symbol: string) {
    this.add.rectangle(
      x * CELL_SIZE + CELL_SIZE / 2,
      y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4,
      color
    );

    this.add.text(
      x * CELL_SIZE + CELL_SIZE / 2,
      y * CELL_SIZE + CELL_SIZE / 2,
      symbol,
      { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }
    ).setOrigin(0.5);
  }
}