import { GameStateNs, PrefabStore, Text } from '@dasheck0/phaser-boilerplate';
import MemoryBoard from '../../../prefabs/MemoryBoard.prefab';
import ScoreBoard from '../../../prefabs/Scoreboard.prefab';
import { GameState } from './states';

export class GameGameState extends GameStateNs.GameState {
  private memoryBoard: MemoryBoard | null = null;

  canTransitionTo(): string[] {
    return [GameState.GAME_OVER];
  }

  onEnter(): void {
    const playerText = PrefabStore.getInstance().getPrefab<Text>('playerPoints');
    const aiText = PrefabStore.getInstance().getPrefab<Text>('aiPoints');
    const scoreBoard = PrefabStore.getInstance().getPrefab<ScoreBoard>('scoreboard');

    this.memoryBoard = PrefabStore.getInstance().getPrefab<MemoryBoard>('gameboard');
    this.memoryBoard.setOnGameOver(() => {
      this.finiteStateMachine?.transitionTo(GameState.GAME_OVER);
    });

    this.memoryBoard.setOnPairFound((tiles, player) => {
      scoreBoard.addPoint(player);

      playerText.setText(`Player: ${scoreBoard.getPoints('human')}`);
      aiText.setText(`AI: ${scoreBoard.getPoints('ai')}`);
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
