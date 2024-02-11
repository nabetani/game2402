import * as U from './util'

type PNameType = "ta_1" | "i_1" | "tu_1" |
  "ta_2" | "i_2" | "tu_2" |
  "ta_3" | "i_3" | "tu_3" |
  "ta_4" | "i_4" | "tu_4" |
  "ta_5" | "i_5" | "tu_5" |
  "ta_6" | "i_6" | "tu_6" |
  "tmax"

const getLevel = (n: PNameType): integer => {
  const [_, level] = n.split("_")
  if (level === undefined) {
    return 7
  }
  return parseInt(level, 10) - 1;
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

const fibox = (x: integer): integer => {
  const f = (i: integer): [integer, integer] => {
    if (i < 2) { return [1, 1] }
    const [a, b] = f(i - 1);
    return [a + ((b + 1) / 2) >>> 0, a];
  }
  return f(x)[0];
}

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
  age: integer = 0
  pos: DPos | CPos
  constructor(name: PNameType, pos: DPos | CPos) {
    this.id = U.newID();
    this.pos = pos;
    this.name = name;
  }
  get level(): integer {
    return getLevel(this.name);
  }
  get typeIx(): integer {
    const [t] = this.name.split("_")
    switch (t) {
      case "ta": return 0
      case "i": return 1
      case "tu": return 2
      case "tmax": return 3
      default:
        throw "unexpected name" + this.name
    }
  }
  dpos(): DPos {
    return new DPos(this.pos.x, this.pos.y)
  }
  cpos(): CPos {
    return new CPos(this.pos.x, this.pos.y)
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

abstract class Phase {
  tick: integer = 0
  board: Board
  abstract update(): void
  constructor(board: Board) {
    this.board = board
  }
  abstract get movings(): Movings
}

type Move = {
  x: integer
  y: integer
  p: Piece
}

export type State = "g" | "d"
export type Movings = { s: State, c: number, p: Piece[] }[]

class GatherPhase extends Phase {
  moves: Move[]
  constructor(board: Board, x: integer, y: integer) {
    super(board)
    this.moves = board.getMoves(x, y)
  }
  get movings(): Movings {
    const m = this.moves.map((e) => e.p)
    return [{ s: "g", c: 0, p: m }]
  }
  update(): void {
    ++this.tick
    const n = 10;
    const t = n - this.tick
    const r = (t / (t + 1)) ** 3
    for (const m of this.moves) {
      m.p.pos.x = m.x + (m.p.pos.x - m.x) * r
      m.p.pos.y = m.y + (m.p.pos.y - m.y) * r
    }
    if (t == 0) {
      for (const m of this.moves) {
        m.p.pos = m.p.dpos()
        this.board.addPiece(m.p)
      }
      this.board.phase = new FusionPhase(this.board, 0)
    }
  }
}

class FusionPhase extends Phase {
  mate: Piece[] = []
  pro: Piece[] = []
  m: Movings = []
  nextTick: integer
  constructor(board: Board, nextTick: integer) {
    super(board)
    this.nextTick = nextTick
  }
  update(): void {
    switch (this.tick) {
      case 0:
        const { mate, pro } = this.board.fusionTights();
        this.mate = mate
        this.pro = pro
        if (this.pro.length == 0) {
          this.board.phase = new ProducePhase(this.board, this.nextTick);
        } else {
          this.m = [
            { s: "d", c: 0, p: this.mate },
            { s: "d", c: 0, p: this.pro },
          ]
        }
        this.tick = 1
        break
      case 10:
        this.pro.forEach((p) => this.board.addPiece(p));
        this.m = []
        this.tick = 0
        break
      default:
        ++this.tick
    }
  }
  get movings(): Movings {
    const t = Math.min(1, Math.max(0, 1 - this.tick / 10))
    if (this.m && this.m[0]) {
      this.m[0].c = t
    }
    if (this.m && this.m[1]) {
      this.m[1].c = 1 - t
    }
    return this.m
  }
}

class ProducePhase extends Phase {
  constructor(board: Board, t: integer) {
    super(board)
    this.tick = t
  }
  update(): void {
    ++this.tick
    const N = 240
    if (this.tick % N == 1) {
      this.board.add()
      this.board.phase = new FusionPhase(this.board, 1)
    }
    const b = this.board
    if (b.lastTouch != null) {
      b.phase = new GatherPhase(b, b.lastTouch.x, b.lastTouch.y)
      b.lastTouch = null
    }
  }
  get movings(): Movings {
    return []
  }
}

export class Board {
  static get maxLevel(): integer { return 6 }
  // static get maxLevel(): integer { return 2 }
  get wh() { return { w: 6, h: 8 } };
  phase: Phase = new ProducePhase(this, 1)
  rng: U.Rng
  pieces: Map<string, Piece> = new Map<string, Piece>();
  tick: integer = 0
  lastTouch: { x: integer, y: integer } | null = null;
  score: number = 0

  addPiece(p: Piece) {
    this.pieces.set(p.id, p)
  }

  get movings(): Movings {
    return this.phase.movings
  }

  incAge() {
    for (const p of this.pieces.values()) {
      ++p.age
    }
  }

  initBoard() {
    if (true) {
      const x = this.rng.shuffle([...U.range(0, this.wh.w)]);
      const y = this.rng.shuffle([...U.range(0, this.wh.h)]);
      const p = this.rng.shuffle<PNameType>([PName.ta(0), PName.i(0), PName.tu(0)]);
      const m = Math.min(x.length, y.length);
      this.pieces.clear();
      for (const i of U.range(0, m)) {
        this.addPiece(Piece.d(p[i % p.length], x[i], y[i]));
      }
    } else if (true) {
      const names: PNameType[] = ["tmax"]
      for (const l of U.range(0, Board.maxLevel)) {
        names.push(PName.ta(l), PName.i(l), PName.tu(l))
      }
      for (const y of U.range(1, this.wh.h)) {
        for (const x of U.range(0, this.wh.w)) {
          const n = names[((x + y * this.wh.h) * 17) % names.length]
          this.addPiece(Piece.d(n, x, y));
        }
      }
    } else {
      const s = [PName.ta(0), PName.i(0), PName.tu(0)]
      for (const y of U.range(0, this.wh.h)) {
        for (const x of U.range(0, this.wh.w)) {
          if (x < 5 && y < 3) {
            const n = parseInt(["12121", "12023", "32323"][y][x])
            if (0 < n) {
              this.addPiece(Piece.d(s[n - 1], x, y));
            }
          } else if (x < 5 && y < 6) {
            const n = parseInt(["12121", "12023", "32323"][y - 3][x])
            if (0 < n) {
              this.addPiece(Piece.d(s[n - 1], x, y));
            }
          } else {
            this.addPiece(Piece.d(PName.i(0), x, y));
          }
        }
      }
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
  add() {
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
      return
    }
    const posAdd = this.rng.sel([...pos.values()]);
    const x = posAdd % w
    const y = (posAdd - x) / w
    const names = this.lessUsedNames(0)
    for (const name of names) {
      if (!this.canFusionTights(name, x, y)) {
        this.addPiece(Piece.d(name, x, y))
        return;
      }
    }
    this.addPiece(Piece.d(names[0], x, y))
    // this.phase = new FusionPhase(this);
  }
  get gameIsOver(): boolean {
    return this.pieces.size == this.wh.h * this.wh.w
  }
  update() {
    this.incAge()
    this.phase.update()
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

  getMoves(x0: integer, y0: integer): Move[] {
    let r: Move[] = []
    for (const dir of U.range(0, 4)) {
      const dx = [1, -1, 0, 0][dir];
      const dy = [0, 0, 1, -1][dir];
      const d = (dx == 0 ? this.wh.h : this.wh.w) + 1
      let goal: [number, number] | null = null
      for (const dist of U.range(1, d)) {
        const x = x0 + dx * dist;
        const y = y0 + dy * dist;
        if (goal === null) {
          if (null === this.pieceAt(x, y)) {
            goal = [x, y];
          }
          continue
        }
        const p = this.removeP(x, y);
        if (p !== null) {
          p.pos = p.cpos()
          r.push({ x: goal[0], y: goal[1], p: p })
          goal[0] += dx
          goal[1] += dy
        }
      }
    }
    console.log(r)
    return r
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
  fusionTights(): { mate: Piece[], pro: Piece[] } {
    let mate: Piece[] = [];
    let pro: Piece[] = [];
    let scoreBase = new Map<integer, Set<string>>();
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
      fusionIDs.forEach((id) => {
        const p = this.pieces.get(id)
        if (p != null) {
          mate.push(p)
        }
      })
      const set = scoreBase.get(lev) ?? new Set<string>();
      fusionIDs.forEach((id) => set.add(id));
      scoreBase.set(lev, set);
      const name = this.lessUsedNames(getLevel(p.name) + 1)[0];
      const newPiece = Piece.p(name, p.pos)
      newPiece.age = 100
      pro.push(newPiece)
    }
    if (0 < scoreBase.size) {
      console.log(scoreBase);
    }
    for (const [k, v] of scoreBase) {
      this.score += (10 ** k) * fibox(v.size - 2) * scoreBase.size;
      console.log(this.score);
    }
    mate.forEach((p) => this.pieces.delete(p.id))
    return { mate: mate, pro: pro }
  }
  touchAt(x: integer, y: integer) {
    this.lastTouch = { x: x, y: y }
  }
}

