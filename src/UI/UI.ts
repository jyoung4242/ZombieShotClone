import { Signal } from "../Lib/Signals";
import { sndManager } from "../main";

let enginesignal = new Signal("engine");

const playerUpgradeSignal = new Signal("playerUpgrade");

export const scenes = {
  game: "game",
  gameover: "gameover",
  none: "none",
  levelup: "levelup",
} as const;

export const model = {
  screenWidth: 0,
  screenHeight: 0,
  wave: 0,
  scene: scenes.none as typeof scenes.game,
  get isGameScene() {
    return this.scene === scenes.game;
  },
  get isGameOverScene() {
    //@ts-ignore
    return this.scene === scenes.gameover;
  },
  get isNoneScene() {
    //@ts-ignore
    return this.scene === scenes.none;
  },
  get isLevelUpScene() {
    //@ts-ignore
    return this.scene === scenes.levelup;
  },
  score: 0,
  hiScore: 0,
  ammo: 0,
  clip: 6,
  numberOfEnemies: 0,
  startGame: () => {
    enginesignal.send(["game"]);
  },
  upgradeClip: () => {
    sndManager.play("powerup");
    enginesignal.send(["game"]);
    playerUpgradeSignal.send(["upgradeClip"]);
  },
  upgradeFireRate: () => {
    sndManager.play("powerup");
    enginesignal.send(["game"]);
    playerUpgradeSignal.send(["upgradeFireRate"]);
  },
  upgradeHealth: () => {
    sndManager.play("powerup");
    enginesignal.send(["game"]);
    playerUpgradeSignal.send(["upgradeHealth"]);
  },
  upgradeSpeed: () => {
    sndManager.play("powerup");
    enginesignal.send(["game"]);
    playerUpgradeSignal.send(["upgradeSpeed"]);
  },
  upgradeAmmo: () => {
    sndManager.play("powerup");
    enginesignal.send(["game"]);
    playerUpgradeSignal.send(["upgradeAmmo"]);
  },
  mode: "prod" as "dev" | "prod",
  cursorPathDev: ".src/Assets/graphics/crosshair.png",
  cursorPathProd: "./graphics/crosshair.png",
  backgroundPathDev: ".src/Assets/graphics/background.png",
  backgroundPathProd: "./graphics/background.png",
  bulletIconPathDev: ".src/Assets/graphics/ammo_icon.png",
  bulletIconPathProd: "./graphics/ammo_icon.png",
  get cursorPath() {
    if (this.mode === "dev") {
      return this.cursorPathDev;
    } else {
      return this.cursorPathProd;
    }
  },
  get backgroundPath() {
    if (this.mode === "dev") {
      return this.backgroundPathDev;
    } else {
      return this.backgroundPathProd;
    }
  },
  get bulletIconPath() {
    if (this.mode === "dev") {
      return this.bulletIconPathDev;
    } else {
      return this.bulletIconPathProd;
    }
  },
};

export const template = `
<style> 


    @font-face {
        font-family: 'zombie';
        font-style: normal;
        font-weight: 400;
        src: url('\${cursorPath}');
    }

    canvas{ 
        position: fixed; 
        top:50%; 
        left:50%; 
        transform: translate(-50% , -50%);
        cursor: url('./graphics/crosshair.png') 55 55, auto;
    }
    
    button:hover{
        cursor: pointer;
    }

    #hud, #gameoverHud, #levelUpHUD{
        position: fixed;
        width: \${screenWidth}px;
        height: \${screenHeight}px;
        top:50%;
        left:50%;
        transform: translate(-50% , -50%);
        font-family: 'zombie';
        font-size: 1.5em;
        color: white;
        text-align: center;
        pointer-events: none;
    }
</style> 
<div> 
    <canvas id='cnv'> </canvas> 
    <div id='hud' \${===isGameScene}>
        <div style="position: absolute; width: auto; left:5%; top:0; margin-top: 20px;">
            Score: \${score}
        </div>
    
        <div style="position: absolute; width: auto; right:5%; top:0; margin-top: 20px;">
            HiScore: \${hiScore}
        </div>
    
        <div style="position: absolute; width: auto; right:5%; bottom:0; margin-top: 50px;">
            Wave: \${wave}
        </div>

         <div style="position: absolute; width: auto; left:2%; bottom:0; margin-top: 50px; display:flex; justify-content: space-between; align-items: center;">
            <img src='./graphics/ammo_icon.png' width='50px' height='50px'/>
            Clip: \${clip}
            Ammo: \${ammo}            
        </div>
    </div>

    <div id='gameoverHud' \${===isGameOverScene}>
        <span style="font-family: 'zombie'; position: absolute; width: 75%; left:50%; top:50%; transform: translate(-50% , -50%); font-size: 3em;">ZOMBIE SHOOTER CLONE</span> 
        <img src='\${backgroundPath}' width='\${screenWidth}px' height='\${screenHeight}px'/>
        <button \${click@=>startGame} style="pointer-events: all; position: absolute; top:75%; left:50%; transform: translate(-50%, -50%); border-radius: 20px; background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">START GAME</button>
    </div>

    <div id='levelUpHUD' \${===isLevelUpScene}>
        <span style="font-family: 'zombie'; position: absolute; width: 75%; left:50%; top:50%; transform: translate(-50% , -50%); font-size: 3em;">CHOOSE UPGRADE</span> 
        <img src='\${backgroundPath}' width='\${screenWidth}px' height='\${screenHeight}px'/>
        <div style="position: absolute; top:75%; left:50%; transform: translate(-50%, -50%);display: flex; justify-content: center;align-items: center;gap: 20px">
            <button \${click@=>upgradeFireRate} style="pointer-events: all;  border-radius: 20px; background-color: #4CAF50; border: none; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 12px;">INCREASE FIRE RATE</button>
            <button \${click@=>upgradeClip} style="pointer-events: all;  border-radius: 20px; background-color: #4CAF50; border: none; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 12px;">INCREASE CLIP CAPACITY</button>
            <button \${click@=>upgradeHealth} style="pointer-events: all;  border-radius: 20px; background-color: #4CAF50; border: none; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 12px;">INCREASE HEALTH</button>  
            <button \${click@=>upgradeSpeed} style="pointer-events: all;  border-radius: 20px; background-color: #4CAF50; border: none; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 12px;">INCREASE SPEED</button>  
             <button \${click@=>upgradeAmmo} style="pointer-events: all;  border-radius: 20px; background-color: #4CAF50; border: none; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 12px;">INCREASE AMMO CAPACITY</button>  
        </div>
      
    </div>

</div>`;

/********************************
Getters for State
*********************************/
export function getWave() {
  return model.wave;
}

/********************************
Signals for State
*********************************/

let incrementWaveSignal = new Signal("incrementWave");
incrementWaveSignal.listen(() => model.wave++);

let resetGameSignal = new Signal("resetGame");
resetGameSignal.listen(() => {
  writeDataTolocalStorage(model.hiScore);
  model.score = 0;
  model.clip = 6;
  model.ammo = 24;
  model.wave = 0;
});

let sceneSignal = new Signal("changeScene");
sceneSignal.listen((params: CustomEvent) => {
  model.scene = params.detail.params[0];
});

let resolutionSignal = new Signal("updateResolution");
resolutionSignal.listen((params: CustomEvent) => {
  model.screenWidth = params.detail.params[0];
  model.screenHeight = params.detail.params[1];
});

let fireSignal = new Signal("fire");
fireSignal.listen(() => {
  model.clip--;
});

let reloadSignal = new Signal("reload");
reloadSignal.listen((e: CustomEvent) => {
  model.clip = e.detail.params[0];
  model.ammo = e.detail.params[1];
});

let scoreSignal = new Signal("scoreUpdate");
scoreSignal.listen((e: CustomEvent) => {
  model.score += e.detail.params[0];
  if (model.score > model.hiScore) model.hiScore = model.score;
});

let hiScoreLoadSignal = new Signal("hiScoreLoad");
hiScoreLoadSignal.listen((e: CustomEvent) => {
  model.hiScore = e.detail.params[0];
});

const writeDataTolocalStorage = (hiscore: number) => {
  localStorage.setItem("ZombieCloneHiScore", hiscore.toString());
};
