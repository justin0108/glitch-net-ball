import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import * as math from 'mathjs';
import { Matrix } from 'mathjs';

export const logicalToPixel = (logicalX: number, logicalY: number): number[] => {
    const newX = ((logicalX - 0) * SCREEN_WIDTH) / (SCREEN_WIDTH - 0);
    const newY = SCREEN_HEIGHT - ((logicalY - 0) * SCREEN_HEIGHT) / (SCREEN_HEIGHT - 0);
    return [newX, newY];
};

export const pixelToLogical = (pixelX: number, pixelY: number): number[] => {
    const newX = (pixelX / SCREEN_WIDTH) * (SCREEN_WIDTH - 0) + SCREEN_WIDTH;
    const newY = SCREEN_HEIGHT - (pixelY / SCREEN_HEIGHT) * (SCREEN_HEIGHT - 0);
    return [newX, newY];
};

export const randomNumber = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

export const randomMatrix = (row: number, column: number): Matrix => {
    const m = math.map(math.ones(row, column), elm => {
        return elm * randomNumber(-2, 2);
    }) as Matrix;
    return m;
};

export const zeroMatrix = (row: number, column: number): Matrix => {
    const m = math.zeros(row, column, 'dense') as Matrix;
    return m;
};

export const onesMatrix = (row: number, column: number): Matrix => {
    const m = math.ones(row, column, 'dense') as Matrix;
    return m;
};
