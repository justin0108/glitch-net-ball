import { SCREEN_HEIGHT } from './constants';
import { logicalToPixel } from './helper';

export class ModelBarrel {
    collided: boolean;
    nearest: boolean;
    width: number;
    gapHeight: number;
    gapCenterX: number;
    gapCenterY: number;

    constructor(width: number, gapHeight: number, gapCenterX: number, gapCenterY: number) {
        this.collided = false;
        this.nearest = false;
        this.width = width;
        this.gapHeight = gapHeight;
        this.gapCenterX = gapCenterX;
        this.gapCenterY = gapCenterY;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        const [gapPixelX, gapPixelY] = logicalToPixel(this.gapCenterX, this.gapCenterY);
        ctx.save();
        const topBarrelLeftStartPoint = gapPixelX - this.width / 2;
        const topBarrelTopStartPoint = 0;
        const topBarrelLength = gapPixelY - this.gapHeight / 2;

        const btmBarrelLeftStartPoint = topBarrelLeftStartPoint;
        const btmBarrelTopStartPoint = gapPixelY + this.gapHeight / 2;
        const btmBarrelLength = SCREEN_HEIGHT - btmBarrelTopStartPoint;

        ctx.fillStyle = this.collided ? 'red' : 'green';

        // top barrel
        ctx.fillRect(topBarrelLeftStartPoint, topBarrelTopStartPoint, this.width, topBarrelLength);
        // bottom barrel
        ctx.fillRect(btmBarrelLeftStartPoint, btmBarrelTopStartPoint, this.width, btmBarrelLength);
        ctx.restore();
    };
}
