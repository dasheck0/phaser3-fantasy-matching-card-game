import { BaseOptions, BasePrefab, RegisterPrefab } from '@dasheck0/phaser-boilerplate';
import { PlayerType } from './MemoryBoard.prefab';

export interface ScoreboardOptions extends BaseOptions {}

@RegisterPrefab('Scoreboard')
export default class ScoreBoard implements BasePrefab {
  private points: { [key in PlayerType]: number } = { human: 0, ai: 0 };

  constructor(private readonly name: string, private readonly scene: Phaser.Scene, private readonly options: ScoreboardOptions) {}

  initialize(): void {
    this.points = { human: 0, ai: 0 };
  }

  shutdown(): void {}

  addPoint(player: PlayerType): void {
    this.points[player] += 1;
  }

  getPoints(player: PlayerType): number {
    return this.points[player];
  }
}
