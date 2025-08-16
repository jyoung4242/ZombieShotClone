import { Engine, QuadIndexBuffer, Random, Scene, SceneActivationContext, TileMap, vec } from "excalibur";
import { generateTileMap } from "../TileMap.ts/Tilemap";
import { getWave } from "../UI/UI";
import { Player } from "../Actors/Player";
import { Signal } from "../Lib/Signals";
import { Zombie } from "../Actors/Zombie";
import { PickUp } from "../Actors/Pickup";
import { HealthBar } from "../Actors/HealthBar";
import { PickUpHelper } from "../Actors/pickupHelper";

export class GameScene extends Scene {
  rng: Random = new Random();
  incrementWaveSignal = new Signal("incrementWave");
  resolutionSignal = new Signal("updateResolution");
  sceneSignal = new Signal("changeScene");

  tmap: TileMap | null = null;
  player: Player | null = null;
  healthPickup: PickUp | null = null;
  ammoPickup: PickUp | null = null;
  screenWidth = 800;
  screenHeight = 600;

  showingHealthHelper = false;
  showingAmmoHelper = false;

  numZombies = 0;
  onInitialize(engine: Engine): void {
    this.incrementWaveSignal.send();
    this.resolutionSignal.listen((params: CustomEvent) => {
      this.screenWidth = params.detail.params[0];
      this.screenHeight = params.detail.params[1];
    });
  }

  onActivate(context: SceneActivationContext<{ player: Player }>): void {
    this.sceneSignal.send(["game"]);
    // Resetting new Wave Logic
    if (!context || !context.data) return;
    //generate a new tilemap
    if (this.tmap) {
      //remove the old map, null it out, and generate a new one
      this.remove(this.tmap);
      this.tmap = null;
    }
    this.tmap = generateTileMap(getWave());
    this.add(this.tmap);
    this.tmap.pos = vec(0, 0);
    //get centerpoint of tmap
    let centerpoint = vec(this.tmap.width / 2, this.tmap.height / 2);
    //Reset Player
    if (!this.player) {
      this.player = context.data.player;
    }
    this.player.pos = centerpoint;
    this.player.registerScene(this, this.tmap);
    this.add(this.player);

    //Zombie generation logic here
    // the number of zombies should be based on size of tmap area
    this.numZombies = Math.floor((this.tmap.width * this.tmap.height) / 30000);
    let edgePoints = getRandomBufferedEdgePoints(this.tmap.width, this.tmap.height, this.numZombies, 30);

    if (!this.player) return;
    for (let i = 0; i < this.numZombies; i++) {
      // add zombie to edge of map
      let { x, y } = edgePoints[i];
      let zombieType: "bloater" | "chaser" | "crawler" = this.rng.pickOne(["bloater", "chaser", "crawler"]);
      let zombie = new Zombie(zombieType, vec(x, y), this.player);
      this.add(zombie);
    }

    // setup health and ammo pickups
    if (!this.healthPickup || !this.ammoPickup) {
      this.healthPickup = new PickUp("health");
      this.ammoPickup = new PickUp("ammo");
    }

    this.add(this.healthPickup);
    this.add(this.ammoPickup);
    this.healthPickup.registerMap(this.tmap);
    this.ammoPickup.registerMap(this.tmap);
    this.add(new HealthBar(vec(this.screenWidth, this.screenHeight)));
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    // check if pickups are live and offscreen
    if (this.healthPickup?.isAvailable && this.healthPickup.isOffScreen) {
      if (!this.showingHealthHelper) console.log("showing ammo helper");

      if (!this.showingHealthHelper) {
        this.add(new PickUpHelper(this.player!, this.healthPickup));
        this.showingHealthHelper = true;
      }
    } else {
      if (this.showingHealthHelper) {
        //find helper in entities
        let helpers = engine.currentScene.entities.filter(e => e instanceof PickUpHelper && e.type == "health");
        helpers.forEach(h => h.kill());
        this.showingHealthHelper = false;
      }
    }

    if (this.ammoPickup?.isAvailable && this.ammoPickup.isOffScreen) {
      if (!this.showingAmmoHelper) console.log("showing ammo helper");

      if (!this.showingAmmoHelper) {
        this.add(new PickUpHelper(this.player!, this.ammoPickup));
        this.showingAmmoHelper = true;
      }
    } else {
      if (this.showingAmmoHelper) {
        //find helper in entities
        let helpers = engine.currentScene.entities.filter(e => e instanceof PickUpHelper && e.type == "ammo");
        helpers.forEach(h => h.kill());
        this.showingAmmoHelper = false;
      }
    }

    //check for all zombies being dead
    let zombies = engine.currentScene.entities.filter(e => e instanceof Zombie);
    let allZombiesDead = zombies.some(z => !z.isDead);

    if (!allZombiesDead) {
      engine.goToScene("gameover", { sceneActivationData: { player: this.player, levelUp: true } });
      zombies.forEach(z => z.kill());
      this.incrementWaveSignal.send();
      //new wave signal
    }
  }
}

function getRandomBufferedEdgePoints(width: number, height: number, count: number, padding: number): { x: number; y: number }[] {
  const edgePoints: { x: number; y: number }[] = [];

  // Top edge
  for (let i = padding; i < width - padding; i++) {
    edgePoints.push({ x: i, y: padding });
  }
  // Bottom edge
  for (let i = padding; i < width - padding; i++) {
    edgePoints.push({ x: i, y: height - 1 - padding });
  }
  // Left edge
  for (let j = padding + 1; j < height - 1 - padding; j++) {
    // avoid re-adding corners
    edgePoints.push({ x: padding, y: j });
  }
  // Right edge
  for (let j = padding + 1; j < height - 1 - padding; j++) {
    edgePoints.push({ x: width - 1 - padding, y: j });
  }

  // Shuffle and take 'count' points
  for (let i = edgePoints.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [edgePoints[i], edgePoints[rand]] = [edgePoints[rand], edgePoints[i]];
  }

  return edgePoints.slice(0, Math.min(count, edgePoints.length));
}
