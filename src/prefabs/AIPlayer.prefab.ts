import { BaseOptions, BasePrefab, BaseScene, RegisterPrefab, Vector2 } from '@dasheck0/phaser-boilerplate';
import { sample } from '../utils';
import Tile from './Tile.prefab';

export interface AIPlayerOptions extends BaseOptions {
  memorySize: number;
}

export interface MemoryStackItem {
  tile: Tile;
  gridPosition: Vector2;
}

@RegisterPrefab('AIPlayer')
export default class AIPlayer implements BasePrefab {
  private memory: MemoryStackItem[] = [];
  private foundPair: boolean = false;

  constructor(private readonly name: string, private readonly scene: BaseScene, private readonly options: AIPlayerOptions) {}

  initialize(): void {
    this.memory = [];
  }

  shutdown(): void {}

  recordAction(tile: Tile, gridPosition: Vector2): void {
    if (this.memory.some(item => item.tile.getUniqueId() === tile.getUniqueId())) {
      return;
    }

    this.memory.unshift({ tile, gridPosition });

    if (this.memory.length > this.options.memorySize) {
      this.memory.pop();
    }
  }

  forgetAllTilesWithCoverKey(coverKey: string): void {
    this.memory = this.memory.filter(item => item.tile.getCoverKey() !== coverKey);
  }

  performFirstAction(availableTiles: Tile[]): Vector2 {
    console.log('Making first move. Searching memory', this.memory);

    const memoryItemsThatHaveTheSameCoverKey = this.memory.filter((item, index, array) => {
      console.log('Checking item', item);

      return array.some((otherItem, otherIndex) => {
        const relevantIndex = Math.max(index, otherIndex);
        return otherIndex !== index && otherItem.tile.getCoverKey() === item.tile.getCoverKey() && this.rememberBasedOnIndex(relevantIndex);
      });
    });

    console.log('Found memory items that have the same cover key', memoryItemsThatHaveTheSameCoverKey);

    if (memoryItemsThatHaveTheSameCoverKey.length > 0) {
      console.log('Found a pair. Will remember this for my second move');

      this.foundPair = true;
      return memoryItemsThatHaveTheSameCoverKey[0].gridPosition;
    }

    console.log('Found nothing. Will make a random move');
    return sample(availableTiles)?.getGridPosition();
  }

  performSecondAction(availableTiles: Tile[]): Vector2 {
    console.log('Making second move. Searching memory', this.memory);

    const openTile = availableTiles.find(tile => tile.getCurrentState() === 'front');
    const closedTiles = availableTiles.filter(tile => tile.getCurrentState() === 'back');

    console.log('Open tile', openTile);
    console.log('Closed tiles', closedTiles);

    if (openTile) {
      console.log('There is an open tile. Did I found a pair?', this.foundPair);

      const matchingTile = this.memory.find((item, index) => {
        if (item.tile.getUniqueId() === openTile.getUniqueId()) {
          return false;
        }

        return item.tile.getCoverKey() === openTile.getCoverKey() && (this.rememberBasedOnIndex(index) || this.foundPair);
      });

      if (matchingTile) {
        console.log('Found a matching tile. Will remember this for my first move');
        this.foundPair = false;
        return matchingTile.gridPosition;
      }
    }

    console.log('Found nothing. Will make a random move');
    return sample(closedTiles).getGridPosition();
  }

  private rememberBasedOnIndex(index: number): boolean {
    const percentage = index / this.options.memorySize;
    return Math.random() >= percentage;
  }
}
