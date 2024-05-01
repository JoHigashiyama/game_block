'use strict';

import { View } from "./view.js";
import { Ball } from "./ball.js";
import { Paddle } from "./paddle.js";
import { Block, HardBlock } from "./block.js";
import { Bar } from "./bar.js";
import { Sound } from "./sound.js";

export class GameView extends View {
    #ball = null;
    #paddle = null;
    #blocks = [];
    #bar = null;
    // パドルとボールが衝突したときの音
    #paddleBallSound;
    // ブロックとボールが衝突したときの音
    #blockBallSound;
    // ゲーム結果
    resultMessage = "";

    constructor(context) {
        super(context);

        this.#ball = new Ball(context, 20, 440, 5, 2, 2);
        this.#paddle = new Paddle(context, 30, 460, 40, 4, 5);
        this.#blocks = [
            // new Block(context, 10, 40, 52, 20),
            // new Block(context, 72, 40, 52, 20),
            // new Block(context, 134, 40, 52, 20),
            new Block(context, 196, 40, 52, 20),
            new Block(context, 258, 40, 52, 20),
            new HardBlock(context, 10, 70, 52, 20),
            new HardBlock(context, 72, 70, 52, 20),
        ];
        this.#bar = new Bar(context);
        this.#paddleBallSound = new Sound("./sounds/move.mp3");
        this.#blockBallSound = new Sound("./sounds/bomb.mp3");
    }

    // プレイヤーのキーアクションを実行する
    executePlayerAction(key) {
        // 左キーが押されたらパドルを左に移動する
        if (key["ArrowLeft"] || key["Left"]) {
            this.#paddle.dx = -this.#paddle.speed;
            // 右キーが押されたらパドルを右に移動する
        } else if (key["ArrowRight"] || key["Right"]) {
            this.#paddle.dx = this.#paddle.speed;
            // キーが押されたいない場合はパドルを停止する
        } else {
            this.#paddle.dx = 0;
        }
    }

    // ゲームクリアかどうか検証する
    #isGameClear() {
        // ブロックが全部非表示になっているか検証する
        const _isGameClear = this.#blocks.every((block) => block.status === false);
        // ゲーム結果を設定する
        if (_isGameClear) {
            this.resultMessage = "ゲームクリア";
        }
        return _isGameClear;
    }

    // ゲームオーバーかどうか検証する
    #isGameOver() {
        const ballY = this.#ball.y;
        const ballRadius = this.#ball.radius;
        const ballDy = this.#ball.dy;

        // ボールが下の壁と衝突したかどうか検証する
        const _isGameOver =
            this.context.canvas.height - ballRadius < ballY + ballDy;
        // ゲーム結果を設定する
        if (_isGameOver) {
            this.resultMessage = "ゲームオーバー";
        }
        return _isGameOver;
    }

    // ボールと壁の衝突を確認する
    #checkCollisionBallAndWall() {
        const canvasWidth = this.context.canvas.width;
        const canvasHeight = this.context.canvas.height;
        const ballX = this.#ball.x;
        const ballY = this.#ball.y;
        const ballRadius = this.#ball.radius;
        const ballDx = this.#ball.dx;
        const ballDy = this.#ball.dy;

        // ボールが横の壁と衝突したらx軸の移動速度を反転する
        if (ballX + ballDx < ballRadius || canvasWidth - ballRadius < ballX + ballDx) {
            this.#ball.dx *= -1;
            return;
        }

        // ボールが上の壁と衝突したらy軸の移動速度を反転する
        if (ballY + ballDy < ballRadius + 20) {
            this.#ball.dy *= -1;
            return;
        }

        // ボールが下の壁と衝突したらy軸の移動速度を反転する
        // if (canvasHeight - ballRadius < ballY + ballDy) {
        //     this.#ball.dy *= -1;
        //     return;
        // }
    }

    // ボールとパドルの衝突を確認する
    #checkCollisionBallAndPaddle() {
        const ballX = this.#ball.x;
        const ballY = this.#ball.y;
        const ballRadius = this.#ball.radius;
        const ballDx = this.#ball.dx;
        const ballDy = this.#ball.dy;
        const paddleX = this.#paddle.x;
        const paddleY = this.#paddle.y;
        const paddleWidth = this.#paddle.width;
        const paddleHeight = this.#paddle.height;

        if (paddleX - ballRadius < ballX + ballDx &&
            ballX + ballDx < paddleX + paddleWidth + ballRadius &&
            paddleY - ballRadius < ballY + ballDy &&
            ballY + ballDy < paddleY + paddleHeight + ballRadius) {
            this.#ball.dy *= -1;
            // ﾊﾟﾄﾞﾙtボールが衝突したときの効果音を再生する
            this.#paddleBallSound.play();
        }
    }

    // パドルと壁の衝突を確認する
    #checkcollisionPaddleAndWall() {
        const canvasWidth = this.context.canvas.width;
        const paddleX = this.#paddle.x;
        const paddleDx = this.#paddle.dx;
        const paddleWidth = this.#paddle.width;

        if (paddleX + paddleDx < 0) {
            this.#paddle.dx = 0;
            this.#paddle.x = 0;
            return;
        }

        if (canvasWidth - paddleWidth < paddleX + paddleDx) {
            this.#paddle.dx = 0;
            this.paddle.x = canvasWidth - paddleWidth;
            return;
        }
    }

    // ボールをブロックの衝突を確認する
    #checkCollisionBallAndBlock() {
        const ballX = this.#ball.x;
        const ballY = this.#ball.y;
        const ballRadius = this.#ball.radius;
        const ballDx = this.#ball.dx;
        const ballDy = this.#ball.dy;

        this.#blocks.forEach((block) => {
            if (block.status === true) {
                const blockX = block.x;
                const blockY = block.y;
                const blockWidth = block.width;
                const blockHeight = block.height;

                // ボールとブロックが衝突したか確認する
                if (blockX - ballRadius < ballX + ballDx &&
                    ballX + ballDx < blockX + blockWidth + ballRadius &&
                    blockY - ballRadius < ballY + ballDy &&
                    ballY + ballDy < blockY + blockHeight + ballRadius) {
                    // ボールを反射する
                    // this.#ball.dx *= -1;
                    this.#ball.dy *= -1;
                    if (block instanceof HardBlock) {
                        block.hp--;
                        if (block.hp === 0) {
                            // ブロックを非表示にする
                            block.status = false;
                            // スコアを加算する
                            this.#bar.addScore(block.getPoint());
                        }
                    } else {
                        // ブロックを非表示にする
                        block.status = false;
                        // スコアを加算する
                        this.#bar.addScore(block.getPoint());
                    }
                    // ブロックとボールが衝突したときの効果音を再生する
                    this.#blockBallSound.play();
                }
            }
        });
    }

    // 更新する
    update() {
        // ボールと壁の衝突を確認する
        this.#checkCollisionBallAndWall();
        // ボールとパドルの衝突を確認する
        this.#checkCollisionBallAndPaddle();
        // パドルと壁の衝突を確認する
        this.#checkcollisionPaddleAndWall();
        // パドルとブロックの衝突を確認する
        this.#checkCollisionBallAndBlock();
        // ゲームオーバーかどうか検証する
        if (this.#isGameOver() || this.#isGameClear()) {
            // ゲーム画面を非表示にする
            this.isVisible = false;
        }
        // ボールを移動する
        this.#ball.move();
        // パドルを移動する
        this.#paddle.move();
    }

    // 描画する
    draw() {
        // ボールを描画する
        this.#ball.draw();
        // パドルを描画する
        this.#paddle.draw();
        // ブロックを描画する
        this.#blocks.forEach((block) => block.draw());
        // バーを描画する
        this.#bar.draw();
    }
}