
const APP_WS_ID = "tt9IZYpQfEAp4W3ZwMDZXnHOz." // Array.new(25){[*?a..?z,*?A..?Z,*0..9].sample}.join+"."

const storeWS = (name: string, key: string, val: any) => {
  const s = localStorage;
  const wsKey = APP_WS_ID + name;
  const v = JSON.parse(s.getItem(wsKey) || "{}");
  v[key] = val;
  console.log(["storeWS", v]);
  s.setItem(wsKey, JSON.stringify(v));
}

const readWS = <T>(name: string, key: string, fallback: T): T => {
  const s = localStorage;
  const wsKey = APP_WS_ID + name;
  const v = JSON.parse(s.getItem(wsKey) || "{}");
  console.log(["readWS", v]);
  const r = v[key];
  if (r === undefined) {
    return fallback;
  }
  return r;
}

const GENERAL = "general";

export class WStorage {
  static get bestScores(): integer[] {
    return readWS<integer[]>(GENERAL, "bestScores", []);
  }
  static get lastScore(): integer | null {
    return readWS<integer | null>(GENERAL, "lastScore", null);
  }
  static get soundOn(): boolean {
    return readWS<boolean>(GENERAL, "soundOn", false);
  }
  static setSoundOn(sw: boolean) {
    storeWS(GENERAL, "soundOn", sw);
  }
  static addScore(s0: integer) {
    storeWS(GENERAL, "lastScore", s0)
    const s = [...this.bestScores, s0]
    s.sort((a, b) => b - a)
    storeWS(GENERAL, "bestScores", s.slice(0, 3));
  }
  static get bests(): { lv: number; count: number; }[] {
    return readWS<{ lv: number; count: number; }[]>(GENERAL, "bests", []);
  }
  static get lastBest(): { lv: number; count: number; } | null {
    return readWS<{ lv: number; count: number; } | null>(GENERAL, "lastBest", null);
  }
  static addBest(b: { lv: number; count: number; }) {
    storeWS(GENERAL, "lastBest", b)
    const s = [...this.bests, b]
    const ev = (x: { lv: number, count: number }): number => x.lv * 10000 + x.count;
    s.sort((a, b) => ev(b) - ev(a))
    storeWS(GENERAL, "bests", s.slice(0, 3));
  }
}
