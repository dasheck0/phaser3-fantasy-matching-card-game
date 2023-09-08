import { BaseOptions, BasePrefab, BaseScene, PrefabStore, RegisterPrefab } from '@dasheck0/phaser-boilerplate';
import { sampleAndConsume } from '../utils';
import AIPlayer from './AIPlayer.prefab';
import Grid from './Grid.prefab';
import Tile from './Tile.prefab';

export interface MemoryBoardOptions extends BaseOptions {
  rowCount: number;
  columnCount: number;
  group: string;
  covers: string[];
  backCover: string;
  width: number;
  height: number;
}

export type PlayerType = 'human' | 'ai';

@RegisterPrefab('MemoryBoard')
export default class MemoryBoard implements BasePrefab {
  private grid: Grid;
  private tiles: Tile[] = [];

  private playersTurn: PlayerType = 'human';
  private aiPlayerPhase: 'first' | 'second' = 'first';

  private aiPlayer: AIPlayer | null = null;

  private gameOver = false;

  private onPairFound?: (tile: Tile[], player: PlayerType) => void;
  private onGameOver?: () => void;

  constructor(private readonly name: string, private readonly scene: BaseScene, private readonly options: MemoryBoardOptions) {
    this.grid = new Grid('gameboard', scene, {
      rowCount: options.rowCount,
      columnCount: options.columnCount,
      position: { x: 0.5, y: 0.5, relative: true },
      dimension: { width: options.width, height: options.height },
      group: 'game',
    });

    this.grid.initialize();
  }

  public setOnPairFound(onPairFound: (tile: Tile[], player: PlayerType) => void): void {
    this.onPairFound = onPairFound;
  }

  public setOnGameOver(onGameOver: () => void): void {
    this.onGameOver = onGameOver;
  }

  initialize(): void {
    this.aiPlayer = PrefabStore.getInstance().getPrefab<AIPlayer>('ai');
    this.tiles = [];
    this.setGameOver(false);
    this.playersTurn = 'human';

    const coversToConsume = this.constructConsumableCoversArray();

    for (let x = 0; x < this.options.columnCount; x++) {
      for (let y = 0; y < this.options.rowCount; y++) {
        const tile = new Tile(`tile_${x}_${y}`, this.scene, {
          key: sampleAndConsume(coversToConsume),
          backKey: this.options.backCover,
          group: this.options.group,
          type: 'Sprite',
          onFaceRevealed: this.onFaceRevealed.bind(this),
          onFaceRevealStarted: this.onFaceRevealStarted.bind(this),
          gridPosition: { x, y },
        });

        tile.initialize();
        this.tiles.push(tile);
      }
    }

    this.grid.setItems(this.tiles);
    this.setGameOver(false);
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

  public lockForPlayer(isLocked: boolean): void {
    this.tiles.forEach(tile => tile.lockForPlayer(isLocked));
  }

  private canMakeMove(): boolean {
    return !this.tiles.some(tile => tile.isTileLocked());
  }

  private onFaceRevealStarted(tile: Tile): void {
    this.lock(true);
  }

  private onFaceRevealed(tile: Tile): void {
    this.aiPlayer?.recordAction(tile, tile.getGridPosition());

    const revealedTiles = this.tiles.filter(tile => tile.getCurrentState() === 'front');
    console.log('revealedTiles', revealedTiles, tile);

    if (revealedTiles.length === 2) {
      this.lock(true);

      this.delay(500).then(() => {
        this.lock(false);

        if (this.checkIfTilesMatch(revealedTiles)) {
          this.onPairFound?.(revealedTiles, this.playersTurn);
          this.removeTilesFromGame(revealedTiles);
          this.lock(false);
        } else {
          this.lock(true);
          revealedTiles.forEach((tile, index) => tile.show({ face: 'back', animate: true, force: true }));
        }
      });
    }

    if (revealedTiles.length === 0) {
      this.lock(false);
      this.togglePlayerTurn();
    }

    if (revealedTiles.length === 1) {
      this.lock(false);
    }
  }

  public togglePlayerTurn(): void {
    this.playersTurn = this.playersTurn === 'human' ? 'ai' : 'human';
  }

  public setGameOver(gameOver: boolean): void {
    this.gameOver = gameOver;
    this.lock(gameOver);
    this.lockForPlayer(gameOver);

    if (this.gameOver) {
      this.onGameOver?.();
    }
  }

  public update(): void {
    if (!this.gameOver) {
      if (this.playersTurn === 'ai' && this.canMakeMove() && this.aiPlayer) {
        if (this.aiPlayerPhase === 'first') {
          console.log('first phase');
          const gridPosition = this.aiPlayer.performFirstAction(this.tiles);
          const tile = this.tiles.find(tile => tile.getGridPosition().x === gridPosition.x && tile.getGridPosition().y === gridPosition.y);

          if (tile) {
            tile.toggle(true);
            this.aiPlayerPhase = 'second';
          }
        } else if (this.aiPlayerPhase === 'second') {
          console.log('second phase');
          const gridPosition = this.aiPlayer.performSecondAction(this.tiles);
          const tile = this.tiles.find(tile => tile.getGridPosition().x === gridPosition.x && tile.getGridPosition().y === gridPosition.y);

          if (tile) {
            tile.toggle(true);
            this.aiPlayerPhase = 'first';
          }
        }
      }

      if (this.tiles.length === 0) {
        this.setGameOver(true);
      }
    }
  }

  private checkIfTilesMatch(tiles: Tile[]): boolean {
    return tiles.length >= 2 && tiles.every(tile => tile.getCoverKey() === tiles[0].getCoverKey());
  }

  private removeTilesFromGame(tiles: Tile[]): void {
    this.aiPlayer?.forgetAllTilesWithCoverKey(tiles[0].getCoverKey());

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
