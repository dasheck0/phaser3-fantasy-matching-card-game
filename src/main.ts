import Phaser from 'phaser';

import { Config, PrefabStore } from '@dasheck0/phaser-boilerplate';
import GameScene from './scenes/game/GameScene';

(async () => {
  const modules = await import.meta.glob('./**/*.prefab.ts');
  await PrefabStore.getInstance().loadPrefabs(modules);

  Config.getInstance().enviroment = {
    dimension: {
      width: 1366,
      height: 1366,
    },
    backgroundColor: '#000000',
    debug: true,
    typography: {
      fontFamily: 'bridgnorth',
      baseFontSize: 32,
      scale: 'minor_third',
    },
  };

  Config.getInstance().enviroment.debug = false;

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
