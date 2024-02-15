
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
  static addScore(s0: integer) {
    storeWS(GENERAL, "lastScore", s0)
    const s = [...this.bestScores, s0]
    s.sort((a, b) => b - a)
    storeWS(GENERAL, "bestScores", s.slice(0, 3));
  }
}
