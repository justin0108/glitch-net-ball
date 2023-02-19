import {
    BALL_THRUST,
    BALL_GRAVITY,
    SCREEN_HEIGHT,
    BARREL_JUMP_ALLOWANCE,
    BARREL_SPEED,
    TRAINED_NET,
} from './constants';
import { RepoBall } from './RepoBall';
import { ModelBall } from './ModelBall';
import { ModelBarrel } from './ModelBarrel';
import { NeuralNet } from './NeuralNet';

export class ServiceBall {
    repoBall: RepoBall;
    neuralNet: NeuralNet;

    constructor(repoBall: RepoBall) {
        this.repoBall = repoBall;
        this.neuralNet = new NeuralNet();
        this.neuralNet.restoreNetMatrix(JSON.parse(TRAINED_NET));
    }

    private checkOvershoot = (ball: ModelBall): boolean => {
        if (ball.posY + ball.radius > SCREEN_HEIGHT) {
            ball.posY = SCREEN_HEIGHT - ball.radius;
            ball.velY = 0;
            return true;
        }
        return false;
    };

    getNetMatrix = (): any => {
        return this.neuralNet.getNetMatrix();
    };

    restoreNetMatrix = (netMatrix: any) => {
        return this.neuralNet.restoreNetMatrix(netMatrix);
    };

    updateBall = (flyUp: boolean) => {
        const ball = this.repoBall.get(0);
        if (flyUp) {
            // v = u + at
            ball.velY = BALL_THRUST;
            ball.posY += ball.velY;

            this.checkOvershoot(ball);
        } else {
            ball.velY += BALL_GRAVITY;
            // s = v * t
            ball.posY += ball.velY;
            this.checkOvershoot(ball);

            if (ball.posY - ball.radius < 0) ball.posY = ball.radius;
        }
    };

    autoPilot = (nearestBarrel: ModelBarrel): void => {
        const action = this.theoreticalAction(nearestBarrel);
        if (action > 0.5) this.updateBall(true);
        else this.updateBall(false);
    };

    neuralPilot = (nearestBarrel: ModelBarrel): void => {
        const ball = this.repoBall.get(0);
        const expectedAction = this.theoreticalAction(nearestBarrel);
        const toClick = this.neuralNet.train(
            ball.posY,
            ball.velY,
            nearestBarrel.gapCenterX,
            nearestBarrel.gapCenterY,
            nearestBarrel.width,
            nearestBarrel.gapHeight,
            BARREL_SPEED,
            expectedAction
        );
        this.updateBall(toClick);
    };

    // 1.0 means click
    // 0.0 mean no-click
    // use this theory to train the NN
    private theoreticalAction = (nearestBarrel: ModelBarrel): number => {
        const ball = this.repoBall.get(0);

        if (!nearestBarrel) return 0.0;

        // the allowance is for odd number division
        let barrelBottomLine = nearestBarrel.gapCenterY - nearestBarrel.gapHeight / 2;
        barrelBottomLine += BARREL_JUMP_ALLOWANCE;

        // check bird next frame bottom position if it does not fly up
        const ballNextFrameBtmPosition = ball.posY - ball.radius + (ball.velY + BALL_GRAVITY);

        if (ballNextFrameBtmPosition < barrelBottomLine) return 1.0;
        else return 0.0;
    };
}
