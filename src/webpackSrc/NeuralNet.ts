import * as math from 'mathjs';
import { Matrix } from 'mathjs';
import { randomMatrix, zeroMatrix } from './helper';

export class NeuralNet {
    learningRate: number;
    batch_size: number;
    input_total: number;
    hidden1_total: number;
    hidden2_total: number;
    output_total: number;
    train_counter: number;

    W_1: Matrix;
    B_1: Matrix;

    W_2: Matrix;
    B_2: Matrix;

    W_3: Matrix;
    B_3: Matrix;

    batch_DW_1: Matrix;
    batch_DB_1: Matrix;

    batch_DW_2: Matrix;
    batch_DB_2: Matrix;

    batch_DW_3: Matrix;
    batch_DB_3: Matrix;

    constructor() {
        this.learningRate = 1;
        this.batch_size = 100;
        this.input_total = 7;
        this.hidden1_total = 30;
        this.hidden2_total = 30;
        this.output_total = 1;
        this.train_counter = 0;

        this.W_1 = randomMatrix(this.hidden1_total, this.input_total);
        this.B_1 = randomMatrix(this.hidden1_total, 1);

        this.W_2 = randomMatrix(this.hidden2_total, this.hidden1_total);
        this.B_2 = randomMatrix(this.hidden2_total, 1);

        this.W_3 = randomMatrix(this.output_total, this.hidden2_total);
        this.B_3 = randomMatrix(this.output_total, 1);

        this.batch_DW_1 = zeroMatrix(this.hidden1_total, this.input_total);
        this.batch_DB_1 = zeroMatrix(this.hidden1_total, 1);

        this.batch_DW_2 = zeroMatrix(this.hidden2_total, this.hidden1_total);
        this.batch_DB_2 = zeroMatrix(this.hidden2_total, 1);

        this.batch_DW_3 = zeroMatrix(this.output_total, this.hidden2_total);
        this.batch_DB_3 = zeroMatrix(this.output_total, 1);
    }

    getNetMatrix = (): any => {
        const netMatrix = {
            W_1: this.W_1.toArray(),
            B_1: this.B_1.toArray(),
            W_2: this.W_2.toArray(),
            B_2: this.B_2.toArray(),
            W_3: this.W_3.toArray(),
            B_3: this.B_3.toArray(),
        };
        return netMatrix;
    };

    restoreNetMatrix = (netMatrix: any) => {
        this.W_1 = math.matrix(netMatrix.W_1);
        this.B_1 = math.matrix(netMatrix.B_1);
        this.W_2 = math.matrix(netMatrix.W_2);
        this.B_2 = math.matrix(netMatrix.B_2);
        this.W_3 = math.matrix(netMatrix.W_3);
        this.B_3 = math.matrix(netMatrix.B_3);
    };

    predict = (
        ballPosY: number,
        ballVelY: number,
        gapCenterX: number,
        gapCenterY: number,
        barrelWidth: number,
        gapHeight: number,
        barrelSpeed: number
    ): [boolean, Matrix, Matrix, Matrix, Matrix] => {
        // first forward feed to hidden layer
        const A_0 = math.transpose(
            math.matrix([[ballPosY, ballVelY, gapCenterX, gapCenterY, barrelWidth, gapHeight, barrelSpeed]])
        );

        // Z_1 = W_1 * A_0 + B_1
        const Z_1 = math.add(math.multiply(this.W_1, A_0), this.B_1) as Matrix;
        const A_1 = math.map(Z_1, this.activation_sigmoid);

        // second forward feed to next hidden layer
        // Z_2 = W_2 * A_1 + B_2
        const Z_2 = math.add(math.multiply(this.W_2, A_1), this.B_2) as Matrix;
        const A_2 = math.map(Z_2, this.activation_sigmoid);

        // third forward feed to output layer
        // we use sigmoid at the last output layer since this is just a logistic regression..just nice
        // W_3 * A_2 + B_3
        const Z_3 = math.add(math.multiply(this.W_3, A_2), this.B_3) as Matrix;
        const A_3 = math.map(Z_3, this.activation_sigmoid);

        const predictedAction = A_3.get([0, 0]) > 0.5;
        return [predictedAction, A_0, A_1, A_2, A_3];
    };

    train = (
        ballPosY: number,
        ballVelY: number,
        gapCenterX: number,
        gapCenterY: number,
        barrelWidth: number,
        gapHeight: number,
        barrelSpeed: number,
        expectedAction: number
    ): boolean => {
        ++this.train_counter;
        const [predictedAction, A_0, A_1, A_2, A_3] = this.predict(
            ballPosY,
            ballVelY,
            gapCenterX,
            gapCenterY,
            barrelWidth,
            gapHeight,
            barrelSpeed
        );

        // check the cost..the difference between the NN output and the expected output
        // for simplicity, click = value 1, no-click = value 0
        const Y = zeroMatrix(this.output_total, 1);
        Y.set([0, 0], expectedAction);

        // backpropagation
        const DELTA_3 = zeroMatrix(this.output_total, 1);
        for (let i = 0; i < this.output_total; ++i) {
            DELTA_3.set([i, 0], this.lastLayerSigmoid_partial_c_z(Y.get([i, 0]), A_3.get([i, 0])));
        }

        const DW_3 = math.multiply(DELTA_3, math.transpose(A_2));
        const DB_3 = DELTA_3;

        const ACTIVATION_DERIVATIVE_2 = math.map(A_2, this.partial_activation_sigmoid);
        const DELTA_2 = math.dotMultiply(math.multiply(math.transpose(this.W_3), DELTA_3), ACTIVATION_DERIVATIVE_2);

        const DW_2 = math.multiply(DELTA_2, math.transpose(A_1));
        const DB_2 = DELTA_2;

        const ACTIVATION_DERIVATIVE_1 = math.map(A_1, this.partial_activation_sigmoid);
        const DELTA_1 = math.dotMultiply(math.multiply(math.transpose(this.W_2), DELTA_2), ACTIVATION_DERIVATIVE_1);

        const DW_1 = math.multiply(DELTA_1, math.transpose(A_0));
        const DB_1 = DELTA_1;

        // batch weight update
        this.batch_DW_1 = math.add(this.batch_DW_1, DW_1) as Matrix;
        this.batch_DB_1 = math.add(this.batch_DB_1, DB_1) as Matrix;
        this.batch_DW_2 = math.add(this.batch_DW_2, DW_2) as Matrix;
        this.batch_DB_2 = math.add(this.batch_DB_2, DB_2) as Matrix;
        this.batch_DW_3 = math.add(this.batch_DW_3, DW_3) as Matrix;
        this.batch_DB_3 = math.add(this.batch_DB_3, DB_3) as Matrix;

        if (this.train_counter % this.batch_size === 0) {
            this.batch_DW_1 = math.divide(this.batch_DW_1, this.batch_size) as Matrix;
            this.batch_DB_1 = math.divide(this.batch_DB_1, this.batch_size) as Matrix;
            this.batch_DW_2 = math.divide(this.batch_DW_2, this.batch_size) as Matrix;
            this.batch_DB_2 = math.divide(this.batch_DB_2, this.batch_size) as Matrix;
            this.batch_DW_3 = math.divide(this.batch_DW_3, this.batch_size) as Matrix;
            this.batch_DB_3 = math.divide(this.batch_DB_3, this.batch_size) as Matrix;

            this.W_1 = math.subtract(this.W_1, math.multiply(this.learningRate, this.batch_DW_1)) as Matrix;
            this.B_1 = math.subtract(this.B_1, math.multiply(this.learningRate, this.batch_DB_1)) as Matrix;

            this.W_2 = math.subtract(this.W_2, math.multiply(this.learningRate, this.batch_DW_2)) as Matrix;
            this.B_2 = math.subtract(this.B_2, math.multiply(this.learningRate, this.batch_DB_2)) as Matrix;

            this.W_3 = math.subtract(this.W_3, math.multiply(this.learningRate, this.batch_DW_3)) as Matrix;
            this.B_3 = math.subtract(this.B_3, math.multiply(this.learningRate, this.batch_DB_3)) as Matrix;

            this.batch_DW_1 = zeroMatrix(this.hidden1_total, this.input_total);
            this.batch_DB_1 = zeroMatrix(this.hidden1_total, 1);
            this.batch_DW_2 = zeroMatrix(this.hidden2_total, this.hidden1_total);
            this.batch_DB_2 = zeroMatrix(this.hidden2_total, 1);
            this.batch_DW_3 = zeroMatrix(this.output_total, this.hidden2_total);
            this.batch_DB_3 = zeroMatrix(this.output_total, 1);
        }

        return predictedAction;
    };

    private activation_sigmoid = (z: number): number => {
        return 1.0 / (1.0 + Math.exp(-z));
    };

    private cost_logLogisticRegression = (y: number, a: number): number => {
        // Loss = -(y*log_a + (1-y)*log_(1-a))
        // if y == 1: Loss = -log_a
        // if y == 0: Loss = -log_(1-a)
        return y === 0 ? -Math.log(1 - a) : -Math.log(a);
    };

    private lastLayerSigmoid_partial_c_z = (y: number, a: number): number => {
        // dc/dz = dc/da * da/dz
        // dc/da = -(y-a) = (a-y)
        // da/dz = a(1-a) # for sigmoid
        return (a - y) * a * (1 - a);
    };

    private partial_activation_sigmoid = (a: number): number => {
        return a * (1 - a);
    };
}
