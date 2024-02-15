import * as Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  get tag(): string { return "合成タイツ"; }

  fps(): number { return this.game.config.fps.target!; }
  canvas(): HTMLCanvasElement {
    return this.sys.game.canvas
  }
  setLocation(url: string) {
    if (!window.open(url)) {
      location.href = url;
    }
  }
}
