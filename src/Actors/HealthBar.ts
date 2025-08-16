import { Actor, Color, Engine, ScreenElement, vec, Vector } from "excalibur";
import { Signal } from "../Lib/Signals";

export class HealthBar extends ScreenElement {
  maxHealth = 15;
  health = 15;

  resetSignal = new Signal("resetGame");
  takeDamageSignal = new Signal("takeDamage");
  healSignal = new Signal("heal");
  playerUpgradeSignal = new Signal("playerUpgrade");

  constructor(res: Vector) {
    let width = res.x * 0.25;
    let pos = vec(res.x / 2 - width / 2, res.y - 20);
    super({
      width,
      height: 15,
      pos,
      scale: vec(1, 1),
      color: Color.Red,
      anchor: vec(0, 0), // Center the timer bar
      z: 50,
    });

    this.playerUpgradeSignal.listen((e: CustomEvent) => {
      if (e.detail.params[0] == "upgradeHealth") this.maxHealth += 5;
      this.health = this.maxHealth;
    });

    this.resetSignal.listen(() => {
      this.health = this.maxHealth;
    });
    this.takeDamageSignal.listen((e: CustomEvent) => {
      this.actions.flash(Color.White, 1000);
      let damage = e.detail.params[0];
      this.health -= damage;
      if (this.health < 0) this.health = 0;
    });
    this.healSignal.listen((e: CustomEvent) => {
      let heal = e.detail.params[0];
      this.health += heal;
      if (this.health > this.maxHealth) this.health = this.maxHealth;
    });
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    let percentTimeRemaining = this.health / this.maxHealth;
    this.scale.x = percentTimeRemaining;
  }
}
