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
  score: 0,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null,
  },
  sounds: {
    bump: null,
  },
  runGame: false,

  init() {
    //this.canvas = document.getElementById("mycanvas");
    this.ctx = document.getElementById("mycanvas").getContext("2d");
    this.setEvents();
    this.setTextFont();
  },

  setTextFont() {
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "#fff";
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
    const required =
      Object.keys(this.sprites).length + Object.keys(this.sounds).length;
    const onResourceLoad = () => {
      loaded++;
      if (loaded >= required) {
        callback();
      }
    };

    this.preloadSprites(onResourceLoad);
    this.preloadSounds(onResourceLoad);
  },

  preloadSprites(onResourceLoad) {
    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `img/${key}.png`;
      this.sprites[key].style = "display: block";
      this.sprites[key].addEventListener("load", onResourceLoad);
    }
  },

  preloadSounds(onResourceLoad) {
    for (let key in this.sounds) {
      this.sounds[key] = new Audio();
      this.sounds[key].src = `sounds/${key}.mp3`;
      this.sounds[key].addEventListener("canplaythrough", onResourceLoad, {
        once: true,
      });
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
          active: true,
        });
      }
    }
  },

  update() {
    this.ball.collideWorldBounds();
    this.platform.collideWorldBounds();
    this.collideBlocks();
    this.collidePlatform();

    this.platform.move();
    this.ball.move();
  },

  addScore() {
    this.score++;

    if (this.score >= this.blocks.length) {
      this.end(`You win! :) Your score: ${game.score}`);
    }
  },

  collideBlocks() {
    for (let block of this.blocks) {
      if (block.active && this.ball.collide(block)) {
        this.ball.crushBlock(block);
        this.addScore();
        this.sounds.bump.play();
      }
    }
  },

  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform();
      this.sounds.bump.play();
    }
  },

  run() {
    if (this.runGame) {
      window.requestAnimationFrame(() => {
        this.update();
        this.render();
        this.run();
      });
    }
  },

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(
      this.sprites.ball,
      this.ball.frame * this.ball.width,
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
    this.ctx.fillText(`Score: ${this.score}`, 15, 20);
  },

  renderBlocks() {
    for (let block of this.blocks) {
      if (block.active) {
        this.ctx.drawImage(this.sprites.block, block.x, block.y);
      }
    }
  },

  start() {
    this.init();
    this.preload(() => {
      this.runGame = true;
      this.create();
      this.run();
    });
  },

  end(msg) {
    this.stop();
    this.alert(msg);
    this.refresh();
  },

  stop() {
    this.runGame = false;
  },

  alert(msg) {
    window.alert(msg);
  },

  refresh() {
    document.location.reload();
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
  frame: 0,
  start() {
    this.dx = game.random(-this.velocity, this.velocity);
    this.dy = -this.velocity;
    this.animate();
  },
  animate() {
    setInterval(()=>{
      this.frame++;
      if (this.frame > 3) {
        this.frame = 0;
      }
    }, 100);
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
  collideWorldBounds() {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    const ballLeftSide = x;
    const ballRightSide = x + this.width;
    const ballTopSide = y;
    const ballBottomSide = y + this.height;

    const worldLeftSide = 0;
    const worldRightSide = game.width;
    const worldTopSide = 0;
    const worldBottomSide = game.height;

    if (ballLeftSide < worldLeftSide) {
      this.x = 0;
      this.dx = this.velocity;
      game.sounds.bump.play();
    }
    if (ballRightSide > worldRightSide) {
      this.x = worldRightSide - this.width;
      this.dx = -this.velocity;
      game.sounds.bump.play();
    }
    if (ballTopSide < worldTopSide) {
      this.y = 0;
      this.dy = this.velocity;
      game.sounds.bump.play();
    }
    if (ballBottomSide > worldBottomSide) {
      game.end(`Game over! Your score: ${game.score}`);
    }
  },
  crushBlock(block) {
    block.active = false;
    this.dy = -this.dy;
  },
  bumpPlatform(platform) {
    if (game.platform.dx) {
      this.x += game.platform.dx;
    }
    if (this.dy > 0) {
      this.dy = -this.velocity;
      const touchX = this.x + this.width / 2;
      this.dx = this.velocity * game.platform.getTouchOffset(touchX);
    }
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
  collideWorldBounds() {
    const x = this.x + this.dx;
    const platformLeftSide = x;
    const platformRightSide = x + this.width;

    const worldLeftSide = 0;
    const worldRightSide = game.width;

    if (platformLeftSide <= worldLeftSide) {
      this.x = 0;
      this.stop();
    }
    if (platformRightSide >= worldRightSide) {
      this.x = game.width - this.width;
      this.stop();
    }
  },
  getTouchOffset(x) {
    const dif = this.x + this.width - x;
    const offset = this.width - dif;
    const result = (2 * offset) / this.width;
    return result - 1;
  },
};

window.addEventListener("load", () => {
  game.start();
});
