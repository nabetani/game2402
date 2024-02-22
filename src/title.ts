import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { WStorage } from './wstorage';

const depth = {
  scoreBase: 10,
  scores: 20,
  rule: 30,
};

const stringizeScore = (i: integer): string => {
  const s0 = `${i}`
  const oku = s0.slice(0, -8)
  const restO = s0.slice(-8)
  const man = restO.slice(0, -4)
  const restM = restO.slice(-4)
  return (oku == "" ? "" : oku + "億") + (man == "" ? "" : man + "万") + restM
}

export class Title extends BaseScene {
  constructor() {
    super("Title")
  }
  preload() {
    this.load.image("title", `assets/title.webp`);
  }
  create(data: { soundOn: boolean | undefined }) {
    const { width, height } = this.canvas();
    // const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x727171, 1);
    this.add.image(width / 2, height / 2, "title");
    const start = this.add.text(width / 2, height / 2 + 50, "Start", {
      fontFamily: 'sans-serif',
      color: "black",
      backgroundColor: "#fff6",
      padding: { x: 50, y: 20 },
      fontSize: "40px",
    });
    start.setOrigin(0.5, 0.5);
    start.setInteractive();
    start.on("pointerdown", () => {
      this.scene.start('GameMain', { soundOn: true });
    });
    const ruleBtn = this.add.text(width / 2, start.getBounds().top - 30, "ルール説明", {
      fontFamily: 'sans-serif',
      color: "black",
      backgroundColor: "#fff6",
      padding: { x: 3, y: 3 },
      fontSize: "20px",
    });
    ruleBtn.setOrigin(0.5, 0.5);
    ruleBtn.setInteractive();
    ruleBtn.on("pointerdown", () => { this.showRule() });
    this.addLinks()
    this.showScores()
  }
  showRule() {
    const { width, height } = this.sys.game.canvas;
    const msg = [
      "タイツを合成して高レベルタイツを作ります。",
      "同一レベルの タ・イ・ツ を並べると合成できます。",
      "上→下、下→上、右→左、左→右のいずれでも OK。",
      "盤面または、番外の三角をクリックすると",
      "上下左右のタイツが集まってきます。",
      "",
      "タイツを合成すると、以下の計算でスコアが増えます。",
      "　N = (合成のために失われるタイツの数-2)",
      "　L = (合成のために失われるタイツの最高レベル)",
      "　増えるスコア = (10のL乗)×N"
    ].join("\n");
    const style = {
      wordWrap: { width: width * 0.9, useAdvancedWrap: true },
      fontSize: "18px",
      color: "black",
      padding: { x: 10, y: 10 },
      fixedWidth: width * 0.95,
      backgroundColor: "white",
      lineSpacing: 10,
    };
    let ruleObjs: Phaser.GameObjects.GameObject[] = [];
    const rule = this.add.text(width / 2, height / 2, msg, style)
    rule.setOrigin(0.5, 0.5)
    rule.setInteractive()
    rule.setDepth(depth.rule)
    rule.on("pointerdown", () => {
      for (const r of ruleObjs) {
        r.destroy();
      }
    }
    );
    ruleObjs.push(rule);
    ruleObjs.push(...this.addCloseBox(rule.getBounds(), rule.depth));
  }
  addCloseBox(rc: Phaser.Geom.Rectangle, d: number): Phaser.GameObjects.GameObject[] {
    let objs = [];
    const { width, height } = this.sys.game.canvas
    const w = width / 15;
    const h = w;
    const x = rc.right - w / 2;
    const y = rc.top + h / 2;
    objs.push(this.add.rectangle(x, y, w, h, 0x727171, 1).setDepth(depth.rule + 1));
    for (const i of [45, -45]) {
      const r = this.add.rectangle(x, y, w / 7, h * 0.9, 0xff8888, 1);
      r.setDepth(depth.rule + 1)
      r.setAngle(i);
      objs.push(r);
    }
    return objs;
  }
  showScores() {
    let y = 200
    const { width, height } = this.canvas()
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      color: "black",
      padding: { x: 3, y: 3 },
      fontSize: "22px",
      // backgroundColor: "#ffffff66",
      lineSpacing: 10,
    };
    const bests = WStorage.bestScores
    let x = null
    let rc: Phaser.Geom.Rectangle | null = null
    const writeScore = (o: number, rank: string) => {
      const score = `${stringizeScore(o)}点`
      const t = this.add.text(450, y, score, style)
      t.setOrigin(1, 0).setDepth(depth.scores)
      x ??= t.getBounds().left - 10
      const r = this.add.text(x, y, rank, style).setOrigin(1, 0).setDepth(depth.scores)
      y = t.getBounds().bottom + 10
      rc = Phaser.Geom.Rectangle.Union(rc ?? t.getBounds(), t.getBounds())
      rc = Phaser.Geom.Rectangle.Union(rc, r.getBounds())
    }
    if (0 < bests.length) {
      bests.forEach((o, ix) => {
        writeScore(o, ["1位", "2位", "3位"][ix])
      })
    }
    const latest = WStorage.lastScore
    if (latest && 0 < latest) {
      y += 20
      writeScore(latest, "最新")
    }
    if (rc != null) {
      let rcc: Phaser.Geom.Rectangle = rc
      this.add.rectangle(rcc.centerX, rcc.centerY, rcc.width, rcc.height, 0xffffff)
        .setDepth(depth.scoreBase).setAlpha(0.5)
    }
  }
  addLinks() {
    let y = this.sys.game.canvas.height - 12;
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'sans-serif',
      color: "black",
      padding: { x: 3, y: 3 },
      fontSize: "19px",
      backgroundColor: "#ffffff66",
      lineSpacing: 10,
    };
    [
      ["Source code and license", "https://github.com/nabetani/game2402/"],
      ["鍋谷武典 @ タイッツー", "https://taittsuu.com/users/nabetani"],
      ["制作ノート", "https://nabetani.hatenadiary.com/entry/2024/01/game24c"],
      ["タイッツー #" + this.tag, "https://taittsuu.com/search/taiitsus/hashtags?query=" + this.tag],
    ].forEach((e, ix) => {
      const text = this.add.text(500, y, e[0], style)
      text.on("pointerdown", () => {
        this.setLocation(e[1]);
      })
      text.setOrigin(1, 1).setInteractive()
      y = text.getBounds().top - 10;
    });
  }
}
