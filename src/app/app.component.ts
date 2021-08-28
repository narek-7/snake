import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
declare var $: any;

const RIGHT = 'right';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  gameIsOver = false;
  title = 'mySnake';
  Size = 40;
  Rows = 15;
  Columns = 15;
  board = [];
  snake = {
    xTiles: [],
    yTiles: [],
  };
  apple = new Array(2);
  speed = 250;
  score = 0;
  highScore;
  record = false;
  direction = '';
  isRunning = false;
  timerId;
  skip;

  ngOnInit() {}

  ngAfterViewInit() {
    this.highScore = Number(localStorage.getItem('Snake'));
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.snake.xTiles = [7, 7];
    this.snake.yTiles = [2, 3];
    this.apple = [7, 10];
    for (let i = 0; i < this.Rows; ++i) {
      this.board.push(new Array(this.Columns));
    }

    this.draw();
  }

  @HostListener('window:keydown', ['$event'])  keyEvent(ev)

  {
    if (ev.keyCode == '13') {
      this.onStart();
    }
    if (ev.key == 'ArrowDown') {
      this.onDown();
    }
    if (ev.key == 'ArrowUp') {
      this.onUp();
    }
    if (ev.key == 'ArrowLeft') {
      this.onLeft();
    }
    if (ev.key == 'ArrowRight') {
      this.onRight();
    }
  }

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  draw() {
    let isTrue = true;
    for (let i = 0; i < this.Columns; i++) {
      for (let j = 0; j < this.Rows; j++) {
        if (isTrue) {
          this.ctx.fillStyle = 'rgb(210,255,255)';
          this.ctx.fillRect(j * this.Size, i * this.Size, this.Size, this.Size);
          isTrue = !isTrue;
        } else {
          this.ctx.fillStyle = 'rgb(105,255,230)';
          this.ctx.fillRect(j * this.Size, i * this.Size, this.Size, this.Size);
          isTrue = !isTrue;
        }
      }
    }
    for (let i = 0; i < this.snake.xTiles.length; i++) {
      this.ctx.fillStyle = 'rgb(15,90,255)';
      this.ctx.fillRect(
        this.snake.yTiles[i] * this.Size + 1,
        this.snake.xTiles[i] * this.Size + 1,
        this.Size - 2,
        this.Size - 2
      );
    }
    this.ctx.beginPath();
    this.ctx.fillStyle = 'red';
    this.ctx.arc(
      (this.apple[1] + 0.5) * this.Size,
      (this.apple[0] + 0.5) * this.Size,
      (this.Size * 2) / 6,
      0,
      2 * Math.PI,
      false
    );
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(
      this.Size * (this.apple[1] + 0.75),
      this.Size * this.apple[0]
    );
    this.ctx.lineTo(
      this.Size * (this.apple[1] + 0.5),
      this.Size * (this.apple[0] + 0.25)
    );
    this.ctx.stroke();
  }

  onStart() {
    if (!this.isRunning && !this.gameIsOver) {
      this.isRunning = true;
      this.direction = 'right';
      this.startTimer();
    }
  }

  onRight() {
    if (this.direction != 'left' && this.isRunning) {
      if (this.direction !== 'right') {
        this.skip = true;
        this.moveRight();
      }
      this.direction = 'right';
    }
  }

  onLeft() {
    if (this.direction != 'right' && this.isRunning) {
      if (this.direction !== 'left') {
        this.skip = true;
        this.moveLeft();
      }
      this.direction = 'left';
    }
  }

  onUp() {
    if (this.direction != 'down' && this.isRunning) {
      if (this.direction !== 'up') {
        this.skip = true;
        this.moveUp();
      }
      this.direction = 'up';
    }
  }

  onDown() {
    if (this.direction != 'up' && this.isRunning) {
      if (this.direction !== 'down') {
        this.skip = true;
        this.moveDown();
      }
      this.direction = 'down';
    }
  }

  moveRight() {
    let last = this.snake.xTiles.length - 1;
    let nextX = this.snake.xTiles[last];
    let nextY = this.snake.yTiles[last] + 1;
    this.move(nextX, nextY);
  }

  moveLeft() {
    let last = this.snake.xTiles.length - 1;
    let nextX = this.snake.xTiles[last];
    let nextY = this.snake.yTiles[last] - 1;
    this.move(nextX, nextY);
  }

  moveUp() {
    let last = this.snake.xTiles.length - 1;
    let nextX = this.snake.xTiles[last] - 1;
    let nextY = this.snake.yTiles[last];
    this.move(nextX, nextY);
  }

  moveDown() {
    let last = this.snake.xTiles.length - 1;
    let nextX = this.snake.xTiles[last] + 1;
    let nextY = this.snake.yTiles[last];
    this.move(nextX, nextY);
  }

  startTimer() {
    this.stopTimer();
    this.timerId = setInterval(() => this.gameLoop(), this.speed);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  gameLoop() {
    if (this.skip) {
      this.skip = false;
      return;
    }
    switch (this.direction) {
      case 'up':
        this.moveUp();
        break;
      case 'down':
        this.moveDown();
        break;
      case 'right':
        this.moveRight();
        break;
      case 'left':
        this.moveLeft();
        break;
    }
  }

  move(nextX, nextY) {
    if (this.nextMoveIsPossible(nextX, nextY)) {
      this.snake.xTiles.push(nextX);
      this.snake.yTiles.push(nextY);
      if (this.nextIsntAnApple(nextX, nextY)) {
        this.snake.xTiles.shift();
        this.snake.yTiles.shift();
      } else {
        this.createNewApple();
        this.countScore();
      }
      this.draw();
    } else {
      this.isRunning = false;
      this.gameIsOver = true;
      this.gameOver();
    }
  }

  nextMoveIsPossible(x, y) {
    if (x >= this.Rows || x < 0) {
      return false;
    }
    if (y >= this.Columns || y < 0) {
      return false;
    }
    for (let i = 0; i < this.snake.xTiles.length; i++) {
      if (x === this.snake.xTiles[i] && y === this.snake.yTiles[i])
        return false;
    }
    return true;
  }
  nextIsntAnApple(x, y) {
    if (x === this.apple[0] && y === this.apple[1]) {
      return false;
    }
    return true;
  }
  createNewApple() {
    this.apple[0] = Math.floor(Math.random() * this.Rows);
    this.apple[1] = Math.floor(Math.random() * this.Columns);
  }

  countScore() {
    //this.highScore = Number(localStorage.getItem('Snake'));
    //high = this.highScore.toString();
    //localStorage.setItem('Snake', high);
    let high;
    this.score++;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      high = this.highScore.toString();
      localStorage.setItem('Snake', high);
      this.record = true;
    }
  }

  gameOver() {
    $('#myModal').modal('show');
    $('#myModal').on('hide.bs.modal', () => {
      location.reload();
    });
  }
}
