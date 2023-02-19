import {
    BARREL_OPENING_HEIGHT_MIN,
    BARREL_OPENING_HEIGHT_MAX,
    SCREEN_WIDTH,
    BARREL_OPENING_CENTER_MIN,
    BARREL_OPENING_CENTER_MAX,
    BARREL_WIDTH,
    BARREL_SEPARATION,
    BARREL_SPEED,
} from './constants';
import { randomNumber } from './helper';
import { RepoBarrel } from './RepoBarrel';
import { ModelBarrel } from './ModelBarrel';

export class ServiceBarrel {
    repoBarrel: RepoBarrel;
    totalBarrelsCreated: number;

    constructor(repoBarrel: RepoBarrel) {
        this.repoBarrel = repoBarrel;
        this.totalBarrelsCreated = 0;
    }

    updateBarrels = () => {
        const totalBarrelInDb = this.repoBarrel.count();
        if (totalBarrelInDb === 0) {
            this.createBarrel();
            return;
        }

        const modelLastBarrel = this.repoBarrel.last();
        const modelFirstBarrel = this.repoBarrel.first();

        if (modelLastBarrel.gapCenterX + BARREL_WIDTH / 2 + BARREL_SEPARATION < SCREEN_WIDTH) {
            this.createBarrel();
        }

        if (modelFirstBarrel.gapCenterX + BARREL_WIDTH / 2 < 0) {
            if (modelFirstBarrel.collided) {
                console.log('collided');
            } else {
                console.log('not collided');
            }

            this.repoBarrel.delete(0);
        }
        // remove barrel that has move out of screen to conserve memory

        // update all barrels
        // s = v * t
        // model.GapCenterX += barrelSpeed;
        const barrelList = this.repoBarrel.getList();
        barrelList.forEach(item => {
            item.gapCenterX += BARREL_SPEED;
        });
    };

    checkCollision = (ballPosX: number, ballPosY: number, ballRadius: number): boolean => {
        const barrelList = this.repoBarrel.getList();
        barrelList.forEach(item => {
            const isBirdWithinBarrelWidth =
                item.gapCenterX - item.width / 2 < ballPosX + ballRadius &&
                ballPosX - ballRadius < item.gapCenterX + item.width / 2;
            if (isBirdWithinBarrelWidth) {
                const isBirdWithinBarrelOpening =
                    item.gapCenterY - item.gapHeight / 2 < ballPosY - ballRadius &&
                    ballPosY + ballRadius < item.gapCenterY + item.gapHeight / 2;
                if (!isBirdWithinBarrelOpening) {
                    item.collided = true;
                    return true;
                }
            }
        });
        return false;
    };

    getNearestBarrelInFrontOfBall = (ballPosX: number, ballRadius: number): ModelBarrel => {
        const firstBarrel = this.repoBarrel.first();
        // check if bird has went past the barrel
        // if it went past..the 2nd barrel must be the nearest
        const isBallPastBarrel = ballPosX - ballRadius > firstBarrel.gapCenterX + firstBarrel.width / 2;
        if (isBallPastBarrel) {
            firstBarrel.nearest = false;
            // there must be a 2nd barrel since it has went past the first
            const secondBarrel = this.repoBarrel.get(1);
            secondBarrel.nearest = true;
            return secondBarrel;
        } else {
            firstBarrel.nearest = true;
            return firstBarrel;
        }
    };

    private createBarrel = (): ModelBarrel => {
        // draw first barrel to kick start
        ++this.totalBarrelsCreated;
        const gapHeight = randomNumber(BARREL_OPENING_HEIGHT_MIN, BARREL_OPENING_HEIGHT_MAX);
        const gapCenterX = SCREEN_WIDTH;
        const gapCenterY = randomNumber(BARREL_OPENING_CENTER_MIN, BARREL_OPENING_CENTER_MAX);
        const barrelWidth = BARREL_WIDTH;
        const barrel = new ModelBarrel(barrelWidth, gapHeight, gapCenterX, gapCenterY);
        this.repoBarrel.add(barrel);
        return barrel;
    };
}
