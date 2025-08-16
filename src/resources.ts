// resources.ts

//images
import { FontSource, ImageSource, Loader, Sound, Sprite, SpriteSheet } from "excalibur";
import player from "./Assets/graphics/player.png";
import ammoIcon from "./Assets/graphics/ammo_icon.png";
import ammoPickup from "./Assets/graphics/ammo_pickup.png";
import tileSheet from "./Assets/graphics/background_sheet.png";
import background from "./Assets/graphics/background.png";
import bloater from "./Assets/graphics/bloater.png";
import blood from "./Assets/graphics/blood.png";
import chaser from "./Assets/graphics/chaser.png";
import crawler from "./Assets/graphics/crawler.png";
import crosshair from "./Assets/graphics/crosshair.png";
import healthPickup from "./Assets/graphics/health_pickup.png";
import helper from "./Assets/graphics/helpericon.png";

//fonts
import zombieFont from "./Assets/fonts/zombiecontrol.ttf";

//sounds
import hit from "./Assets/sound/hit.wav";
import shoot from "./Assets/sound/shoot.wav";
import reload from "./Assets/sound/reload.wav";
import pickup from "./Assets/sound/pickup.wav";
import powerup from "./Assets/sound/powerup.wav";
import reloadFailed from "./Assets/sound/reload_failed.wav";
import splat from "./Assets/sound/splat.wav";
import bgm from "./Assets/sound/bgm.mp3";
import moan from "./Assets/sound/moan.mp3";

export const Resources = {
  player: new ImageSource(player),
  ammoIcon: new ImageSource(ammoIcon),
  ammoPickup: new ImageSource(ammoPickup),
  tileSheet: new ImageSource(tileSheet),
  background: new ImageSource(background),
  bloater: new ImageSource(bloater),
  blood: new ImageSource(blood),
  chaser: new ImageSource(chaser),
  crawler: new ImageSource(crawler),
  crosshair: new ImageSource(crosshair),
  healthPickup: new ImageSource(healthPickup),
  helper: new ImageSource(helper),
  zombieFont: new FontSource(zombieFont, "zombieFont", {}),
  hit: new Sound(hit),
  shoot: new Sound(shoot),
  reload: new Sound(reload),
  pickup: new Sound(pickup),
  powerup: new Sound(powerup),
  reloadFailed: new Sound(reloadFailed),
  splat: new Sound(splat),
  bgm: new Sound(bgm),
  moan: new Sound(moan),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
