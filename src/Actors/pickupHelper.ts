import { Actor, Engine, Graphic, GraphicsGroup, ScreenElement, vec, Vector } from "excalibur";
import { PickUp } from "./Pickup";
import { Player } from "./Player";
import { Resources } from "../resources";

export class PickUpHelper extends ScreenElement {
  ammoGrahphic = Resources.ammoIcon.toSprite();
  healthGrahpic = Resources.healthPickup.toSprite();
  helperGraphic = Resources.helper.toSprite();
  player: Player;
  pickup: PickUp;
  type: "ammo" | "health" = "ammo";
  iconGraphic: Graphic;
  gg: GraphicsGroup;

  constructor(player: Player, pickup: PickUp) {
    super({
      width: 24,
      height: 24,
      z: 50,
    });
    this.type = pickup.type;
    this.iconGraphic = this.type == "ammo" ? this.ammoGrahphic : this.healthGrahpic;
    this.gg = new GraphicsGroup({
      members: [this.helperGraphic, { graphic: this.iconGraphic, offset: vec(1, 0) }],
      useAnchor: true,
    });

    this.ammoGrahphic.scale = new Vector(0.4, 0.4);
    this.healthGrahpic.scale = new Vector(0.4, 0.4);

    this.graphics.use(this.gg);
    this.player = player;
    this.pickup = pickup;
  }

  onInitialize(engine: Engine): void {
    calculatePositionOfHelper(this.player, this.pickup, this, engine);
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    calculatePositionOfHelper(this.player, this.pickup, this, engine);
  }
}

function calculatePositionOfHelper(player: Player, pickup: PickUp, helper: PickUpHelper, engine: Engine): void {
  // Get world positions
  const pickupWorldPos = pickup.currentPosition;
  const playerWorldPos = player.currentPosition;
  const pickupScreenPos = engine.worldToScreenCoordinates(pickupWorldPos);
  const playerScreenPos = engine.worldToScreenCoordinates(playerWorldPos);
  // Calculate direction in screen space
  const dirVector = pickupScreenPos.sub(playerScreenPos);
  const distance = dirVector.distance();

  console.log("************************************************************");
  console.log("helper type: ", helper.type);
  console.log("engine screen dims: ", engine.screen.width, engine.screen.height);
  console.log("camera zoom: ", engine.currentScene.camera.zoom);

  console.log("player world pos", playerWorldPos);
  console.log("player screen pos", playerScreenPos);
  console.log("pickup world pos", pickupWorldPos);
  console.log("pickup screen pos", pickupScreenPos);

  console.log("screendir vector", dirVector);
  console.log("screen distance", distance);

  // If pickup is at player position, exit early
  if (distance === 0) return;

  const dirNormal = dirVector.normalize();
  const margin = 15;

  console.log("screen direction normal", dirNormal);

  const leftBound = margin;
  const rightBound = engine.screen.viewport.width - margin - helper.width;
  const topBound = margin;
  const bottomBound = engine.screen.viewport.height - margin - helper.height;

  // Use player screen position as the starting point (since camera follows player)
  const centerX = playerScreenPos.x; // or engine.screen.center.x if player is always centered
  const centerY = playerScreenPos.y; // or engine.screen.center.y if player is always centered

  const tLeft = (leftBound - centerX) / dirNormal.x;
  const tRight = (rightBound - centerX) / dirNormal.x;
  const tTop = (topBound - centerY) / dirNormal.y;
  const tBottom = (bottomBound - centerY) / dirNormal.y;

  // More precise filtering based on direction
  const candidateT = [];

  // Moving left (negative x direction)
  if (dirNormal.x < 0 && tLeft > 0) {
    // Verify the y-coordinate is within bounds
    const y = centerY + dirNormal.y * tLeft;
    if (y >= topBound && y <= bottomBound) {
      candidateT.push({ t: tLeft, x: leftBound, y, edge: "left" });
    }
  }

  // Moving right (positive x direction)
  if (dirNormal.x > 0 && tRight > 0) {
    const y = centerY + dirNormal.y * tRight;
    if (y >= topBound && y <= bottomBound) {
      candidateT.push({ t: tRight, x: rightBound, y, edge: "right" });
    }
  }

  // Moving up (negative y direction)
  if (dirNormal.y < 0 && tTop > 0) {
    const x = centerX + dirNormal.x * tTop;
    if (x >= leftBound && x <= rightBound) {
      candidateT.push({ t: tTop, x, y: topBound, edge: "top" });
    }
  }

  // Moving down (positive y direction)
  if (dirNormal.y > 0 && tBottom > 0) {
    const x = centerX + dirNormal.x * tBottom;
    if (x >= leftBound && x <= rightBound) {
      candidateT.push({ t: tBottom, x, y: bottomBound, edge: "bottom" });
    }
  }

  console.log("valid candidates:", candidateT);

  if (candidateT.length === 0) {
    console.log("No valid intersections found!");
    return;
  }

  // Choose the SMALLEST positive t (first edge we hit)
  const chosen = candidateT.reduce((min, curr) => (curr.t < min.t ? curr : min));

  console.log("chosen t", chosen.t);

  // Calculate final position in screen coordinates
  const iconX = chosen.x;
  const iconY = chosen.y;

  // Clamp to bounds to be safe
  const clampedX = Math.max(leftBound, Math.min(rightBound, iconX));
  const clampedY = Math.max(topBound, Math.min(bottomBound, iconY));

  console.log("final screen position:", clampedX, clampedY);

  // Since we calculated in screen space, we need to convert back to world coordinates
  helper.pos = vec(clampedX, clampedY);
}
