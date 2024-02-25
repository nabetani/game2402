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
  bestTightsText(best: { lv: number, count: number }): string {
    const t = ((): string => {
      const name = (new Map<number, string>([
        [1, "普通の"],
        [2, "赤"],
        [3, "網"],
        [4, "アシンメ"],
        [5, "水玉"],
        [6, "縞々"],
        [7, "豹柄"],
      ])).get(best.lv + 1)
      if (name === undefined) {
        return "マックスタイツ"
      }
      return `${name}タイツ (Lv.${best.lv + 1})`
    })()
    return `${t} ✕ ${best.count}`
  }
}
