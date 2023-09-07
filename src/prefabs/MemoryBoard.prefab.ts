import { BaseOptions, BasePrefab, BaseScene, RegisterPrefab } from '@dasheck0/phaser-boilerplate';
import { sampleAndConsume } from '../utils';
import Grid from './Grid.prefab';
import Tile from './Tile.prefab';

export interface MemoryBoardOptions extends BaseOptions {
  rowCount: number;
  columnCount: number;
  group: string;
  covers: string[];
  backCover: string;
}

@RegisterPrefab('MemoryBoard')
export default class MemoryBoard implements BasePrefab {
  private grid: Grid;
  private tiles: Tile[] = [];

  constructor(private readonly name: string, private readonly scene: BaseScene, private readonly options: MemoryBoardOptions) {
    this.grid = new Grid('gameboard', scene, {
      rowCount: options.rowCount,
      columnCount: options.columnCount,
      position: { x: 0.5, y: 0.5, relative: true },
      dimension: { width: 500, height: 500 },
      group: 'game',
    });

    this.grid.initialize();
  }

  initialize(): void {
    this.tiles = [];

    const coversToConsume = this.constructConsumableCoversArray();

    for (let x = 0; x < this.options.columnCount; x++) {
      for (let y = 0; y < this.options.rowCount; y++) {
        const tile = new Tile(`tile_${x}_${y}`, this.scene, {
          key: sampleAndConsume(coversToConsume),
          backKey: 'sample',
          group: 'game',
          type: 'Sprite',
          onFaceRevealed: this.onFaceRevealed.bind(this),
        });

        tile.initialize();
        this.tiles.push(tile);
      }
    }

    this.grid.setItems(this.tiles);
  }

  shutdown(): void {
    this.tiles.forEach(tile => tile.shutdown());
  }

  restart(): void {
    this.shutdown();
    this.initialize();
  }

  public lock(isLocked: boolean): void {
    this.tiles.forEach(tile => tile.lock(isLocked));
  }

  private onFaceRevealed(): void {
    const revealedTiles = this.tiles.filter(tile => tile.getCurrentState() === 'front');
    console.log('revealedTiles', revealedTiles);

    if (revealedTiles.length === 2) {
      this.delay(500).then(() => {
        if (this.checkIfTilesMatch(revealedTiles)) {
          this.removeTilesFromGame(revealedTiles);
          this.lock(false);
        } else {
          revealedTiles.forEach(tile => tile.show('back'));
          this.lock(true);
        }
      });
    }

    if (revealedTiles.length === 0) {
      this.lock(false);
    }
  }

  private checkIfTilesMatch(tiles: Tile[]): boolean {
    return tiles.length >= 2 && tiles.every(tile => tile.getCoverKey() === tiles[0].getCoverKey());
  }

  private removeTilesFromGame(tiles: Tile[]): void {
    this.tiles = this.tiles.filter(tile => !tiles.includes(tile));
    tiles.forEach(tile => tile.shutdown());
  }

  private constructConsumableCoversArray(): string[] {
    const minimumCoverCount = (this.options.rowCount * this.options.columnCount) / 2;

    if (this.options.covers.length < minimumCoverCount) {
      throw new Error(`Not enough covers provided. Minimum cover count is ${minimumCoverCount}`);
    }

    const covers = this.options.covers.slice(0, minimumCoverCount);
    return [...covers, ...covers];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
