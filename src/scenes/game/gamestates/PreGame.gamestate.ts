import { GameStateNs, PrefabStore, Text } from '@dasheck0/phaser-boilerplate';
import AIPlayer from '../../../prefabs/AIPlayer.prefab';
import MemoryBoard from '../../../prefabs/MemoryBoard.prefab';
import { GameState } from './states';

export class PreGameGameState extends GameStateNs.GameState {
  canTransitionTo(): string[] {
    return [GameState.GAME];
  }

  onEnter(): void {
    PrefabStore.getInstance().getPrefab<Text>('playerPoints').setText(`Player: 0`);
    PrefabStore.getInstance().getPrefab<Text>('aiPoints').setText(`AI: 0`);
    PrefabStore.getInstance().getPrefab<MemoryBoard>('gameboard').restart();
    PrefabStore.getInstance().getPrefab<AIPlayer>('ai').initialize();

    this.finiteStateMachine?.transitionTo(GameState.GAME);
  }

  onExit(): void {}

  update(): void {}

  getName(): string {
    return GameState.PRE_GAME;
  }
}
