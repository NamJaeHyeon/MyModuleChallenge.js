const { GPU } = require('gpu.js');
const gpu = new GPU();

// GPU를 사용한 행렬 곱셈 함수
function multMat(matrixA, matrixB){
    const multiplyMatrix = gpu.createKernel(function(a, b) {
        let sum = 0;
        for (let i = 0; i < this.constants.size; i++) {
            sum += a[this.thread.y][i] * b[i][this.thread.x];
        }
        return sum;
    }).setOutput([matrixA.length, matrixB[0].length])
    .setConstants({ size: matrixA[0].length });

    // 행렬 곱셈 실행
    return multiplyMatrix(matrixA, matrixB);
}

let A = [[1, 2],
        [3, 4]];

let B = [[2, -1],
        [-1.5, 0.5]];

console.log(multMat(A, B))