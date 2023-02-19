import { BALL_GRAVITY } from './constants';
import { logicalToPixel } from './helper';

export class ModelBall {
    // expose all as public for convenience
    radius: number;
    posX: number;
    posY: number;
    velX: number;
    velY: number;

    constructor() {
        this.radius = 20;
        this.posX = 100;
        this.posY = 230;
        this.velX = 0;
        this.velY = BALL_GRAVITY;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        const [pixelX, pixelY] = logicalToPixel(this.posX, this.posY);
        ctx.save();
        ctx.fillStyle = 'lightblue';
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 20, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    };
}
