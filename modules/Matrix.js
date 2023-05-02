const { GPU } = require('gpu.js');
const gpu = new GPU();
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

class Matrix{
    constructor(m0query0Array, n, init){
        this.data = [];
        if (typeof(m0query0Array) === 'number') {
            for (let i = 0; i < m0query0Array; i++){
                this.data.push(new Float64Array(n));
            }
            if (typeof(init) === 'number'){
                for (let i = 0; i < m0query0Array; i++){
                    for (let j = 0; j < n; j++){
                        this.data[i][j] = init;
                    }
                }
            } else if (typeof(init) === 'function'){
                for (let i = 0; i < m0query0Array; i++){
                    for (let j = 0; j < n; j++){
                        this.data[i][j] = init(i, j);
                    }
                }
            }
        } else if (typeof(m0query0Array) === 'string') {

        } else if (typeof(m0query0Array) === 'object') {
            let numberOfColumns = m0query0Array.length;
            let numberOfRows = Math.max(...m0query0Array.map(x => x.length));
            for (let i = 0; i < numberOfColumns; i++){
                this.data.push(new Float64Array(numberOfRows));
            }
            for (let i = 0; i < numberOfColumns; i++){
                for (let j = 0; j < numberOfRows; j++){
                    this.data[i][j] = m0query0Array[i][j];
                }
            }
        }
    }

    static zeros(m, n){
        return new Matrix(m, n, 0)
    }

    static ones(m, n){
        return new Matrix(m, n, 1)
    }

    static parseMatrix(matrix){
        // validate
        if(matrix[0] !== '[' || matrix.at(-1) !== ']') throw new Error('It isn\'t matrix form.');

        // slice
        let result = matrix.slice(1, -1);

        // split columns
        result = result.replaceAll('; ', ';');
        result = result.split(';')

        // split rows
        for (let i in result) {
            let stringLength = result[i].length;
            let tmp = '';
            result[i] = result[i].replaceAll(',', ' ')

            for (let index = 0; index < stringLength; index++) {
                if (result[i][index] === ' ' && result[i][index - 1] === ' ') continue;
                tmp += result[i][index];
            }
            result[i] = tmp.split(' ').map(x => +x);
        }

        // validate
        if (result.some(x => x.some(y => isNaN(y)))) throw new Error('The matrix includes invalid value.');

        return new Matrix(result);
    }

    static copy(matrix){
        return new Matrix(matrix.data);
    }

    static dot(v1, v2){
        let type1 = typeof(v1);
        let type2 = typeof(v2);
        if (type1 === 'number' && type2 === 'number') {
            return v1 * v2;
        } else if (type1 === 'object' && type2 === 'number') {
            return new Matrix(v1.map(x => x.map(y => y * v2)));
        } else if (type1 === 'number' && type2 === 'object') {
            return new Matrix(v2.map(x => x.map(y => y * v1)));
        } else {
            return new Matrix(multMat(v1, v2));
        }
    }

    static isSameMatrix(v1, v2){
        let nc1 = v1.data.length;
        let nc2 = v2.data.length;
        if (!nc1 || !nc2 || nc1 < 1 || nc2 < 1 || nc1 != nc2) return false;
        else {
            let r = v1.data[0].length;
            if(r === v2.data[0].length){
                return v1.data.every((y, i) => y.every((x, j) => x === v2.data[i][j]));
            } else return false;
        }
    }

    toString(){
        let t = '[';
        for(let i of this.data){
            for(let j of i){
                t += j + ' ';
            }
            t += ';'
        }
        t += ']'
        return t.replaceAll(' ;', ';').replaceAll(';]', ']');
    }

    view(){
        let result = this.toString().slice(1, -1).replaceAll(';','\n').replaceAll(' ', '\t');
        console.log(result);
        return result;
    }

    isSquareMatrix(){
        return this.data.length === this.data[0].length;
    }

    isIdentityMatrix(){
        return this.isSquareMatrix() && this.data.every((x, i) => x.every((y, j) => y === (i == j ? 1 : 0)));
    }

    T(){
        let result = [];
        let numberOfColumns = this.data[0].length;
        let numberOfRows = this.data.length;
        for (let i = 0; i < numberOfColumns; i++) {
            result.push(Array(numberOfRows));
            for (let j = 0; j < numberOfRows; j++) {
                result[i][j] = this.data[j][i];
            }
        }
        return new Matrix(result);
    }

    isSymmetricMatrix(){
        return Matrix.isSameMatrix(this.data, this.T().data);
    }
}

let matrix = Matrix.parseMatrix('[1,2,4;3,4,3]');
matrix.T().view();
let a = Matrix.copy(matrix);
console.log(a)
