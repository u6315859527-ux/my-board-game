import Phaser from 'phaser';

export class GameUI {
  private scene: Phaser.Scene;
  private currentPlayer: 1 | 2 = 1;
  private currentAction: 'build' | 'shoot' = 'build';
  private buildCount = 0;

  private playerText!: Phaser.GameObjects.Text;
  private buildButton!: Phaser.GameObjects.Rectangle;
  private shootButton!: Phaser.GameObjects.Rectangle;
  private fireButton!: Phaser.GameObjects.Rectangle;
  private buildText!: Phaser.GameObjects.Text;
  private shootText!: Phaser.GameObjects.Text;
  private fireText!: Phaser.GameObjects.Text;
  private buildCounterText!: Phaser.GameObjects.Text;

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
    // BUILD
    this.buildButton = this.scene.add.rectangle(380, 35, 160, 50, 0x00aa00).setInteractive().setScrollFactor(0);
    this.buildText = this.scene.add.text(380, 28, "BUILD", { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
    this.buildCounterText = this.scene.add.text(380, 48, "0/3", { fontSize: '16px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0);

    // SHOOT
    this.shootButton = this.scene.add.rectangle(550, 35, 140, 50, 0x555555).setInteractive().setScrollFactor(0);
    this.shootText = this.scene.add.text(550, 35, "SHOOT", { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);

    // FIRE
    this.fireButton = this.scene.add.rectangle(710, 35, 120, 50, 0xff2222).setInteractive().setScrollFactor(0).setVisible(false);
    this.fireText = this.scene.add.text(710, 35, "FIRE!", { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    this.setupButtonEvents();
    this.updateUI();
  }

private setupButtonEvents() {
  this.buildButton.on('pointerdown', () => {
    this.currentAction = 'build';
    this.buildCount = 0;
    this.updateUI();
    console.log("BUILD mode activated");
  });

  this.shootButton.on('pointerdown', () => {
    this.currentAction = 'shoot';
    this.updateUI();
    console.log("SHOOT mode activated");
  });

  this.fireButton.on('pointerdown', () => {
    this.scene.events.emit('fireShot');
  });
}
  private updateUI() {
    const isBuild = this.currentAction === 'build';
    this.buildButton.setFillStyle(isBuild ? 0x00aa00 : 0x555555);
    this.shootButton.setFillStyle(!isBuild ? 0xff8800 : 0x555555);
    this.fireButton.setVisible(!isBuild);
    this.fireText.setVisible(!isBuild);
    this.buildCounterText.setText(`${this.buildCount}/3`);
  }

setCurrentPlayer(player: 1 | 2) {
  this.currentPlayer = player;
  this.playerText.setText(`Player ${player}'s Turn`);
  this.playerText.setColor(player === 1 ? '#4488ff' : '#ff4444');
  
  this.buildCount = 0;
  this.currentAction = 'build';   // ← Force start in build mode
  this.updateUI();
  
  console.log(`[UI] Player ${player} turn started - Build mode forced`);
}

  getCurrentAction(): 'build' | 'shoot' {
    return this.currentAction;
  }

incrementBuildCount(): boolean {
  this.buildCount++;
  this.updateUI();
  
  console.log(`[UI] Build count now: ${this.buildCount}/3`);

  if (this.buildCount >= 3) {
    console.log("[UI] 3 tiles reached - signaling turn end");
    return true;
  }
  return false;
}
getBuildCount(): number {
  return this.buildCount;
}

resetBuildCount() {
  this.buildCount = 0;
  this.updateUI();
  console.log("[UI] Build count reset to 0");
}
setCurrentActionToBuild() {
  this.currentAction = 'build';
  this.buildCount = 0;
  this.updateUI();
}
}