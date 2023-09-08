import { GameStateNs, ImageButton, PrefabStore } from '@dasheck0/phaser-boilerplate';
import { GameState } from './states';

export class GameOverGameState extends GameStateNs.GameState {
  canTransitionTo(): string[] {
    return [GameState.PRE_GAME];
  }

  onEnter(): void {
    const restartButton = PrefabStore.getInstance().getPrefab<ImageButton>('restartButton');

    restartButton.onClick(() => {
      this.finiteStateMachine?.transitionTo(GameState.PRE_GAME);
    });
  }

  onExit(): void {}

  update(): void {}

  getName(): string {
    return GameState.GAME_OVER;
  }
}
