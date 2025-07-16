/**
 * 贪吃蛇游戏主逻辑
 * @file snake.js
 * @author AI
 */

/**
 * 游戏配置对象
 * @typedef {Object} GameConfig
 * @property {number} canvasSize 画布宽高（正方形）
 * @property {number} cellSize 单元格大小
 * @property {number} initialSnakeLength 初始蛇长度
 * @property {number} speed 游戏速度（毫秒/帧）
 */

/**
 * 坐标点对象
 * @typedef {Object} Point
 * @property {number} x X坐标
 * @property {number} y Y坐标
 */

/**
 * 方向枚举
 * @readonly
 * @enum {string}
 */
const Direction = {
  LEFT: 'LEFT',
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
};

/**
 * 游戏主类
 */
class SnakeGame {
  /**
   * 构造函数
   * @param {HTMLCanvasElement} canvas 画布元素
   * @param {HTMLElement} scoreEl 分数显示元素
   * @param {GameConfig} config 游戏配置
   */
  constructor(canvas, scoreEl, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scoreEl = scoreEl;
    this.config = config;
    this.reset();
    this.timer = null;
    this.isRunning = false;
    this.directionQueue = [];
  }

  /**
   * 重置游戏状态
   */
  reset() {
    const mid = Math.floor(this.config.canvasSize / this.config.cellSize / 2);
    this.snake = [];
    for (let i = 0; i < this.config.initialSnakeLength; i++) {
      this.snake.push({ x: mid - i, y: mid });
    }
    this.direction = Direction.RIGHT;
    this.nextDirection = Direction.RIGHT;
    this.score = 0;
    this.generateFood();
    this.updateScore();
  }

  /**
   * 开始游戏
   */
  start() {
    if (this.isRunning) return;
    this.reset();
    this.isRunning = true;
    this.directionQueue = [];
    this.loop();
  }

  /**
   * 游戏主循环
   */
  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.timer = setTimeout(() => this.loop(), this.config.speed);
  }

  /**
   * 结束游戏
   */
  gameOver() {
    this.isRunning = false;
    clearTimeout(this.timer);
    alert('游戏结束！最终分数：' + this.score);
  }

  /**
   * 更新游戏状态
   */
  update() {
    // 处理方向队列，防止连续反向
    if (this.directionQueue.length) {
      const next = this.directionQueue.shift();
      if (!this.isOpposite(next, this.direction)) {
        this.direction = next;
      }
    }
    const head = { ...this.snake[0] };
    switch (this.direction) {
      case Direction.LEFT:
        head.x--;
        break;
      case Direction.UP:
        head.y--;
        break;
      case Direction.RIGHT:
        head.x++;
        break;
      case Direction.DOWN:
        head.y++;
        break;
    }
    // 撞墙判定
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= this.config.canvasSize / this.config.cellSize ||
      head.y >= this.config.canvasSize / this.config.cellSize
    ) {
      this.gameOver();
      return;
    }
    // 撞自己判定
    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      this.gameOver();
      return;
    }
    // 吃食物
    if (head.x === this.food.x && head.y === this.food.y) {
      this.snake.unshift(head);
      this.score++;
      this.updateScore();
      this.generateFood();
    } else {
      this.snake.unshift(head);
      this.snake.pop();
    }
  }

  /**
   * 渲染游戏画面
   */
  draw() {
    const { ctx, config } = this;
    ctx.clearRect(0, 0, config.canvasSize, config.canvasSize);
    // 绘制蛇身
    for (let i = this.snake.length - 1; i >= 0; i--) {
      const seg = this.snake[i];
      // 蛇头
      if (i === 0) {
        // 头部渐变
        const grad = ctx.createRadialGradient(
          (seg.x + 0.5) * config.cellSize,
          (seg.y + 0.5) * config.cellSize,
          config.cellSize * 0.2,
          (seg.x + 0.5) * config.cellSize,
          (seg.y + 0.5) * config.cellSize,
          config.cellSize * 0.5
        );
        grad.addColorStop(0, '#6ee7b7');
        grad.addColorStop(1, '#388e3c');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(
          (seg.x + 0.5) * config.cellSize,
          (seg.y + 0.5) * config.cellSize,
          config.cellSize * 0.5,
          0, Math.PI * 2
        );
        ctx.fill();
        // 画眼睛
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(
          (seg.x + 0.68) * config.cellSize,
          (seg.y + 0.38) * config.cellSize,
          config.cellSize * 0.13,
          0, Math.PI * 2
        );
        ctx.arc(
          (seg.x + 0.32) * config.cellSize,
          (seg.y + 0.38) * config.cellSize,
          config.cellSize * 0.13,
          0, Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(
          (seg.x + 0.68) * config.cellSize,
          (seg.y + 0.41) * config.cellSize,
          config.cellSize * 0.07,
          0, Math.PI * 2
        );
        ctx.arc(
          (seg.x + 0.32) * config.cellSize,
          (seg.y + 0.41) * config.cellSize,
          config.cellSize * 0.07,
          0, Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      } else {
        // 蛇身渐变
        const grad = ctx.createRadialGradient(
          (seg.x + 0.5) * config.cellSize,
          (seg.y + 0.5) * config.cellSize,
          config.cellSize * 0.1,
          (seg.x + 0.5) * config.cellSize,
          (seg.y + 0.5) * config.cellSize,
          config.cellSize * 0.5
        );
        grad.addColorStop(0, '#b2f7ef');
        grad.addColorStop(1, '#4caf50');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(
          (seg.x + 0.5) * config.cellSize,
          (seg.y + 0.5) * config.cellSize,
          config.cellSize * 0.45,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
    // 绘制食物（可爱水果风格）
    const food = this.food;
    ctx.save();
    // 主体
    const foodGrad = ctx.createRadialGradient(
      (food.x + 0.5) * config.cellSize,
      (food.y + 0.5) * config.cellSize,
      config.cellSize * 0.1,
      (food.x + 0.5) * config.cellSize,
      (food.y + 0.5) * config.cellSize,
      config.cellSize * 0.5
    );
    foodGrad.addColorStop(0, '#fff176');
    foodGrad.addColorStop(1, '#ff6f61');
    ctx.fillStyle = foodGrad;
    ctx.beginPath();
    ctx.arc(
      (food.x + 0.5) * config.cellSize,
      (food.y + 0.5) * config.cellSize,
      config.cellSize * 0.38,
      0, Math.PI * 2
    );
    ctx.fill();
    // 高光
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(
      (food.x + 0.65) * config.cellSize,
      (food.y + 0.38) * config.cellSize,
      config.cellSize * 0.11,
      0, Math.PI * 2
    );
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /**
   * 生成新食物
   */
  generateFood() {
    const max = this.config.canvasSize / this.config.cellSize;
    let x, y, conflict;
    do {
      x = Math.floor(Math.random() * max);
      y = Math.floor(Math.random() * max);
      conflict = this.snake.some(seg => seg.x === x && seg.y === y);
    } while (conflict);
    this.food = { x, y };
  }

  /**
   * 更新分数显示
   */
  updateScore() {
    this.scoreEl.textContent = `分数：${this.score}`;
  }

  /**
   * 判断两个方向是否相反
   * @param {Direction} dir1 方向1
   * @param {Direction} dir2 方向2
   * @returns {boolean} 是否相反
   */
  isOpposite(dir1, dir2) {
    return (
      (dir1 === Direction.LEFT && dir2 === Direction.RIGHT) ||
      (dir1 === Direction.RIGHT && dir2 === Direction.LEFT) ||
      (dir1 === Direction.UP && dir2 === Direction.DOWN) ||
      (dir1 === Direction.DOWN && dir2 === Direction.UP)
    );
  }

  /**
   * 处理方向变更
   * @param {Direction} dir 新方向
   */
  changeDirection(dir) {
    if (
      dir !== this.direction &&
      !this.isOpposite(dir, this.direction) &&
      (this.directionQueue.length === 0 || this.directionQueue[this.directionQueue.length - 1] !== dir)
    ) {
      this.directionQueue.push(dir);
    }
  }
}

// 初始化游戏
window.onload = function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('gameCanvas');
  /** @type {HTMLElement} */
  const scoreEl = document.getElementById('score');
  /** @type {HTMLButtonElement} */
  const startBtn = document.getElementById('startBtn');

  /** @type {GameConfig} */
  const config = {
    canvasSize: 400,
    cellSize: 20,
    initialSnakeLength: 3,
    speed: 120,
  };

  /** @type {SnakeGame} */
  const game = new SnakeGame(canvas, scoreEl, config);

  // 方向控制
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        game.changeDirection(Direction.LEFT);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        game.changeDirection(Direction.UP);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        game.changeDirection(Direction.RIGHT);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        game.changeDirection(Direction.DOWN);
        break;
    }
  });

  // 开始按钮
  startBtn.onclick = () => {
    game.start();
  };
}; 