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
  id: string
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
  static p(name: PNameType, pos: DPos | CPos): Piece {
    return new Piece(name, pos);
  }
};

export class Board {
  get wh() { return { w: 6, h: 6 } };
  rng: U.Rng
  pieces: Map<string, Piece> = new Map<string, Piece>();
  tick: integer = 0

  addPiece(p: Piece) {
    this.pieces.set(p.id, p)
  }

  initBoard() {
    const x = this.rng.shuffle([...U.range(0, this.wh.w)]);
    const y = this.rng.shuffle([...U.range(0, this.wh.h)]);
    const p = this.rng.shuffle<PNameType>([PName.ta, PName.i, PName.tu]);
    const m = Math.min(x.length, y.length);
    this.pieces.clear();
    for (const i of U.range(0, m)) {
      this.addPiece(Piece.d(p[i % p.length], x[i], y[i]));
    }
    console.log({ "Board.initBoard": this.pieces });
  }

  constructor(seed: integer) {
    this.rng = new U.Rng([seed]);
    this.initBoard()
  }
  lessUsedNames(): PNameType[] {
    let u = new Map<string, [PNameType, number]>();
    for (const t of [PName.ta, PName.i, PName.tu]) {
      u.set(t, [t, this.rng.f01]);
    }
    for (const p of this.pieces.values()) {
      const o = u.get(p.name);
      if (o) { o[1] += 1 }
    }
    const r = [...u.values()]
    r.sort((a, b): number => a[1] - b[1])
    return r.map((a): PNameType => a[0])
  }
  add(): boolean {
    const { w, h } = this.wh
    let pos: { [key: string]: integer } = {}
    for (const i of U.range(0, w * h)) {
      pos[i] = i
    }
    for (const p of this.pieces.values()) {
      const i = p.pos.x + p.pos.y * w
      delete pos[i]
    }
    if (Object.entries(pos).length == 0) {
      return false
    }
    const posAdd = this.rng.sel(Object.values(pos))
    const x = posAdd % w
    const y = (posAdd - x) / w
    const names = this.lessUsedNames()
    for (const name of names) {
      if (!this.canFusionTights(name, x, y)) {
        this.addPiece(Piece.d(name, x, y))
        return true;
      }
    }
    this.addPiece(Piece.d(names[0], x, y))
    return true
  }

  update() {
    ++this.tick;
    const N = 120
    if (this.tick % N == 0) {
      this.add()
    }
    if (this.tick % N == N / 2) {
      this.fusionTights()
    }
  }

  removeP(x: integer, y: integer): Piece | null {
    for (const [id, p] of this.pieces.entries()) {
      if (p.pos.on && p.pos.x == x && p.pos.y == y) {
        this.pieces.delete(id);
        return p
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
    plist.forEach((p) => { this.addPiece(p) })
  }
  gather(x: integer, y: integer) {
    for (const i of U.range(0, 4)) {
      const dx = [1, -1, 0, 0][i];
      const dy = [0, 0, 1, -1][i];
      this.movePieces(x, y, dx, dy);
    }
  }
  // pAt(x: integer, y: integer): Piece | null {
  // }
  fusionIndices(x0: number, y0: number, dx: number, dy: number): string[] {
    let r: string[] = [];
    for (const [id, p] of this.pieces.entries()) {
      const { x, y } = p.pos
      if (Math.abs(x - x0) == dx && Math.abs(y - y0) == dy) {
        r.push(id)
      }
    }
    if (r.length != 2) { return [] }
    const a = this.pieces.get(r[0]);
    const b = this.pieces.get(r[1]);
    if (a == undefined || b == undefined) {
      return [];
    }
    const names = a.name + " " + b.name;
    if (names != "ta tu" && names != "tu ta") {
      return [];
    }
    return r;
  }
  pieceAt(x: integer, y: integer): Piece | null {
    for (const p of this.pieces.values()) {
      if (p.pos.x == x && p.pos.y == y) {
        return p
      }
    }
    return null
  }
  canFusionTights(name: PNameType, x: integer, y: integer): boolean {
    const impl = (d0: integer, n0: PNameType, d1: integer, n1: PNameType): boolean => {
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const match = (d: integer, n: PNameType): boolean => {
          const p = this.pieceAt(x + dx * d, y + dy * d);
          return p != null && p.name == n
        }
        if (!match(d0, n0)) { continue }
        if (!match(d1, n1)) { continue }
        return true
      }
      return false
    }
    switch (name) {
      case PName.i:
        return impl(-1, PName.ta, 1, PName.tu);
      case PName.ta:
        return impl(1, PName.i, 2, PName.tu);
      case PName.tu:
        return impl(1, PName.i, 2, PName.ta);
      default:
        throw `unexpectd pname:${name}`
    }
  }
  fusionTights() {
    let willKilled: string[] = [];
    for (const [id, p] of this.pieces.entries()) {
      if (p.name != PName.i) {
        continue
      }
      const { x, y } = p.pos
      const fusionIDs = [id, ...this.fusionIndices(x, y, 1, 0), ...this.fusionIndices(x, y, 0, 1)];
      if (Object.keys(fusionIDs).length < 2) {
        continue
      }
      willKilled.push(...fusionIDs)
      this.addPiece(Piece.p(PName.t0, p.pos))
    }
    willKilled.forEach((id) => this.pieces.delete(id))
  }

  touchAt(x: integer, y: integer) {
    console.log({ m: "touchAt", x: x, y: y });
    this.gather(x, y);
    this.fusionTights();
  }
}

