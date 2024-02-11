import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Board, Piece, State } from './board';
import * as U from './util'

const depth = {
  bg: 0,
  tights: 20
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

const TSizeMap = new Map<integer, integer>(
  [[1, 59], [2, 64], [3, 69], [4, 74], [5, 79], [6, 85]])

export class GameMain extends BaseScene {
  board = new Board((Math.random() * (1 << 31)) | 0);
  nums: Phaser.GameObjects.Sprite[] = []
  constructor() {
    console.log("GameMain.ctor");
    super("GameMain")
  }
  preload() {
    console.log("GameMain.preload");
    this.load.image("gameover", `assets/gameover.webp`);
    this.load.image("tmax", `assets/tmax.webp`);
    for (const i of U.range(1, Board.maxLevel + 1)) {
      const name = `t${i}`
      const wh = TSizeMap.get(i)!
      this.load.image(name,).on("load", (e: any) => {
        const o = this.game.textures.get(name)
        console.log({ "e": e, "texture": o })
      });
      this.load.spritesheet(name, `assets/${name}.webp`, {
        frameWidth: wh,
        frameHeight: wh,
      });
    }
    this.load.spritesheet('nums', 'assets/nums.webp', {
      frameWidth: 42,
      frameHeight: 70,
    });
    this.load.image("bg", "assets/bg.webp");
  }

  get boardBBox(): Phaser.Geom.Rectangle {
    const { width, height } = this.canvas();
    const g = -width / 20
    const w = width - g * 2
    return new Phaser.Geom.Rectangle(g, height - w - g, w, w);
  }

  create(data: { soundOn: boolean | undefined }) {
    const o = this.game.textures.get("t1")
    console.log({ cache: o })
    for (const i of U.range(1, Board.maxLevel + 1)) {
      const name = `t${i}`
    }
    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(depth.bg);
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
  tshape(p: Piece): [string, integer | undefined] {
    const ix = p.typeIx
    if (ix < 3) {
      return [`t${p.level + 1}`, ix]
    }
    return ["tmax", undefined]
  }
  placePiece(p: Piece, sta: { s: State, c: number } | null) {
    let o = this.piecies.get(p.id);
    if (o === null || o === undefined) {
      o = this.add.sprite(0, 0, ...this.tshape(p));
      o.setDepth(depth.tights + p.level)
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
      const scale = Math.min(p.age / 4, 1)
      o.setScale(scale);
      o.setAlpha(1);
    }
  }
  showScore() {
    const { width, height } = this.canvas();
    const text = stringize(this.board.score * 10)
    for (const s of this.nums) {
      s.destroy()
    }
    this.nums = []
    const w = 42
    const h = 70
    for (const ix of U.range(0, text.length)) {
      const x = (ix - (text.length - 1) / 2) * w + width / 2
      const y = h
      const n = text[ix]
      this.nums.push(this.add.sprite(x, y, "nums", n).setOrigin(0.5, 0.5))
    }
  }
  updateBoard() {
    const preGO = this.board.gameIsOver
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
    if (!preGO && this.board.gameIsOver) {
      this.gameOver()
    }
  }
  updateProc = () => { this.updateBoard() }
  updateGameover() {
    this.updateBoard()
  }
  gameOver() {
    const { width, height } = this.canvas();
    this.add.image(width / 2, 200, "gameover");
    this.updateProc = () => { this.updateGameover() }
  }
  update() {
    this.updateProc()
  }
}
