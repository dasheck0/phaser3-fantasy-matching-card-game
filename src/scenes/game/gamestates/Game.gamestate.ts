import { GameStateNs, PrefabStore, Text } from '@dasheck0/phaser-boilerplate';
import MemoryBoard, { PlayerType } from '../../../prefabs/MemoryBoard.prefab';
import { GameState } from './states';

export class GameGameState extends GameStateNs.GameState {
  private memoryBoard: MemoryBoard | null = null;
  private points: { [key in PlayerType]: number } = { human: 0, ai: 0 };

  canTransitionTo(): string[] {
    return [GameState.GAME_OVER];
  }

  onEnter(): void {
    const playerText = PrefabStore.getInstance().getPrefab<Text>('playerPoints');
    const aiText = PrefabStore.getInstance().getPrefab<Text>('aiPoints');

    this.memoryBoard = PrefabStore.getInstance().getPrefab<MemoryBoard>('gameboard');
    this.memoryBoard.setOnGameOver(() => {
      console.log('game is over');

      this.finiteStateMachine?.transitionTo(GameState.GAME_OVER);
    });

    this.memoryBoard.setOnPairFound((tiles, player) => {
      this.points[player] += 1;

      playerText.setText(`Player: ${this.points.human}`);
      aiText.setText(`AI: ${this.points.ai}`);
    });
  }

  onExit(): void {}

  update(): void {
    this.memoryBoard?.update();
  }

  getName(): string {
    return GameState.GAME;
  }
}
