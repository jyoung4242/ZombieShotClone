import { Actor, CollisionType, Color, Engine, Vector } from "excalibur";
import { BulletCollider } from "../Lib/ColliderGroups";

export class Bullett extends Actor {
  speed = 1000;
  range = 40000;
  distanceTraveled = 0;
  constructor(pos: Vector, targetVector: Vector) {
    super({
      pos,
      radius: 1.5,
      color: Color.White,
      collisionType: CollisionType.Passive,
      collisionGroup: BulletCollider,
    });

    let diffVector = targetVector.sub(this.pos);
    this.vel = diffVector.normalize().scale(this.speed);
  }

  onInitialize(engine: Engine): void {
    // colliders go here
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    // update distance traveled
    this.distanceTraveled += this.speed;
    if (this.distanceTraveled > this.range) this.kill();
  }
}
