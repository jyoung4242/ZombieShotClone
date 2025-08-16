import {
  Actor,
  Collider,
  CollisionContact,
  Color,
  Engine,
  KeyEvent,
  Keys,
  RotationType,
  Scene,
  Side,
  TileMap,
  toRadians,
  Vector,
} from "excalibur";
import { Resources } from "../resources";
import { Bullett } from "./Bullet";
import { Signal } from "../Lib/Signals";
import { Zombie } from "./Zombie";
import { sndManager } from "../main";
export class Player extends Actor {
  maxSpeed = 100;
  scene: Scene | null = null;
  isUpPressed = false;
  isDownPressed = false;
  isLeftPressed = false;
  isRightPressed = false;
  tmap: TileMap | null = null;
  ammo = 24;
  ammoMax = 24;
  clip = 6;
  maxClip = 6;
  health = 15;
  healthMax = 15;
  fireTik = 0;
  fireRate = 1000;
  canFire: boolean = true;

  // cool off
  isInvincible = false;
  damageTimeout = 0;
  damageTimeLimit = 2000;

  //Signals
  fireSignal = new Signal("fire");
  reloadSignal = new Signal("reload");
  healSignal = new Signal("heal");
  takeDamageSignal = new Signal("takeDamage");
  gameOverSignal = new Signal("gameOver");
  uiresetSignal = new Signal("resetGame");
  playerUpgradeSignal = new Signal("playerUpgrade");

  constructor() {
    super({
      radius: 25,
      z: 4,
      x: 0,
      y: 0,
      anchor: Vector.Half,
      rotation: 0,
    });
    this.graphics.use(Resources.player.toSprite());
  }

  onInitialize(engine: Engine): void {
    engine.currentScene.camera.strategy.lockToActor(this);
    engine.currentScene.camera.zoom = 0.75;
    this.reloadSignal.send([this.clip, this.ammo]);
    this.gameOverSignal.listen(() => {
      this.health = 15;
      this.healthMax = 15;
      this.ammo = 24;
      this.clip = 6;
      engine.goToScene("gameover", { sceneActivationData: { player: this, levelUp: false } });
    });
    this.playerUpgradeSignal.listen((e: CustomEvent) => {
      const upgrade = e.detail.params[0];
      switch (upgrade) {
        case "upgradeHealth":
          this.healthMax += 5;
          this.health = this.healthMax;

          break;
        case "upgradeFireRate":
          this.fireRate = this.fireRate * 0.8;
          break;
        case "upgradeClip":
          this.maxClip += 2;
          this.clip = this.maxClip;
          this.ammo = this.ammoMax;
          break;
        case "upgradeSpeed":
          this.maxSpeed += 10;
          break;
        case "upgradeAmmo":
          this.ammoMax += 6;
          break;
      }
      //reset all player stats
      this.ammo = this.ammoMax;
      this.health = this.healthMax;
      this.clip = this.maxClip;
      //update UI
      this.reloadSignal.send([this.clip, this.ammo]);
      this.healSignal.send([this.health]);
    });
  }

  onKeyDown(event: KeyEvent) {
    switch (event.key) {
      case Keys.ArrowUp:
      case Keys.W:
        this.isUpPressed = true;
        break;
      case Keys.ArrowDown:
      case Keys.S:
        this.isDownPressed = true;
        break;
      case Keys.ArrowLeft:
      case Keys.A:
        this.isLeftPressed = true;
        break;
      case Keys.ArrowRight:
      case Keys.D:
        this.isRightPressed = true;
        break;
      case Keys.R:
        //reload logic
        if (this.clip == this.maxClip) return;
        if (this.ammo == 0) return;
        sndManager.play("reload");
        if (this.ammo > this.maxClip) {
          this.ammo -= this.maxClip - this.clip;
          this.clip = this.maxClip;
        } else {
          // ammo is below or equal to  max clip
          let ammoNeededToReload = this.maxClip - this.clip;

          if (this.ammo < ammoNeededToReload) {
            this.clip += this.ammo;
            this.ammo = 0;
          } else {
            this.ammo -= ammoNeededToReload;
            this.clip = this.maxClip;
          }
        }
        this.reloadSignal.send([this.clip, this.ammo]);
        break;
    }
  }

  onKeyUp(event: KeyEvent) {
    switch (event.key) {
      case Keys.ArrowUp:
      case Keys.W:
        this.isUpPressed = false;
        break;
      case Keys.ArrowDown:
      case Keys.S:
        this.isDownPressed = false;
        break;
      case Keys.ArrowLeft:
      case Keys.A:
        this.isLeftPressed = false;
        break;
      case Keys.ArrowRight:
      case Keys.D:
        this.isRightPressed = false;
        break;
    }
  }

  fire() {
    if (!this.canFire) return;
    if (!this.scene) return;
    if (this.clip <= 0) {
      sndManager.play("reloadFailed");
      return;
    }
    this.canFire = false;
    sndManager.play("shoot");
    this.clip--;
    this.scene.add(new Bullett(this.pos, this.scene.input.pointers.primary.lastWorldPos));
    this.fireSignal.send();
  }

  registerScene(scene: Scene, tilemap: TileMap) {
    this.scene = scene;
    this.tmap = tilemap;
  }

  getPickup(type: "health" | "ammo", amount: number) {
    switch (type) {
      case "health":
        this.health += amount;
        if (this.health > this.healthMax) this.health = this.healthMax;
        this.healSignal.send([this.health]);
        break;
      case "ammo":
        this.ammo += amount;
        if (this.ammo > this.ammoMax) this.ammo = this.ammoMax;
        this.reloadSignal.send([this.clip, this.ammo]);
        break;
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    //cool of timer for fire rate
    if (!this.canFire) {
      this.fireTik += elapsed;
      if (this.fireTik > this.fireRate) {
        this.canFire = true;
        this.fireTik = 0;
      }
    }

    //cool of timer for damage
    if (this.isInvincible) {
      this.damageTimeout += elapsed;
      if (this.damageTimeout > this.damageTimeLimit) {
        this.isInvincible = false;
        this.damageTimeout = 0;
        this.graphics.opacity = 1;
      }
    }

    // use Mouse position to change rotation
    let mousePos = engine.input.pointers.primary.lastWorldPos;
    let diff = mousePos.sub(this.pos);
    this.rotation = diff.toAngle();

    //use key bindings to change vel
    if (this.isUpPressed) this.vel.y -= 1 * elapsed;
    if (this.isDownPressed) this.vel.y += 1 * elapsed;
    if (this.isLeftPressed) this.vel.x -= 1 * elapsed;
    if (this.isRightPressed) this.vel.x += 1 * elapsed;

    //maxspeed check
    if (this.vel.x > this.maxSpeed) this.vel.x = this.maxSpeed;
    if (this.vel.y > this.maxSpeed) this.vel.y = this.maxSpeed;
    if (this.vel.x < -this.maxSpeed) this.vel.x = -this.maxSpeed;
    if (this.vel.y < -this.maxSpeed) this.vel.y = -this.maxSpeed;

    // check for no keypress and zero out vel
    if (!this.isUpPressed && !this.isDownPressed) this.vel.y = 0;
    if (!this.isLeftPressed && !this.isRightPressed) this.vel.x = 0;

    //check for tilemap edge collision and stop
    if (this.pos.x < this.width / 2 && this.vel.x < 0) this.vel.x = 0;
    if (this.pos.x > this.tmap!.width - this.width / 2 && this.vel.x > 0) this.vel.x = 0;
    if (this.pos.y < this.height / 2 && this.vel.y < 0) this.vel.y = 0;
    if (this.pos.y > this.tmap!.height - this.height / 2 && this.vel.y > 0) this.vel.y = 0;
  }

  get currentPosition() {
    return this.pos.clone();
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof Zombie && !(other.owner as Zombie).isDead && !this.isInvincible) {
      //damage player
      const damage = other.owner.attackPower;
      this.health -= damage;
      this.takeDamageSignal.send([damage]);
      this.isInvincible = true;
      this.actions.flash(Color.White, 2000);
      this.graphics.opacity = 0.6;
      sndManager.play("hit");

      if (this.health <= 0) {
        this.health = 0;
        this.gameOverSignal.send();
        this.uiresetSignal.send();
      }
    }
  }
}
