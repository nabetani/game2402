import * as Phaser from 'phaser';

export const stringizeScore = (i: integer): string => {
  const s0 = `${i}`
  const oku = s0.slice(0, -8)
  const restO = s0.slice(-8)
  const man = restO.slice(0, -4)
  const restM = restO.slice(-4)
  return (oku == "" ? "" : oku + "億") + (man == "" ? "" : man + "万") + restM
}

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
  bestTightsText(best: { lv: number, count: number }): string | null {
    if (!best || !best.lv) {
      return null;
    }
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
