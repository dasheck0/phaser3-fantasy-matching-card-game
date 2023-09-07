import { BaseScene } from '@dasheck0/phaser-boilerplate';
import { PreGameGameState } from './gamestates/PreGame.gamestate';

export default class GameScene extends BaseScene {
  constructor() {
    super('game');
  }

  protected postCreate(): void {
    this.stateMachine.registerGameStates([new PreGameGameState()], 'PreGame');
  }
}
