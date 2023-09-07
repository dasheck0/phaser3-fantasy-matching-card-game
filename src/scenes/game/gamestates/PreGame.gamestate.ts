import { GameStateNs, ImageButton, PrefabStore } from '@dasheck0/phaser-boilerplate';
import MemoryBoard from '../../../prefabs/MemoryBoard.prefab';

export class PreGameGameState extends GameStateNs.GameState {
  canTransitionTo(): string[] {
    return [];
  }

  onEnter(): void {
    const restartButton = PrefabStore.getInstance().getPrefab<ImageButton>('restartButton');
    const memoryBoard = PrefabStore.getInstance().getPrefab<MemoryBoard>('gameboard');

    restartButton.onClick(() => {
      memoryBoard.restart();
    });
  }

  onExit(): void {}

  update(): void {}

  getName(): string {
    return 'PreGame';
  }
}
