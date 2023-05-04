const gpu = new GPU();
let [s, c] = [Math.sin, Math.cos];




























class Matrix{
    constructor(array){
        this.data = [];
        for(let i = 0; i < array.length; i++){
            let d = [];
            for(let j = 0; j < array[i].length; j++)
                d.push(Number.parseFloat(array[i][j]));
            this.data.push(d);
        }
        this.numberOfColumns = array.length;
        this.numberOfRows = array[0].length;
    }
    
    static getRotationMatrix(rotX, rotY, rotZ){
        let [sRotX, cRotX, sRotY, cRotY, sRotZ, cRotZ] = [s(rotX), c(rotX), s(rotY), c(rotY), s(rotZ), c(rotZ)];
        let modifiedrotX = [sRotZ*cRotY + cRotZ*sRotX*sRotY, cRotZ*cRotX, sRotZ*sRotY - sRotX*cRotY];
        let modifiedrotY = [cRotZ*cRotY - sRotZ*sRotX*sRotY, -sRotZ*cRotX, cRotZ*sRotY + sRotZ*sRotX*cRotY];
        let modifiedrotZ = [-cRotX*sRotY, sRotX, cRotX*cRotY];
        return new Matrix([modifiedrotX, modifiedrotY, modifiedrotZ]);
    }

    static multMat(matrixA, matrixB){
        if(matrixA.numberOfColumns !== matrixB.numberOfRows) throw new Error('must... : ' + matrixA.numberOfColumns + ' == ' + matrixB.numberOfRows);
        const multiplyMatrix = gpu.createKernel(function(a, b) {
            let sum = 0;
            for (let i = 0; i < this.constants.size; i++) {
                sum += a[this.thread.y][i] * b[i][this.thread.x];
            }
            return sum;
        }).setOutput([matrixA.numberOfRows, matrixB.numberOfColumns])
        .setConstants({ size: matrixA.numberOfColumns });
        return new Matrix(multiplyMatrix(matrixA.data, matrixB.data));
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

    static duplicate(mat, n){
        let matrix = new Matrix(mat);
        for(let i = 0; i < matrix.length; i++){
            let l = matrix[i].length;
            for(let j = 0; j < n - 1; j++){
                for(let k = 0; k < l; k++){
                    matrix[i].push(matrix[i][k]);
                }
            }
        }
        return new Matrix(matrix)
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
            return new Matrix(Matrix.multMat(v1.data, v2.data));
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

    dot(m){
        return Matrix.dot(this, m);
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

    static rotateAndShift(x, y, z, rotX, rotY, rotZ, pointMatrix){
        return Matrix(Matrix.multMat(Matrix.getRotationMatrix(-rotX, -rotY, -rotZ), pointMatrix).data.map(k => [k[0] + x, k[1] + y, k[2] + z]));
    }
}

// let matrix = Matrix.parseMatrix('[1,2,3;4,5,6]');
// matrix.T().view();
// let a = Matrix.copy(matrix);
// console.log(a.dot(a.T()))


































class GUI{
    static canvas = document.querySelector('canvas').getContext('2d');
    static drawLine(x1, y1, x2, y2){
        GUI.canvas.moveTo(x1, y1);
        GUI.canvas.lineTo(x2, y2);
    }
    static stroke(){
        GUI.canvas.stroke();
    }
    static eraseAll(color){
        GUI.canvas.fillStyle = color || 'white';
        GUI.canvas.fillRect(0,0,1920,1080)
    }
    static fillPolygon(array, color){
        let ctx = GUI.canvas;
        ctx.beginPath();
        ctx.moveTo(...array[0]);
        for (let i = 1; i < array.length; i++) {
            ctx.lineTo(...array[i]);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
    static inner_3d(p1, p2, a1, a2){
        return p1.map((v, i) => (p1[i] * a2 + p2[i] * a1) / (a1 + a2));
    }

    static cliping_3d(p1, p2, p3, zPlane){
        let d1 = p1[2] > zPlane;
        let d2 = p2[2] > zPlane;
        let d3 = p3[2] > zPlane;
        if(d1 && d2 && d3){
            return [[p1, p2, p3]];
        } else if (d1 ^ d2 ^ d3){
            if(d1){
                let p2_ = GUI.inner_3d(p1, p2, p1[2] - zPlane, p2[2] + zPlane);
                let p3_ = GUI.inner_3d(p1, p3, p1[2] - zPlane, p3[2] + zPlane);
                return [[p1, p2_, p3_]];
            } else if(d2){
                let p1_ = GUI.inner_3d(p1, p2, p1[2] + zPlane, p2[2] - zPlane);
                let p3_ = GUI.inner_3d(p2, p3, p2[2] - zPlane, p3[2] + zPlane);
                return [[p1_, p2, p3_]];
            } else {
                let p2_ = GUI.inner_3d(p3, p2, p3[2] - zPlane, p2[2] + zPlane);
                let p1_ = GUI.inner_3d(p1, p3, p1[2] + zPlane, p3[2] - zPlane);
                return [[p1_, p2_, p3]];
            }
        } else if (d1 | d2 | d3){
            if(!d1) {
                let p2_ = GUI.inner_3d(p1, p2, p1[2] + zPlane, p2[2] - zPlane);
                let p3_ = GUI.inner_3d(p1, p3, p1[2] + zPlane, p3[2] - zPlane);
                return [[p2, p2_, p3_], [p2, p3_, p3]];
            } else if(!d2) {
                let p1_ = GUI.inner_3d(p2, p1, p2[2] - zPlane, p1[2] + zPlane);
                let p3_ = GUI.inner_3d(p2, p3, p2[2] - zPlane, p3[2] + zPlane);
                return [[p1, p1_, p3_], [p1, p3_, p3]];
            } else {
                let p2_ = GUI.inner_3d(p3, p2, p3[2] - zPlane, p2[2] + zPlane);
                let p1_ = GUI.inner_3d(p1, p3, p1[2] + zPlane, p3[2] - zPlane);
                return [[p1, p2, p2_], [p1, p2_, p2]];
            }
        } else {
            return [];
        }
    }
}




























class ThreeDimensionObject{
    constructor(name){
        this.name = name;
        this.points = [];
        this.pointNames = [];
        this.polygons = [];
        this.polygonNames = [];
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
        this.points.push([x, y, z]);
        this.pointNames.push(name);
    }
    setPolygon(name, pointName1, pointName2, pointName3, color){
        if(this.pointNames.includes(pointName1) && this.pointNames.includes(pointName1) && this.pointNames.includes(pointName3)){
            this.polygons.push([pointName1, pointName2, pointName3, color]);
            this.polygonNames.push(name);
        } else {
            throw new Error('must...');
        }
    }
    setSquare(name, pointName1, pointName2, pointName3, pointName4, color){
        this.setPolygon(name + '(rect1)', pointName1, pointName2, pointName3, color);
        this.setPolygon(name + '(rect2)', pointName3, pointName2, pointName4, color);
    }
    copy(){
        let obj = new ThreeDimensionObject();
        obj.points = JSON.parse(JSON.stringify(this.points));
        obj.polygon = JSON.parse(JSON.stringify(this.polygon));
        obj.rotating = JSON.parse(JSON.stringify(this.rotating));
        return n
    }
    export(){
        let rotateMatrix = Matrix.getRotationMatrix(...this.rotating);
        let pointsMatrix = new Matrix(this.points.map(x => [x[0] - this.shifting[0], x[1] - this.shifting[1], x[2] - this.shifting[2]]));
        let rotatedPoints = Matrix.multMat(rotateMatrix, pointsMatrix);
        let polygons = this.polygons.map(x => [this.pointNames.indexOf(x[0]), this.pointNames.indexOf(x[1]), this.pointNames.indexOf(x[2]), x[3]]);
        return [this.name, Matrix(rotatedPoints), polygons];
    }
}







































class Scene{
    constructor(){
        this.objects = {};
        this.camera = {x:0, y:0, z:0, rotX: 0, rotY:0, rotZ:0};
        this.zPlane = 0.1;
    }
    
    importObject(threeDimensionObject){
        let tmp = threeDimensionObject.export();
        this.objects[tmp.name] = {array: [], points: tmp[1], polygons: tmp[2]};
    }

    appendObject(name, x, y, z, rotX, rotY, rotZ){
        this.objects[name].array.push([x, y, z, rotX, rotY, rotZ]);
    }

    popObject(name, n){
        this.objects[name].array.splice(n, 1);
    }

    setPoint(name, x, y, z){
        this.points[name] = [x, y, z];
    }
    
    setPolygon(name, pointName1, pointName2, pointName3){
        this.polygon[name] = [pointName1, pointName2, pointName3];
    }

    render(){
        let rotateMatrix = Matrix.getRotationMatrix(this.camera.rotX, this.camera.rotY, this.camera.rotZ)
        let obj = {};
        for(let i in this.objects){
            let thisobj = this.objects[i];
            let arr = thisobj.array;
            let iter = arr.length;
            obj[i] = [];
            for(let j = 0; j < iter; j++){
                obj[i].push(Matrix.rotateAndShift(...arr[j], thisobj.points));
            }
        }
    }
}




























let cube = new ThreeDimensionObject('cube');

cube.setPoint('+++',1,1,1);
cube.setPoint('++-',1,1,-1);
cube.setPoint('+-+',1,-1,1);
cube.setPoint('+--',1,-1,-1);
cube.setPoint('-++',-1,1,1);
cube.setPoint('-+-',-1,1,-1);
cube.setPoint('--+',-1,-1,1);
cube.setPoint('---',-1,-1,-1);

cube.setSquare('bottom', '---', '--+', '+--', '+-+', '#ff0000')
cube.setSquare('top', '-+-', '++-', '-++', '+++', '#ff0000')
cube.setSquare('front', '+++', '+-+', '-++', '--+', '#ff0000')
cube.setSquare('back', '++-', '+--', '-+-', '---', '#ff0000')
cube.setSquare('left', '-++', '--+', '-+-', '---', '#ff0000')
cube.setSquare('right', '+++', '+-+', '++-', '+--', '#ff0000')

let scene = new Scene();
scene.importObject(cube);
scene.appendObject('cube', 0, 0, 0, 0, 0, 0);
