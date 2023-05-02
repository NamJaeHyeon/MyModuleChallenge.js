
const { GPU } = require('gpu.js');
const gpu = new GPU();
let [s, c] = [Math.sin, Math.cos];
function getMatrix(rotX, rotY, rotZ){
    let [sRotX, cRotX, sRotY, cRotY, sRotZ, cRotZ] = [s(rotX), c(rotX), s(rotY), c(rotY), s(rotZ), c(rotZ)];
    modifiedrotX = [sRotZ*cRotY + cRotZ*sRotX*sRotY, cRotZ*cRotX, sRotZ*sRotY - sRotX*cRotY];
    modifiedrotY = [cRotZ*cRotY - sRotZ*sRotX*sRotY, -sRotZ*cRotX, cRotZ*sRotY + sRotZ*sRotX*cRotY];
    modifiedZ = [-cRotX*sRotY, sRotX, cRotX*cRotY];
    return [modifiedX, modifiedY, modifiedZ];
}


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
  

class threeDimensionObject{
    constructor(){
        this.points = {};
        this.polygon = {};
        this.rotating = [0, 0, 0];
        this.shifting = [0, 0, 0]
    }
    rotate(dRotX, dRotY, dRotZ){
        this.rotating = [this.rotating[0] + dRotX, this.rotating[1] + dRotY, this.rotating[2] + dRotZ];
    }
    setRotate(rotX, rotY, rotZ){
        this.rotating = [rotX, rotY, rotZ];
    }
    shift(dX, dY, dZ){
        this.shifting = [this.shifting[0] + dX, this.shifting[1] + dY, this.shifting[2] + dZ];
    }
    setShift(x, y, z){
        this.shifting = [x, y, z];
    }
    setPoint(name, x, y, z){
        this.points[name] = [x, y, z];
    }
    setPolygon(name, pointName1, pointName2, pointName3){
        this.polygon[name] = [pointName1, pointName2, pointName3];
    }
    export(){
        getMatrix()
        return
    }
}

class Scene{
    constructor(){
        this.importedObject = {};
        this.points = {};
        this.camera = {x:0, y:0, z:0, rotX: 0, rotY:0, rotz:0};
        this.shiftedPoints = [];
        this.polygon = {};
        this.rotatedPoints = [];
    }
    
    setPoint(name, x, y, z){
        this.points[name] = [x, y, z];
    }
    setPolygon(name, pointName1, pointName2, pointName3){
        this.polygon[name] = [pointName1, pointName2, pointName3];
    }


    setMatrix(){
        let [x, y, z] = [this.camera.rotX, this.camera.rotY, this.camera.rotZ]
        let [sx, cx, sy, cy, sz, cz] = [s(x), c(x), s(y), c(y), s(z), c(z)];
        modifiedX = [sz*cy + cz*sx*sy, cz*cx, sz*sy - sx*cy];
        modifiedY = [cz*cy - sz*sx*sy, -sz*cx, cz*sy + sz*sx*cy];
        modifiedZ = [-cx*sy, sx, cx*cy];
        this.matrix = [modifiedX, modifiedY, modifiedZ];
    }


}