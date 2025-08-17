// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, KeyEvent, SoundManger, SoundManagerOptions } from "excalibur";
import { model, template } from "./UI/UI";
import { loader, Resources } from "./resources";
import { Player } from "./Actors/Player";
import { GameOverScene } from "./Scene/GameOver";
import { GameScene } from "./Scene/GameScene";
import { Signal } from "./Lib/Signals";

await UI.create(document.body, model, template).attached;

let resolutionSignal = new Signal("updateResolution");
let sceneSignal = new Signal("changeScene");
let engineSignal = new Signal("engine");

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
  scenes: {
    game: {
      scene: GameScene,
    },
    gameover: {
      scene: GameOverScene,
    },
  },
});

//get hiscore from localStorage
const hiscore = localStorage.getItem("ZombieCloneHiScore");
if (hiscore) {
  model.hiScore = parseInt(hiscore);
  let hiScoreLoadSignal = new Signal("hiScoreLoad");
  hiScoreLoadSignal.send([hiscore]);
}

sceneSignal.send(["none"]);
engineSignal.listen((e: CustomEvent) => {
  game.goToScene(e.detail.params[0], { sceneActivationData: { player, levelUp: e.detail.params[1] } });
});

await game.start(loader);

const sndManagerOp: SoundManagerOptions = {
  channels: ["sfx", "bgm"],
  volume: 0.75,
  sounds: {
    hit: { sound: Resources.hit, channels: ["sfx"], volume: 0.75 },
    shoot: { sound: Resources.shoot, channels: ["sfx"], volume: 0.75 },
    reload: { sound: Resources.reload, channels: ["sfx"], volume: 0.75 },
    pickup: { sound: Resources.pickup, channels: ["sfx"], volume: 0.75 },
    powerup: { sound: Resources.powerup, channels: ["sfx"], volume: 0.75 },
    reloadFailed: { sound: Resources.reloadFailed, channels: ["sfx"], volume: 0.75 },
    splat: { sound: Resources.splat, channels: ["sfx"], volume: 0.75 },
    bgm: { sound: Resources.bgm, channels: ["bgm"], volume: 0.5, loop: true },
  },
};

export const sndManager = new SoundManger(sndManagerOp);

const player = new Player();
game.goToScene("gameover", { sceneActivationData: { player, levelUp: false } });
sndManager.play("bgm");
resolutionSignal.send([800, 600]);
game.input.keyboard.on("press", (e: KeyEvent) => {
  player.onKeyDown(e);
});
game.input.keyboard.on("release", (e: KeyEvent) => {
  player.onKeyUp(e);
});
game.input.pointers.primary.on("down", () => player.fire());
game.input.pointers.primary.on("up", () => player.ceasefire());
