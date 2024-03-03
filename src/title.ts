import * as Phaser from 'phaser';
import { BaseScene, stringizeScore } from './baseScene';
import { WStorage } from './wstorage';

const depth = {
  scoreBase: 10,
  scores: 20,
  rule: 30,
};

export class Title extends BaseScene {
  constructor() {
    super("Title")
  }
  preload() {
    this.load.image("title", `assets/title.webp`);
  }
  create() {
    const { width, height } = this.canvas();
    // const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x727171, 1);
    this.add.image(width / 2, height / 2, "title");
    const start = this.add.text(width / 2, height / 2 + 150, "Start", {
      fontFamily: 'sans-serif',
      color: "black",
      backgroundColor: "#fff6",
      padding: { x: 50, y: 20 },
      fontSize: "40px",
    });
    start.setOrigin(0.5, 0.5);
    start.setInteractive();
    start.on("pointerdown", () => {
      this.scene.start('GameMain');
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
    const soundBtns: Phaser.GameObjects.Text[] = [];
    const setSoundOn = (on: boolean) => {
      soundBtns[1].setScale(on ? 1 : 0.7);
      soundBtns[0].setScale(on ? 0.7 : 1);
      WStorage.setSoundOn(on)
    };
    for (const { str, on } of [
      { str: "Sound OFF", on: false },
      { str: "Sound ON", on: true },
    ]) {
      const x = soundBtns.length == 0 ? width : soundBtns.slice(-1)[0].getBounds().left - 10
      const t = this.add.text(0, 0, str, {
        fontFamily: "sans-serif",
        fontSize: "30px",
        fontStyle: "bold",
        backgroundColor: "#fff8",
        color: "black",
      }).setOrigin()
      const b = t.getBounds()
      t.setPosition(x - b.width / 2, b.height / 2 + 10)
      t.setInteractive().on("pointerdown", () => setSoundOn(on));
      soundBtns.push(t);
    }
    setSoundOn(WStorage.soundOn);
  }
  showRule() {
    const { width, height } = this.sys.game.canvas;
    const msg = [
      "タイツを合成して高レベルタイツを作ります。",
      "同一レベルの タ・イ・ツ を順に並べると", "合成できます。",
      "上下、左右のいずれでも OK。",
      "逆向きもでも OK なので ツ・イ・タ でも OK。",
      "",
      "盤面内のマスをタップすると、上下左右のタイツが", "タップしたマスに向かって集まってきます。",
      "盤面外にある三角形をタップした場合も同様です。",
      "",
      "※ フリックではありません。タップで移動です。",
      "※ タイツがあるところもタップできます。",
      "",
      "タイツを合成すると、以下の計算でスコアが増えます。",
      "　N = (合成のために失われるタイツの数-2)",
      "　L = (合成のために失われるタイツの最高レベル)",
      "　増えるスコア = (10のL乗)×N",
      "",
      "画面上端のゲージが右端に達したときと、なにか操作をした場合、盤面上に Level 1 タイツが生まれます。",
      "",
      "すべてのマスがタイツで埋まってしまったらゲームオーバーです。",
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
  drawBox(rc: Phaser.Geom.Rectangle) {
    const { width, height } = this.canvas()
    const right = width - rc.left
    const rcW = right - rc.left
    const g = this.add.graphics().setDepth(depth.scoreBase)
    const pad = 15
    g.fillStyle(0xffffff, 0.4);
    g.fillRoundedRect(rc.left - pad, rc.top - pad, rcW + pad * 2, rc.height + pad * 2, pad)
    g.lineStyle(10, 0xffffff, 1)
    g.strokeRoundedRect(rc.left - pad, rc.top - pad, rcW + pad * 2, rc.height + pad * 2, pad)
  }
  showScores() {
    let y = 200
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      color: "black",
      padding: { x: 3, y: 3 },
      fontSize: "20px",
      // backgroundColor: "#ffffff66",
      lineSpacing: 10,
    };
    const score = (WStorage.bestScores ?? [])[0]
    const best = (WStorage.bests ?? [])[0]
    const lastScore = WStorage.lastScore
    const lastBest = WStorage.lastBest

    let rc: Phaser.Geom.Rectangle | null = null
    const writeScore = (x: number, s: string) => {
      const t = this.add.text(x, y, s, style);
      t.setOrigin(0, 0).setDepth(depth.scores)
      rc = Phaser.Geom.Rectangle.Union(rc ?? t.getBounds(), t.getBounds())
      y = rc!.bottom + 5
    }
    const x0 = 50
    const x1 = x0 + 20
    if (best != null || lastBest != null) {
      writeScore(x0, "最高タイツレベル")
      if (best != null) { writeScore(x1, "過去最高: " + this.bestTightsText(best)) }
      if (lastBest != null) { writeScore(x1, "最新結果: " + this.bestTightsText(lastBest)) }
      this.drawBox(rc!)
    }
    rc = null
    if (score != null || lastScore != null) {
      y += 60
      writeScore(x0, "スコア")
      if (score != null) { writeScore(x1, "過去最高: " + stringizeScore(score) + "点") }
      if (lastScore != null) { writeScore(x1, "最新結果: " + stringizeScore(lastScore) + "点") }
      this.drawBox(rc!)
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
      ["制作ノート", "https://nabetani.hatenadiary.com/entry/2024/03/game24c"],
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
