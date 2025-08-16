import { CollisionGroup } from "excalibur";

export const playerCollider = new CollisionGroup("Player", 0b0001, 0b1100);
export const BulletCollider = new CollisionGroup("Bullet", 0b0010, 0b0100);
export const ZombieCollider = new CollisionGroup("Zombie", 0b0100, 0b0011);
export const PickupCollider = new CollisionGroup("Pickup", 0b1000, 0b1000);
