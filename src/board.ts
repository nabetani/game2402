import * as U from './util'

type PNameType = "ta" | "i" | "tu";
export class PName {
  static get ta(): PNameType { return "ta" }
  static get i(): PNameType { return "i" }
  static get tu(): PNameType { return "tu" }
};

export class DPos {
  x: integer
  y: integer
  get on() { return true };
  constructor(x: integer, y: integer) {
    this.x = x;
    this.y = y;
  }
}

export class CPos {
  x: number
  y: number
  get on() { return false };
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class NoPos {
  get x() { return null }
  get y() { return null }
  get on() { return false };
}

export class Piece {
  id: integer
  name: PNameType
  pos: DPos | CPos
  constructor(name: PNameType, pos: DPos | CPos) {
    this.id = U.newID();
    this.pos = pos;
    this.name = name;
  }
  static d(name: PNameType, x: integer, y: integer): Piece {
    return new Piece(name, new DPos(x, y));
  }
  static c(name: PNameType, x: number, y: number): Piece {
    return new Piece(name, new CPos(x, y));
  }
};

export class Board {
  get wh() { return { w: 6, h: 6 } };
  rng: U.Rng
  pieces: Piece[] = []

  initBoard() {
    const x = this.rng.shuffle([...U.range(0, this.wh.w)]);
    const y = this.rng.shuffle([...U.range(0, this.wh.h)]);
    const p = this.rng.shuffle<PNameType>([PName.ta, PName.i, PName.tu]);
    const m = Math.min(x.length, y.length);
    this.pieces = []
    for (const i of U.range(0, m)) {
      this.pieces.push(Piece.d(p[i % p.length], x[i], y[i]));
    }
    console.log({ "Board.initBoard": this.pieces });
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

