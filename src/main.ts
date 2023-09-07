import Phaser from 'phaser';

import { Config, PrefabStore } from '@dasheck0/phaser-boilerplate';
import GameScene from './scenes/game/GameScene';

(async () => {
  const modules = await import.meta.glob('./**/*.prefab.ts');
  await PrefabStore.getInstance().loadPrefabs(modules);

  Config.getInstance().enviroment.debug = true;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'app',
    width: Config.getInstance().enviroment.dimension.width,
    height: Config.getInstance().enviroment.dimension.height,
    backgroundColor: Config.getInstance().enviroment.backgroundColor,
    physics: {
      default: 'arcade',
      arcade: {},
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [GameScene],
  };

  const game = new Phaser.Game(config);

  game.scene.start('game', {
    configFile: 'scenes/game.scene.json',
  });
})();
