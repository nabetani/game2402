import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class Title extends BaseScene {
  constructor() {
    super("Title")
  }
  preload() { }
  create(data: { soundOn: boolean | undefined }) {
    const { width, height } = this.canvas();
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x727171, 1);
    const start = this.add.text(width / 2, height / 2, "Start", {
      fontFamily: 'sans-serif',
      color: "black",
      backgroundColor: "white",
      padding: { x: 3, y: 3 },
      fontSize: "40px",
    });
    start.setOrigin(0.5, 0.5);
    start.setInteractive();
    start.on("pointerdown", () => {
      this.scene.start('GameMain', { soundOn: true });
    });
  }
}
