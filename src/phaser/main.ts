// src/phaser/main.ts

import Phaser from "phaser";
import FishingScene from "./scenes/FishingScene";
import VillageScene from "./scenes/VillageScene";

export const initGame = (): Phaser.Game => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    scene: [VillageScene, FishingScene],
    physics: {
      default: "arcade",
    },
    backgroundColor: "#1e1e1e",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: true,
    },
  };

  return new Phaser.Game(config);
};
