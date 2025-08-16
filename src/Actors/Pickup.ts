import { Actor, Collider, CollisionContact, CollisionType, Engine, Random, Side, TileMap, vec, Vector } from "excalibur";
import { Resources } from "../resources";
import { PickupCollider } from "../Lib/ColliderGroups";
import { Player } from "./Player";
import { sndManager } from "../main";
import { Signal } from "../Lib/Signals";

const pickupType = {
  ammo: Resources.ammoPickup.toSprite(),
  health: Resources.healthPickup.toSprite(),
} as const;

export class PickUp extends Actor {
  rng: Random = new Random();
  type: "ammo" | "health";
  isAvailable = false;
  value = 0;
  hiddenTime = 0;
  visibleTime = 0;
  hiddenTimeLimit = 2000;
  visibleTimeLimit = 10000;
  map: TileMap | null = null;
  newWaveSignal = new Signal("incrementWave");
  scoreUpdateSignal = new Signal("scoreUpdate");
  activeCollisions: Set<Player> = new Set();

  constructor(type: keyof typeof pickupType) {
    super({
      radius: 25,
      z: 2,
      anchor: Vector.Half,
      rotation: 0,
      collisionType: CollisionType.Passive,
      collisionGroup: PickupCollider,
    });
    this.type = type;
    this.graphics.add("ammo", Resources.ammoPickup.toSprite());
    this.graphics.add("health", Resources.healthPickup.toSprite());
    this.graphics.hide();

    if (this.type == "ammo") {
      this.value = this.rng.integer(6, 15);
    } else {
      this.value = this.rng.integer(5, 15);
    }

    this.newWaveSignal.listen((e: CustomEvent) => {
      //resets values
      if (this.type == "ammo") {
        this.value = this.rng.integer(6, 15);
      } else {
        this.value = this.rng.integer(5, 15);
      }
    });
  }

  onInitialize(engine: Engine): void {
    this.isAvailable = false;
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (!this.isAvailable) return;
    if (other.owner instanceof Player) {
      this.activeCollisions.add(other.owner);
    }
  }

  onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof Player) this.activeCollisions.delete(other.owner);
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (!this.map) return;

    //collision logic here
    if (this.activeCollisions.size > 0 && this.isAvailable) {
      const other = this.activeCollisions.values().next().value;
      if (!other) return;
      other.getPickup(this.type, this.value);
      this.pos = findRandomSpotOnMap(this.map!);
      this.visibleTimeLimit *= 1.1;
      this.hiddenTimeLimit *= 0.9;
      this.value = this.value + Math.floor(this.value * 0.25);
      this.isAvailable = false;
      this.graphics.hide();
      this.visibleTime = 0;
      this.hiddenTime = 0;
      if (this.type == "ammo") sndManager.play("reload");
      else sndManager.play("pickup");
      this.scoreUpdateSignal.send([5]);
    }

    if (!this.isAvailable) this.hiddenTime += elapsed;
    if (this.isAvailable) this.visibleTime += elapsed;

    if (this.visibleTime > this.visibleTimeLimit) {
      this.visibleTime = 0;
      this.hiddenTime = 0;
      this.isAvailable = false;
      this.graphics.hide();
    }

    if (this.hiddenTime > this.hiddenTimeLimit) {
      this.hiddenTime = 0;
      this.visibleTime = 0;
      this.isAvailable = true;
      //randomly spawn somewhere on the map
      this.pos = findRandomSpotOnMap(this.map!);
      this.graphics.use(this.type);
    }
  }

  get currentPosition() {
    return this.pos.clone();
  }

  registerMap(map: TileMap) {
    this.map = map;
  }

  get available() {
    return this.isAvailable;
  }
}

function findRandomSpotOnMap(map: TileMap): Vector {
  let rng = new Random();
  let randomX = rng.integer(30, map.width - 30);
  let randomY = rng.integer(30, map.height - 30);
  return vec(randomX, randomY);
}
