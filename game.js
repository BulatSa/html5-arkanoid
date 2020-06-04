const keys = {
  left: 37,
  right: 39,
  space: 32,
};

let game = {
  ctx: null,
  platform: null,
  ball: null,
  blocks: [],
  rows: 4,
  cols: 8,
  width: 640,
  height: 360,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null,
  },

  init() {
    //this.canvas = document.getElementById("mycanvas");
    this.ctx = document.getElementById("mycanvas").getContext("2d");
    this.setEvents();
  },

  setEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === keys.space) {
        this.platform.fire();
      } else if (e.keyCode === keys.left || e.keyCode === keys.right) {
        this.platform.start(e.keyCode);
      }
      //console.log(e.keyCode);
    });

    window.addEventListener("keyup", (e) => {
      this.platform.stop();
    });
  },

  preload(callback) {
    let loaded = 0;
    const required = Object.keys(this.sprites).length;
    const onImageLoad = () => {
      ++loaded;
      if (loaded >= required) {
        callback();
      }
    };

    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `img/${key}.png`;
      this.sprites[key].addEventListener("load", onImageLoad);
    }
  },

  create() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          x: 64 * col + 65,
          y: 24 * row + 35,
          width: 60,
          height: 20,
        });
      }
    }
  },

  update() {
    this.platform.move();
    this.ball.move();

    this.collideBlocks();
    this.collidePlatform();
  },

  collideBlocks() {
    for (let block of this.blocks) {
      if (this.ball.collide(block)) {
        this.ball.crushBlock(block);
      }
    }
  },

  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform();
    }
  },

  run() {
    window.requestAnimationFrame(() => {
      this.update();
      this.render();
      this.run();
      //console.log("render");
    });
  },

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(
      this.sprites.ball,
      0,
      0,
      this.ball.width,
      this.ball.height,
      this.ball.x,
      this.ball.y,
      this.ball.width,
      this.ball.height
    );
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocks();
  },

  renderBlocks() {
    for (let block of this.blocks) {
      this.ctx.drawImage(this.sprites.block, block.x, block.y);
    }
  },

  start() {
    this.init();
    this.preload(() => {
      this.create();
      this.run();
    });
  },

  random(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  },
};

game.ball = {
  x: 320,
  y: 280,
  width: 20,
  height: 20,
  dx: 0,
  dy: 0,
  velocity: 3,
  start() {
    this.dx = game.random(-this.velocity, this.velocity);
    this.dy = -this.velocity;
  },
  move() {
    if (this.dx) {
      this.x += this.dx;
    }
    if (this.dy) {
      this.y += this.dy;
    }
  },
  collide(element) {
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    if (
      x + this.width > element.x && // удар слева
      x < element.x + element.width && // удар справа
      y + this.height > element.y && // удар сверху
      y < element.y + element.height // удар снизу
    ) {
      return true;
    }
  },
  crushBlock(element) {
    this.dy = -this.dy;
  },
  bumpPlatform(platform) {
    this.dy = -this.dy;
    const touchX = this.x + this.width / 2;
    this.dx = this.velocity * game.platform.getTouchOffset(touchX);
  },
};

game.platform = {
  x: 280,
  y: 300,
  width: 100,
  height: 14,
  velocity: 6,
  dx: 0,
  ball: game.ball,
  fire() {
    if (this.ball) {
      this.ball.start();
      this.ball = null;
    }
  },
  start(direction) {
    if (direction === keys.left) {
      this.dx = -this.velocity;
    } else if (direction === keys.right) {
      this.dx = this.velocity;
    }
  },
  stop() {
    this.dx = 0;
  },
  move() {
    if (this.dx) {
      this.x += this.dx;
      if (this.ball) {
        this.ball.x += this.dx;
      }
    }
  },
  getTouchOffset(x) {
    const dif = this.x + this.width - x;
    const offset = this.width - dif;
    const result = 2 * offset / this.width;
    return result - 1;
  },
};

window.addEventListener("load", () => {
  game.start();
});
