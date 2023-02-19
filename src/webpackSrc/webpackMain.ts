/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import { ModelBall } from './ModelBall';
import { RepoBall } from './RepoBall';
import { ServiceBall } from './ServiceBall';
import { RepoBarrel } from './RepoBarrel';
import { ServiceBarrel } from './ServiceBarrel';
import * as math from 'mathjs';
import { randomMatrix, zeroMatrix, onesMatrix } from './helper';

let isCanvasClick = false;
let playType = 3;
/**
 * setup the event listener
 */
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.addEventListener('click', _ => {
    isCanvasClick = true;
});
const radioAutoPlay = document.getElementById('auto-play') as HTMLInputElement;
const radioManualPlay = document.getElementById('manual-play') as HTMLInputElement;
const radioNnPlay = document.getElementById('nn-play') as HTMLInputElement;
radioNnPlay.checked = true;
radioAutoPlay.addEventListener('click', _ => {
    playType = 1;
});
radioManualPlay.addEventListener('click', _ => {
    playType = 2;
});
radioNnPlay.addEventListener('click', _ => {
    playType = 3;
});

const NET = document.getElementById('NET') as HTMLInputElement;

/**
 * setup the dependencies
 */
const ball = new ModelBall();
const repoBall = new RepoBall();
const serviceBall = new ServiceBall(repoBall);

const repoBarrel = new RepoBarrel();
const serviceBarrel = new ServiceBarrel(repoBarrel);

repoBall.add(ball);

/**
 * start animation
 */
let counter = 0;
function globalRender() {
    ++counter;
    serviceBarrel.updateBarrels();
    const nearestBarrel = serviceBarrel.getNearestBarrelInFrontOfBall(ball.posX, ball.radius);
    if (playType === 1) {
        serviceBall.autoPilot(nearestBarrel);
    } else if (playType === 2) {
        serviceBall.updateBall(isCanvasClick);
    } else {
        serviceBall.neuralPilot(nearestBarrel);
    }

    serviceBarrel.checkCollision(ball.posX, ball.posY, ball.radius);
    isCanvasClick = false;
    ctx.save();
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ball.render(ctx);

    const barrelList = repoBarrel.getList();
    barrelList.forEach(item => {
        item.render(ctx);
    });
    ctx.restore();

    if (counter % 100 === 0) {
        NET.value = JSON.stringify(serviceBall.getNetMatrix());
    }
    // window.requestAnimationFrame(globalRender);
}

// window.requestAnimationFrame(globalRender);

window.setInterval(globalRender, 10);
