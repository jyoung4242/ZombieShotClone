import { Engine, Scene, SceneActivationContext } from "excalibur";
import { Player } from "../Actors/Player";
import { Signal } from "../Lib/Signals";

export class GameOverScene extends Scene {
  sceneSignal = new Signal("changeScene");

  onInitialize(engine: Engine): void {}

  onActivate(context: SceneActivationContext<{ player: Player; levelUp: boolean }>): void {
    if (context.data?.levelUp) this.sceneSignal.send(["levelup"]);
    else this.sceneSignal.send(["gameover"]);
  }
}
