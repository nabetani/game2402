import * as U from './util'

type PNameType = "ta_1" | "i_1" | "tu_1" |
  "ta_2" | "i_2" | "tu_2" |
  "ta_3" | "i_3" | "tu_3" |
  "ta_4" | "i_4" | "tu_4" |
  "ta_5" | "i_5" | "tu_5" |
  "ta_6" | "i_6" | "tu_6" |
  "tmax"

const getLevel = (n: PNameType): integer => {
  return parseInt(n.split("_")[1], 10) - 1;
}
export class PName {
  static ta_: PNameType[] = ["ta_1", "ta_2", "ta_3", "ta_4", "ta_5", "ta_6"]
  static i_: PNameType[] = ["i_1", "i_2", "i_3", "i_4", "i_5", "i_6"]
  static tu_: PNameType[] = ["tu_1", "tu_2", "tu_3", "tu_4", "tu_5", "tu_6"]
  static pname(names: PNameType[], level: integer): PNameType {
    level = level >>> 0;
    if (Board.maxLevel <= level) { return "tmax" };
    return names[level]
  }
  static ta(n: integer): PNameType { return this.pname(this.ta_, n) }
  static i(n: integer): PNameType { return this.pname(this.i_, n) }
  static tu(n: integer): PNameType { return this.pname(this.tu_, n) }
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
  static get maxLevel(): integer { return 2 }
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
    const p = this.rng.shuffle<PNameType>([PName.ta(0), PName.i(0), PName.tu(0)]);
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
  lessUsedNames(level: integer): PNameType[] {
    let u = new Map<string, [PNameType, number]>();
    for (const t of [PName.ta(level), PName.i(level), PName.tu(level)]) {
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
    let pos = new Set<integer>()
    for (const i of U.range(0, w * h)) {
      pos.add(i);
    }
    for (const p of this.pieces.values()) {
      const i = p.pos.x + p.pos.y * w
      pos.delete(i);
    }
    if (pos.size == 0) {
      return false
    }
    const posAdd = this.rng.sel([...pos.values()]);
    const x = posAdd % w
    const y = (posAdd - x) / w
    const names = this.lessUsedNames(0)
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
  fusionIndices(lev: number, x0: number, y0: number, dx: number, dy: number): string[] {
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
    const ta = PName.ta(lev)
    const tu = PName.tu(lev)
    if ((a.name == ta && b.name == tu) || (a.name == tu && b.name == ta)) {
      return r;
    }
    return []
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
    const level = getLevel(name);
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
      case PName.i(level):
        return impl(-1, PName.ta(level), 1, PName.tu(level));
      case PName.ta(level):
        return impl(1, PName.i(level), 2, PName.tu(level));
      case PName.tu(level):
        return impl(1, PName.i(level), 2, PName.ta(level));
      default:
        throw `unexpectd pname:${name}, level:${level}`
    }
  }
  fusionTights() {
    let willKilled: string[] = [];
    for (const [id, p] of this.pieces.entries()) {
      if (p.name[0] != "i") {
        continue
      }
      const { x, y } = p.pos
      const lev = getLevel(p.name);
      const fusionIDs = [id, ...this.fusionIndices(lev, x, y, 1, 0), ...this.fusionIndices(lev, x, y, 0, 1)];
      if (fusionIDs.length < 2) {
        continue
      }
      willKilled.push(...fusionIDs)
      const name = this.lessUsedNames(getLevel(p.name) + 1)[0];
      this.addPiece(Piece.p(name, p.pos))
    }
    willKilled.forEach((id) => this.pieces.delete(id))
  }


  touchAt(x: integer, y: integer) {
    console.log({ m: "touchAt", x: x, y: y });
    this.gather(x, y);
    this.fusionTights();
  }
}

