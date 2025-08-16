import { TileMap, Random, SpriteSheet } from "excalibur";
import { Resources } from "../resources";

export function generateTileMap(wave: number): TileMap {
  let rng = new Random();
  let tilemapWidth = 2 * rng.integer(2, 4) * wave;
  let tilemapHeight = 2 * rng.integer(2, 4) * wave;
  let tMap = new TileMap({
    rows: tilemapHeight,
    columns: tilemapWidth,
    tileHeight: 50,
    tileWidth: 50,
  });

  const tmapSS = SpriteSheet.fromImageSource({
    image: Resources.tileSheet,
    grid: {
      rows: 4,
      columns: 1,
      spriteWidth: 50,
      spriteHeight: 50,
    },
  });

  for (let tile of tMap.tiles) {
    tile.addGraphic(tmapSS.getSprite(0, rng.integer(0, 3)));
  }

  return tMap;
}
