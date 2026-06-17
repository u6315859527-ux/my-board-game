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

    // Create UI
    this.gameUI = new GameUI(this);
    this.gameUI.create();
    this.gameUI.setCurrentPlayer(this.currentPlayer);

    // Grid click handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleGridClick(pointer);
    });

    // Listen for FIRE button
    this.events.on('fireShot', () => this.executeShot());

    console.log("✅ Shooting selection system ready");
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

    const clickedTile = this.buildTiles.find(tile => 
      Math.floor(tile.x / CELL_SIZE) === gridX && 
      Math.floor((tile.y - this.uiOffset) / CELL_SIZE) === gridY
    );

    if (this.gameUI.getCurrentAction() === 'build') {
      this.placeBuildTile(gridX, gridY);
    } 
    else if (this.gameUI.getCurrentAction() === 'shoot' && clickedTile) {
      this.selectShotTile(clickedTile);
    }
  }

  private placeBuildTile(gridX: number, gridY: number) {
    // ... (keep your existing build logic here - the one that places x/o)
    // I'll add it if needed, but assuming you already have it working
  }

  private selectShotTile(tile: Phaser.GameObjects.Text) {
    // Remove previous selection
    if (this.selectedBlinkTween) this.selectedBlinkTween.stop();

    this.selectedShotTile = tile;

    // Blinking effect
    this.selectedBlinkTween = this.tweens.add({
      targets: tile,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }

  private executeShot() {
    if (!this.selectedShotTile) return;

    const diceRoll = Phaser.Math.Between(1, 6);
    console.log(`🎲 Player ${this.currentPlayer} rolled: ${diceRoll}`);

    // TODO: Later - calculate hits and remove enemy tiles

    // For now just feedback
    this.add.text(400, 120, `Rolled: ${diceRoll}`, {
      fontSize: '32px', color: '#ff0000', fontStyle: 'bold'
    }).setOrigin(0.