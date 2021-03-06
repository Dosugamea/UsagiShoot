import { Asteroid } from '../objects/asteroid';
import { Bullet } from '../objects/bullet';
import { Ship } from '../objects/ship';
import { CONST } from '../const/const';

export class GameScene extends Phaser.Scene {
  private player: Ship;
  private asteroids: Asteroid[];
  private numberOfAsteroids: number;
  private score: number;
  private bitmapTexts: Phaser.GameObjects.BitmapText[];
  private gotHit: boolean;
  private background: Phaser.GameObjects.TileSprite;

  constructor() {
    super({
      key: 'GameScene'
    });
  }

  preload(): void {
    this.load.image('bg', './assets/images/19333449.jpg');
  }

  create(): void {
    let image = this.add.tileSprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 0, 0, 'bg')
    let scaleX = this.cameras.main.width / image.width
    let scaleY = this.cameras.main.height / image.height
    let scale = Math.max(scaleX, scaleY)
    image.setScale(scale).setScrollFactor(0)
    this.player = new Ship({ scene: this });
    this.background = image;
    this.asteroids = [];
    this.numberOfAsteroids = CONST.ASTEROID_COUNT;
    this.spawnAsteroids(this.numberOfAsteroids, 3);
    this.score = CONST.SCORE;
    this.bitmapTexts = [];
    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2,
        40,
        'asteroidFont',
        '' + this.score,
        80
      )
    );
    this.gotHit = false;
  }

  update(): void {
    this.background.tilePositionX += 3
    this.player.update();

    // check collision between asteroids and bullets
    for (let i = 0; i < this.asteroids.length; i++) {
      for (let bullet of this.player.getBullets()) {
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            bullet.getBody(),
            this.asteroids[i].getBody()
          )
        ) {
          bullet.setActive(false);
          this.asteroids[i].setActive(false);
          this.updateScore(this.asteroids[i].getSize());
        }
      }
      this.asteroids[i].update();

      if (!this.asteroids[i].active) {
        this.spawnAsteroids(
          2,
          this.asteroids[i].getSize() - 1,
          this.asteroids[i].x,
          this.asteroids[i].y
        );
        this.asteroids[i].destroy();
        this.asteroids.splice(i, 1);
      }
    }

    // check collision between asteroids and ship
    for (let i = 0; i < this.asteroids.length; i++) {
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.asteroids[i].getBody(),
          this.player.getBody()
        )
      ) {
        this.player.setActive(false);
        this.gotHit = true;
      }
    }

    // if player got hit
    if (this.gotHit) {
      CONST.LIVES--;

      if (CONST.LIVES > 0) {
        this.scene.start('GameScene');
      } else {
        this.scene.start('MainMenuScene');
      }
    }
  }

  private spawnAsteroids(
    aAmount: number,
    aSize: number,
    aX?: number,
    aY?: number
  ) {
    if (aSize > 0) {
      for (let i = 0; i < aAmount; i++) {
        this.asteroids.push(
          new Asteroid({
            scene: this,
            size: aSize,
            options: {
              x:
                aX === undefined
                  ? this.getRandomSpawnPostion(this.sys.canvas.width)
                  : aX,
              y:
                aY === undefined
                  ? this.getRandomSpawnPostion(this.sys.canvas.height)
                  : aY
            }
          })
        );
      }
    }
  }

  private updateScore(aSizeOfAsteroid: number) {
    switch (aSizeOfAsteroid) {
      case 3:
        this.score += 20;
        break;
      case 2:
        this.score += 50;
        break;
      case 1:
        this.score += 100;
        break;
    }

    CONST.SCORE = this.score;
    this.bitmapTexts[0].text = '' + this.score;
  }

  private getRandomSpawnPostion(aScreenSize: number): number {
    let rndPos = Phaser.Math.RND.between(0, aScreenSize);

    while (rndPos > aScreenSize / 3 && rndPos < (aScreenSize * 2) / 3) {
      rndPos = Phaser.Math.RND.between(0, aScreenSize);
    }

    return rndPos;
  }
}
