import { BasePrefab, BaseScene, Config, Dimension2, Position, RegisterPrefab, Vector2 } from '@dasheck0/phaser-boilerplate';
import Phaser from 'phaser';

export interface GridOptions {
  rowCount: number;
  columnCount: number;
  position: Position;
  dimension: Dimension2;
  anchor?: Vector2;
  cellAlignment?:
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'centerLeft'
    | 'center'
    | 'centerRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight';
  group: string;
}

@RegisterPrefab('Grid')
export default class Grid implements BasePrefab {
  protected gridPositions: Vector2[] = [];
  protected items: { [key: number]: any } = {};
  protected background: Phaser.GameObjects.Graphics;

  constructor(private readonly name: string, private readonly scene: BaseScene, private readonly options: GridOptions) {
    this.gridPositions = [];
    this.background = this.scene.add.graphics();
  }

  public initialize(): void {
    this.gridPositions = [];

    const cellWidth = this.options.dimension.width / this.options.columnCount;
    const cellHeight = this.options.dimension.height / this.options.rowCount;

    const { x: anchorXOffsetMultiplier, y: anchorYOffsetMultiplier } = this.getCellAnchorOffsetMultiplier();
    const xOffset = (this.options.anchor?.x ?? 0.5) * this.options.dimension.width;
    const yOffset = (this.options.anchor?.y ?? 0.5) * this.options.dimension.height;

    const { x: positionX, y: positionY } = this.getPosition();

    this.background.clear();
    this.background.setPosition(positionX, positionY);
    // this.background.fillStyle(0x000000, 0.5);
    // this.background.fillRect(-xOffset, -yOffset, this.options.dimension.width, this.options.dimension.height);

    for (let rowIndex = 0; rowIndex < this.options.rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < this.options.columnCount; columnIndex++) {
        this.gridPositions.push({
          x: positionX + columnIndex * cellWidth - xOffset + cellWidth * anchorXOffsetMultiplier,
          y: positionY + rowIndex * cellHeight - yOffset + cellHeight * anchorYOffsetMultiplier,
        });

        this.layoutItem(columnIndex, rowIndex);
      }
    }
  }

  public shutdown(): void {}

  public setItem(columnIndex: number, rowIndex: number, item: any): void {
    if (columnIndex >= 0 && columnIndex < this.options.columnCount && rowIndex >= 0 && rowIndex < this.options.rowCount) {
      this.items[rowIndex * this.options.columnCount + columnIndex] = item;
      this.layoutItem(columnIndex, rowIndex);
    }
  }

  public setItems(items: any[]): void {
    items.forEach((item, index) => {
      this.items[index] = item;
      this.layoutItem(index % this.options.columnCount, Math.floor(index / this.options.columnCount));
    });
  }

  private layoutItem(columnIndex: number, rowIndex: number) {
    const index = rowIndex * this.options.columnCount + columnIndex;
    this.items[index]?.setPosition(this.gridPositions[index]);
  }

  private getCellAnchorOffsetMultiplier(): Vector2 {
    const cellAlignment = this.options.cellAlignment || 'center';

    switch (cellAlignment) {
      case 'topLeft':
        return { x: 0, y: 0 };
      case 'topCenter':
        return { x: 0.5, y: 0 };
      case 'topRight':
        return { x: 1, y: 0 };
      case 'centerLeft':
        return { x: 0, y: 0.5 };
      case 'center':
        return { x: 0.5, y: 0.5 };
      case 'centerRight':
        return { x: 1, y: 0.5 };
      case 'bottomLeft':
        return { x: 0, y: 1 };
      case 'bottomCenter':
        return { x: 0.5, y: 1 };
      case 'bottomRight':
        return { x: 1, y: 1 };
      default:
        return { x: 0.5, y: 0.5 };
    }
  }

  private getPosition(): Vector2 {
    return {
      x: this.options.position.x * (this.options.position.relative ? Config.getInstance().enviroment.dimension.width : 1),
      y: this.options.position.y * (this.options.position.relative ? Config.getInstance().enviroment.dimension.height : 1),
    };
  }
}
