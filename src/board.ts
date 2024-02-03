import * as U from './util'

type PNameType = "ta" | "i" | "tu" | "t0" | "t1" | "t2";
export class PName {
  static get ta(): PNameType { return "ta" }
  static get i(): PNameType { return "i" }
  static get tu(): PNameType { return "tu" }
  static get t0(): PNameType { return "t0" }
  static get t1(): PNameType { return "t1" }
  static get t2(): PNameType { return "t2" }
  static t(i: integer): PNameType { return [PName.t0, PName.t1, PName.t2][(i >>> 0 % 3)] }
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

  removeP(x: integer, y: integer): Piece | null {
    for (const i of this.pieces.keys()) {
      const p = this.pieces[i];
      if (p.pos.on && p.pos.x == x && p.pos.y == y) {
        return this.pieces.splice(i, 1)[0]
      }
    }
    return null
  }

  movePieces(x0: integer, y0: integer, dx: integer, dy: integer) {
    const d = (dx == 0 ? this.wh.h : this.wh.w) + 1
    let plist: Piece[] = [];
    for (const i of U.range(1, d)) {
      const x = x0 + dx * i;
      const y = y0 + dy * i;
      const p = this.removeP(x, y);
      if (p != null) {
        plist.push(p);
      }
    }
    for (const i of plist.keys()) {
      plist[i].pos = new DPos(x0 + (i + 1) * dx, y0 + (i + 1) * dy)
    }
    this.pieces.push(...plist);
  }

  touchAt(x: number, y: number) {
    console.log({ m: "touchAt", x: x, y: y });
    for (const i of U.range(0, 4)) {
      const dx = [1, -1, 0, 0][i];
      const dy = [0, 0, 1, -1][i];
      this.movePieces(x, y, dx, dy);
    }
  }
}

