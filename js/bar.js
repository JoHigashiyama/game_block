'use strict';

class Score {
    // 得点
    score = 0;
}

export class Bar {
    context;
    #score;

    constructor(context) {
        this.context = context;
        this.#score = new Score();
    }

    // スコアを加算する
    addScore(value) {
        this.#score.score += value;
    }

    // 描画する
    draw() {
        // バーを描画する
        this.context.fillStyle = "darkgray";
        this.context.fillRect(0, 0, this.context.canvas.width, 20);

        // スコアを描画する
        const scoreString = this.#score.score.toString().padStart(5, "0");
        this.context.fillStyle = "black";
        this.context.font = "16 Arial";
        this.context.fillText(`Score: ${scoreString}`, 260, 10);
    }

}
