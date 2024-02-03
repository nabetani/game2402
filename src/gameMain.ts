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
    super("GameMain")
  }
  preload() { }
  t0 = 0
  board = new Board((Math.random() * (1 << 31)) | 0);

  get boardBBox(): Phaser.Geom.Rectangle {
    const { width, height } = this.canvas();
    return new Phaser.Geom.Rectangle(0, height - width, width, width);
  }

  create(data: { soundOn: boolean | undefined }) {
    this.t0 = (new Date()).getTime();
    const { width, height } = this.canvas();
    this.board = new Board((Math.random() * (1 << 31)) | 0);
    const rc = this.boardBBox
    const ui = this.add.rectangle(rc.centerX, rc.centerY, rc.width, rc.height, 0xff0000, 1)
    ui.setInteractive().on("pointerdown", (_: any, x: number, y: number) => {
      const { w, h } = this.board.wh;
      const ix = Math.floor(x * w / rc.width);
      const iy = Math.floor(y * w / rc.height);
      console.log({ m: "pointerdown", x: x, y: y, ix: ix, iy: iy });
      this.board.touchAt(ix, iy);
    });
  }
  objes: Phaser.GameObjects.Shape[] = [];
  update() {
    this.board.update();
    const { w, h } = this.board.wh;
  }
}
