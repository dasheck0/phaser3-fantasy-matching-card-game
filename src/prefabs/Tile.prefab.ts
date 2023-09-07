import { BaseOptions, BasePrefab, BaseScene, Sprite, Vector2 } from '@dasheck0/phaser-boilerplate';

export interface TileOptions extends BaseOptions {
  key: string;
  backKey: string;
  group: string;
  onFaceRevealed: (tile: Tile) => void;
}

export type TileFace = 'front' | 'back';

export default class Tile implements BasePrefab {
  protected sprite: Sprite;
  protected backSprite: Sprite;

  private hoverTween: Phaser.Tweens.Tween;

  private currentFace: TileFace = 'back';

  private onFaceRevealed: (tile: Tile) => void;

  private isCurrentlyAnimating = false;

  private isLocked = false;

  constructor(private readonly name: string, private readonly scene: BaseScene, private readonly options: TileOptions) {
    this.onFaceRevealed = options.onFaceRevealed;

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

    this.scene.input.on('pointerup', (pointer: PointerEvent) => {
      if (this.pointIntersectsRectangle({ x: pointer.x, y: pointer.y }, this.sprite.getBounds())) {
        console.log('up', pointer);
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
    this.show('back', false, true);
  }

  shutdown(): void {
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

  show(face: TileFace, animate = true, force = false): void {
    if (!this.isCurrentlyAnimating && !this.isLocked) {
      if (this.currentFace !== face || force) {
        const appearingSprite = face === 'front' ? this.sprite : this.backSprite;
        const disappearingSprite = face === 'front' ? this.backSprite : this.sprite;

        if (animate) {
          this.isCurrentlyAnimating = true;
          this.hoverTween.pause();

          this.scene.tweens.add({
            targets: [disappearingSprite],
            duration: 250,
            scaleX: { from: 1, to: 0 },
            scaleY: { from: 1, to: 0 },
            alpha: { from: 1, to: 0 },
          });

          this.scene.tweens.add({
            targets: [appearingSprite],
            duration: 250,
            scaleX: { from: 0, to: 1 },
            scaleY: { from: 0, to: 1 },
            alpha: { from: 0, to: 1 },
            onComplete: () => {
              this.isCurrentlyAnimating = false;
              this.onFaceRevealed(this);
            },
          });

          appearingSprite.setVisible(true);
          disappearingSprite.setVisible(false);
        } else {
          appearingSprite.setVisible(true);
          appearingSprite.setScale(1);
          appearingSprite.setAlpha(1);

          disappearingSprite.setVisible(false);
          disappearingSprite.setScale(0);
          disappearingSprite.setAlpha(0);

          this.onFaceRevealed(this);
        }

        this.currentFace = face;
      }
    }
  }

  toggle(animate = true): void {
    if (!this.isLocked) {
      this.show(this.currentFace === 'front' ? 'back' : 'front', animate);
    }
  }

  getCurrentState(): TileFace {
    return this.currentFace;
  }

  public lock(isLocked: boolean): void {
    this.isLocked = isLocked;
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
