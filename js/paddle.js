'use strict';

export class Paddle {
    context;
    // x軸
    x;
    // y軸
    y;
    // 幅
    width;
    // 高さ
    height;
    // x軸の移動速度
    dx = 0;
    // 移動速度
    speed;

    constructor(context, x, y, width, height, speed) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    move() { this.x += this.dx; }

    draw() {
        this.context.beginPath();
        this.context.rect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = "green";
        this.context.fill();
        this.context.closePath();
    }
}