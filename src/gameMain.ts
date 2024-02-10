import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Board, Piece, State } from './board';
import * as U from './util'

const depth = {
};

const stringize = (n: integer, r: integer = 0): integer[] => {
  if (n <= 0) { return [0] }
  const f = n % 10
  const h = (n - f) / 10
  if (h == 0) { return [f] }
  const t = (r == 3) ? [10]
    : (r == 7) ? [11]
      : []
  return [...stringize(h, r + 1), ...t, f]
}

export class GameMain extends BaseScene {
  board = new Board((Math.random() * (1 << 31)) | 0);
  nums: Phaser.GameObjects.Sprite[] = []
  constructor() {
    console.log("GameMain.ctor");
    super("GameMain")
  }
  preload() {
    console.log("GameMain.preload");
    this.load.image("tmax", `assets/tmax.webp`);
    for (const k of ["ta", "i", "tu"]) {
      for (const i of U.range(1, Board.maxLevel + 1)) {
        const name = `${k}_${i}`
        this.load.image(name, `assets/${name}.webp`);
      }
    }
    this.load.spritesheet('nums', 'assets/nums.webp', {
      frameWidth: 42,
      frameHeight: 70,
    });
  }

  get boardBBox(): Phaser.Geom.Rectangle {
    const { width, height } = this.canvas();
    const g = width * 0.1
    const w = width - g * 2
    return new Phaser.Geom.Rectangle(g, height - w - g, w, w);
  }

  create(data: { soundOn: boolean | undefined }) {
    const { width, height } = this.canvas();
    // this.board = new Board((Math.random() * (1 << 30) * 4) | 0);
    this.board = new Board((Math.random() * (1 << 31)) | 0);
    const rc = this.boardBBox
    const ui = this.add.rectangle(rc.centerX, rc.centerY, rc.width, rc.height, 0xff0000, 0.1)
    ui.setInteractive().on("pointerdown", (_: any, x: number, y: number) => {
      const { w, h } = this.board.wh;
      const ix = Math.floor(x * (w + 2) / rc.width) - 1;
      const iy = Math.floor(y * (h + 2) / rc.height) - 1;
      console.log({ m: "pointerdown", x: x, y: y, ix: ix, iy: iy });
      this.board.touchAt(ix, iy);
    });
    this.drawBoard()
  }
  drawBoard() {
    const { w, h } = this.board.wh;
    const rc = this.boardBBox
    for (const ix of U.range(0, w + 3)) {
      const x = ix / (w + 2) * rc.width + rc.left
      this.add.line(x, rc.centerY, 0, 0, 0, rc.height, 0xffffff, 1);
    }
    for (const iy of U.range(0, h + 3)) {
      const y = iy / (h + 2) * rc.height + rc.top;
      this.add.line(rc.centerX, y, 0, 0, rc.width, 0, 0xffffff, 1);
    }
  }
  piecies = new Map<string, Phaser.GameObjects.Sprite>();
  dispPos(pos: { x: number, y: number }): [number, number] {
    const rc = this.boardBBox
    const { w, h } = this.board.wh;
    return [
      rc.left + rc.width / (w + 2) * (pos.x + 1.5),
      rc.top + rc.height / (h + 2) * (pos.y + 1.5)
    ]
  }
  placePiece(p: Piece, sta: { s: State, c: number } | null) {
    let o = this.piecies.get(p.id);
    if (o === null || o === undefined) {
      o = this.add.sprite(100, 100, p.name);
      this.piecies.set(p.id, o);
      console.log({ o: o, p: p });
    }
    const [x, y] = this.dispPos(p.pos)
    o.setPosition(x, y);
    o.setVisible(true);
    if (sta?.s == "d") {
      o.setScale(2 ** (1 - sta.c));
      o.setAlpha(sta.c);
    } else {
      o.setScale(1);
      o.setAlpha(1);
    }
  }
  showScore() {
    const { width, height } = this.canvas();
    const text = stringize(this.board.score + 9876e5)
    for (const s of this.nums) {
      s.setVisible(false);
      s.destroy()
    }
    this.nums = []
    const w = 42
    const h = 70
    for (const ix of U.range(0, text.length)) {
      const x = (ix - text.length / 2) * w + width / 2
      const y = h
      const n = text[ix]
      this.nums.push(this.add.sprite(x, y, "nums", n))
    }
  }
  update() {
    this.board.update();
    this.showScore()
    const unchecked = new Set<string>();
    for (const k of this.piecies.keys()) {
      unchecked.add(k);
    }
    for (const [id, p] of this.board.pieces.entries()) {
      unchecked.delete(p.id)
      this.placePiece(p, null)
    }
    for (const m of this.board.movings) {
      for (const p of m.p) {
        unchecked.delete(p.id)
        this.placePiece(p, m)
      }
    }
    for (const k of unchecked.values()) {
      this.piecies.get(k)!.setVisible(false);
    }
  }
}
