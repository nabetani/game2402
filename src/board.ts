import * as U from './util'

export const PName = {
  none: 0,
  ta: 1,
  i: 2,
  tu: 3,
};

export class Piece {
  x: number
  y: number
  name: integer
  constructor(name: integer, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.name = name;
  }
};

export class Board {
  get wh() { return { w: 6, h: 6 } };

  rng: U.Rng

  board: integer[] = []
  movings: Piece[] = []

  setAt(x: integer, y: integer, p: integer) {
    this.board[x + y * this.wh.w] = p
  }

  at(x: integer, y: integer): integer {
    const r = this.board[x + y * this.wh.w];
    return r ?? PName.none;
  }

  initBoard() {
    const x = this.rng.shuffle([...U.range(0, this.wh.w)]);
    const y = this.rng.shuffle([...U.range(0, this.wh.h)]);
    const p = this.rng.shuffle([PName.ta, PName.i, PName.tu]);
    const m = Math.min(x.length, y.length);
    for (const i of U.range(0, m)) {
      this.setAt(x[i], y[i], p[i % p.length]);
    }
    console.log(this.board)
  }

  constructor(seed: integer) {
    this.rng = new U.Rng([seed]);
    this.initBoard()
  }

  update() { }

  touchAt(x: number, y: number) {
    console.log({ m: "touchAt", x: x, y: y });
  }
}

