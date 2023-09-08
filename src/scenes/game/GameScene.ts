import { BaseScene } from '@dasheck0/phaser-boilerplate';
import { GameGameState } from './gamestates/Game.gamestate';
import { GameOverGameState } from './gamestates/GameOver.gamestate';
import { PreGameGameState } from './gamestates/PreGame.gamestate';
import { GameState } from './gamestates/states';

export default class GameScene extends BaseScene {
  constructor() {
    super('game');
  }

  protected postCreate(): void {
    this.stateMachine.registerGameStates([new PreGameGameState(), new GameGameState(), new GameOverGameState()], GameState.PRE_GAME);
  }
}
