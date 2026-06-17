import Phaser from 'phaser';

export class GameUI {
  private scene: Phaser.Scene;
  private currentPlayer: 1 | 2 = 1;
  private currentAction: 'build' | 'shoot' = 'build';
  private buildCount = 0;

  private playerText!: Phaser.GameObjects.Text;
  private buildButton!: Phaser.GameObjects.Rectangle;
  private shootButton!: Phaser.GameObjects.Rectangle;
  private buildText!: Phaser.GameObjects.Text;
  private shootText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.scene.add.rectangle(400, 35, 800, 70, 0x222222).setScrollFactor(0);

    this.scene.add.rectangle(100, 35, 50, 50, 0x0066ff).setScrollFactor(0);
    this.playerText = this.scene.add.text(170, 35, "Player 1's Turn", {
      fontSize: '28px', color: '#4488ff', fontStyle: 'bold'
    }).setOrigin(0, 0.5).setScrollFactor(0);

    this.createActionButtons();
  }

  private createActionButtons() {
    this.buildButton = this.scene.add.rectangle(420, 35, 140, 50, 0x00aa00).setInteractive().setScrollFactor(0);
    this.buildText = this.scene.add.text(420, 35, "BUILD", { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5).setScrollFactor(0);

    this.shootButton = this.scene.add.rectangle(580, 35, 140, 50, 0x555555).setInteractive().setScrollFactor(0);
    this.shootText = this.scene.add.text(580, 35, "SHOOT", { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5).setScrollFactor(0);

    this.setupButtonEvents();
    this.updateUI();
  }

  private setupButtonEvents() {
    this.buildButton.on('pointerdown', () => {
      this.currentAction = 'build';
      this.buildCount = 0;
      this.updateUI();
    });

    this.shootButton.on('pointerdown', () => {
      this.currentAction = 'shoot';
      this.updateUI();
    });
  }

  private updateUI() {
    this.buildButton.setFillStyle(this.currentAction === 'build' ? 0x00aa00 : 0x555555);
    this.shootButton.setFillStyle(this.currentAction === 'shoot' ? 0xff8800 : 0x555555);
  }

  setCurrentPlayer(player: 1 | 2) {
    this.currentPlayer = player;
    this.playerText.setText(`Player ${player}'s Turn`);
    this.playerText.setColor(player === 1 ? '#4488ff' : '#ff4444');
    this.buildCount = 0;
  }

  getCurrentAction(): 'build' | 'shoot' {
    return this.currentAction;
  }

  incrementBuildCount(): boolean {
    this.buildCount++;
    if (this.buildCount >= 3) {
      return true; // Turn is over
    }
    return false;
  }

  getBuildCount(): number {
    return this.buildCount;
  }
}