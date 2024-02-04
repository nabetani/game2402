import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Board } from './board';
import * as U from './util'

/*
 マス目がある。6x6 ぐらいか。
 マス目をタップすると、そのマス目の上下左右からそのマス目に向かって移動する。
 移動の結果、「た」と「つ」の間に「い」があったら、タイツになる。
 タイツの上下左右が同ランクのタイツだったら、1ランク上のタイツになる。
 マス目に「た」「い」「つ」が適宜供給される（時間制）
 空欄がなくなったらゲームオーバー。
 */

const depth = {
};

export class GameMain extends BaseScene {
  constructor() {
    console.log("GameMain.ctor");
    super("GameMain")
  }
  preload() {
    console.log("GameMain.preload");
    for (const k of ["ta", "i", "tu", "t0", "t1", "t2"]) {
      this.load.image(k, `assets/${k}.webp`);
    }
  }
  t0 = 0
  board = new Board((Math.random() * (1 << 31)) | 0);

  get boardBBox(): Phaser.Geom.Rectangle {
    const { width, height } = this.canvas();
    const g = width * 0.1
    const w = width - g * 2
    return new Phaser.Geom.Rectangle(g, height - w - g, w, w);
  }

  create(data: { soundOn: boolean | undefined }) {
    this.t0 = (new Date()).getTime();
    const { width, height } = this.canvas();
    // this.board = new Board((Math.random() * (1 << 30) * 4) | 0);
    this.board = new Board(0);
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
  piecies: { [key: string]: Phaser.GameObjects.Sprite } = {};
  dispPos(pos: { x: number, y: number }): [number, number] {
    const rc = this.boardBBox
    const { w, h } = this.board.wh;
    return [
      rc.left + rc.width / (w + 2) * (pos.x + 1.5),
      rc.top + rc.height / (h + 2) * (pos.y + 1.5)
    ]
  }
  update() {
    this.board.update();
    const { w, h } = this.board.wh;
    const checked: { [key: string]: boolean } = {};
    for (const k of Object.keys(this.piecies)) {
      checked[k] = false;
    }
    for (const [id, p] of this.board.pieces.entries()) {
      let o = this.piecies[id];
      checked[p.id] = true;
      if (o === null || o === undefined) {
        o = this.add.sprite(100, 100, p.name);
        this.piecies[p.id] = o;
        console.log({ o: o, p: p });
      }
      const [x, y] = this.dispPos(p.pos)
      o.setPosition(x, y);
      o.setVisible(true);
    }
    for (const k of Object.keys(checked)) {
      if (!checked[k]) {
        this.piecies[k].setVisible(false);
      }
    }
  }
}
