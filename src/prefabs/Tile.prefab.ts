import { BaseOptions, BasePrefab, BaseScene, Sprite, Vector2 } from '@dasheck0/phaser-boilerplate';

export interface TileOptions extends BaseOptions {
  key: string;
  backKey: string;
  group: string;
  onFaceRevealStarted: (tile: Tile) => void;
  onFaceRevealed: (tile: Tile, newFace: TileFace) => void;
  gridPosition: Vector2;
}

export type TileFace = 'front' | 'back';

export interface ShowOptions {
  animate?: boolean;
  force?: boolean;
  face: TileFace;
  animationDelay?: number;
}

export default class Tile implements BasePrefab {
  protected sprite: Sprite;
  protected backSprite: Sprite;

  private hoverTween: Phaser.Tweens.Tween;

  private currentFace: TileFace = 'back';

  private onFaceRevealed: (tile: Tile, newFace: TileFace) => void;
  private onFaceRevealStarted: (tile: Tile) => void;

  private isCurrentlyAnimating = false;

  private isLocked = false;
  private isLockedForPlayer = false;

  private readonly animationDuration = 300;

  private uniqueId = Math.random();

  constructor(private readonly name: string, private readonly scene: BaseScene, private readonly options: TileOptions) {
    this.onFaceRevealed = options.onFaceRevealed;
    this.onFaceRevealStarted = options.onFaceRevealStarted;

    this.sprite = new Sprite(name, scene, {
      position: { x: 0, y: 0 },
      key: options.key,
      group: options.group,
      type: 'Sprite',
    });

    this.backSprite = new Sprite(`${name}_back`, scene, {
      position: { x: 0, y: 0 },
      key: options.backKey,
      group: options.group,
      type: 'Sprite',
    });

    this.sprite.setInteractive();
    this.backSprite.setInteractive();

    this.hoverTween = this.scene.tweens.add({
      targets: [this.sprite, this.backSprite],
      duration: 250,
      scaleX: { from: 1.0, to: 1.1 },
      scaleY: { from: 1.0, to: 1.1 },
      paused: true,
      loop: -1,
      yoyo: true,
    });

    this.sprite.on('pointerup', (pointer: PointerEvent) => {
      if (this.pointIntersectsRectangle({ x: pointer.x, y: pointer.y }, this.sprite.getBounds()) && !this.isLockedForPlayer) {
        console.log('on pointer down', this, this.isLockedForPlayer);
        this.toggle();
      }
    });

    this.backSprite.on('pointerup', (pointer: PointerEvent) => {
      if (this.pointIntersectsRectangle({ x: pointer.x, y: pointer.y }, this.sprite.getBounds()) && !this.isLockedForPlayer) {
        console.log('on pointer down', this, this.isLockedForPlayer);
        this.toggle();
      }
    });

    this.sprite.on('pointerover', () => {
      this.hoverTween.play();
    });

    this.backSprite.on('pointerover', () => {
      this.hoverTween.play();
    });

    this.sprite.on('pointerout', () => {
      this.hoverTween.pause();
      this.sprite.setScale(1);
    });

    this.backSprite.on('pointerout', () => {
      this.hoverTween.pause();
      this.backSprite.setScale(1);
    });
  }

  initialize(): void {
    this.show({ face: 'back', force: true });
    this.isLocked = false;
    this.isLockedForPlayer = false;
    this.isCurrentlyAnimating = false;

    console.log('tile', this.currentFace);
  }

  shutdown(): void {
    this.sprite.off('pointerover');
    this.sprite.off('pointerout');
    this.sprite.off('pointerup');
    this.backSprite.off('pointerover');
    this.backSprite.off('pointerout');
    this.backSprite.off('pointerup');

    this.hoverTween.destroy();
    this.sprite.destroy();
    this.backSprite.destroy();
  }

  setPosition(position: Vector2): void {
    this.sprite.setPosition(position.x, position.y);
    this.backSprite.setPosition(position.x, position.y);
  }

  setAnchor(anchor: Vector2): void {
    this.sprite.setOrigin(anchor.x, anchor.y);
    this.backSprite.setOrigin(anchor.x, anchor.y);
  }

  getCoverKey(): string {
    return this.options.key;
  }

  getGridPosition(): Vector2 {
    return this.options.gridPosition;
  }

  isTileLocked(): boolean {
    return this.isLocked;
  }

  getUniqueId(): number {
    return this.uniqueId;
  }

  show({ face, animate, force, animationDelay }: ShowOptions): void {
    if ((!this.isCurrentlyAnimating && !this.isLocked) || force) {
      if (this.currentFace !== face || force) {
        const appearingSprite = face === 'front' ? this.sprite : this.backSprite;
        const disappearingSprite = face === 'front' ? this.backSprite : this.sprite;

        if (animate) {
          this.isCurrentlyAnimating = true;
          this.hoverTween.pause();

          this.onFaceRevealStarted(this);

          this.scene.tweens.add({
            targets: [disappearingSprite],
            duration: this.animationDuration,
            scaleX: { from: 1, to: 0 },
            scaleY: { from: 1, to: 0 },
            alpha: { from: 1, to: 0 },
            delay: animationDelay ?? 0,
          });

          this.scene.tweens.add({
            targets: [appearingSprite],
            duration: this.animationDuration,
            scaleX: { from: 0, to: 1 },
            scaleY: { from: 0, to: 1 },
            alpha: { from: 0, to: 1 },
            delay: animationDelay ?? 0,
            onComplete: () => {
              this.isCurrentlyAnimating = false;
              appearingSprite.setVisible(true);
              disappearingSprite.setVisible(false);

              this.currentFace = face;

              this.onFaceRevealed(this, this.currentFace);
            },
          });
        } else {
          appearingSprite.setVisible(true);
          appearingSprite.setScale(1);
          appearingSprite.setAlpha(1);

          disappearingSprite.setVisible(false);
          disappearingSprite.setScale(0);
          disappearingSprite.setAlpha(0);

          this.currentFace = face;
        }
      }
    }
  }

  toggle(animate = true): void {
    if (!this.isLocked) {
      this.show({ face: this.currentFace === 'front' ? 'back' : 'front', animate });
    }
  }

  getCurrentState(): TileFace {
    return this.currentFace;
  }

  public lock(isLocked: boolean): void {
    this.isLocked = isLocked;
  }

  public lockForPlayer(isLocked: boolean): void {
    this.isLockedForPlayer = isLocked;
  }

  private pointIntersectsRectangle(point: Vector2, rectangle: Phaser.Geom.Rectangle): boolean {
    return (
      point.x >= rectangle.x &&
      point.x <= rectangle.x + rectangle.width &&
      point.y >= rectangle.y &&
      point.y <= rectangle.y + rectangle.height
    );
  }
}
