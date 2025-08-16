import { Actor, Collider, CollisionContact, CollisionType, Engine, Random, Side, Vector } from "excalibur";
import { Resources } from "../resources";
import { ZombieCollider } from "../Lib/ColliderGroups";
import { Bullett } from "./Bullet";
import { Player } from "./Player";
import { Signal } from "../Lib/Signals";
import { sndManager } from "../main";

const zombieType = {
  bloater: Resources.bloater.toSprite(),
  chaser: Resources.chaser.toSprite(),
  crawler: Resources.crawler.toSprite(),
} as const;

export class Zombie extends Actor {
  scoreUpdateSignal = new Signal("scoreUpdate");
  isDead = false;
  rng: Random = new Random();
  attackPower = 0;
  hitpoints = 0;
  speed = 0;
  player: Player;
  constructor(type: keyof typeof zombieType, pos: Vector, player: Player) {
    super({
      radius: 22,
      z: 3,
      pos,
      anchor: Vector.Half,
      rotation: 0,
      collisionType: CollisionType.Passive,
      collisionGroup: ZombieCollider,
    });
    this.graphics.add(Resources.chaser.toSprite());
    this.graphics.add(Resources.bloater.toSprite());
    this.graphics.add(Resources.blood.toSprite());
    this.graphics.add(Resources.crawler.toSprite());
    this.graphics.use(zombieType[type]);

    switch (type) {
      case "bloater":
        this.attackPower = this.rng.integer(2, 4); //10;
        this.hitpoints = this.rng.integer(5, 12); //10;
        this.speed = this.rng.integer(25, 40); //30;
      case "chaser":
        this.attackPower = this.rng.integer(1, 2); //10;
        this.hitpoints = this.rng.integer(2, 6); //5;
        this.speed = this.rng.integer(40, 55); //50;
      case "crawler":
        this.attackPower = this.rng.integer(1, 2); //10;
        this.hitpoints = this.rng.integer(4, 9); //5;
        this.speed = this.rng.integer(8, 20); //30;
    }

    this.player = player;
  }

  get attackStrength() {
    return this.attackPower;
  }

  onInitialize(engine: Engine): void {}
  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    //check for bullet
    if (other.owner instanceof Bullett && !this.isDead) {
      other.owner.kill();
      this.hitpoints -= 1;
      sndManager.play("splat");
      if (this.hitpoints <= 0) {
        this.graphics.use(Resources.blood.toSprite());
        this.speed = 0;
        this.vel = Vector.Zero;
        this.isDead = true;
        this.z = 1;
        this.scoreUpdateSignal.send([10]);
      } else {
        this.scoreUpdateSignal.send([1]);
      }
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.isDead) return;
    // move towards player
    let diffVector = this.player.pos.sub(this.pos);
    this.vel = diffVector.normalize().scale(this.speed);
    //change rotation to face player
    this.rotation = diffVector.toAngle();
  }
}
