class Random{
    static uniform (a, b){
        if (!a) return Math.random();
        else if (!b) return Math.random() * a;
        else return a + Math.random() * (b - a);
    }
    static randInt (a, b){
        if (!a) return ((Math.random() * (1 << 32)) | 0) - (a << 31);
        else if (!b) return (Math.random() * a) | 0;
        else return (a + Math.random * (b - a)) | 0;
    }
    static normalize(mean, stdDeviation){
        mean = mean || 0;
        if(stdDeviation === undefined) stdDeviation = 1;
        return Math.sqrt(-2.0 * Math.log(Math.random())) * Math.cos(2.0 * Math.PI * Math.random()) * stdDeviation + mean;
    }
}

class Fillter{
    constructor(fillterArray){
        this.data = fillterArray;
    }
    filltering(Array, fn, dx, dy){
        
    }
}

class Neuron{
    constructor(info){
        // validation
        if(!info.next === undefined && !Array.isArray(info.next)) throw new Error('The key-pair type of \'next\' must be undefined or Array.');
        if(!info.prev === undefined && !Array.isArray(info.prev)) throw new Error('The key-pair type of \'prev\' must be undefined or Array.');
        if(!info.value === undefined && isNaN(Number(info.value))) throw new Error('The key-pair type of \'value\' must be undefined or Number.');
        if(!info.activate === undefined && typeof(info.activate) !== 'function') throw new Error('The key-pair type of \'value\' must be undefined or function.');
        if(info.enabled != true && info.enabled != false) throw new Error('The key-pair type of \'value\' must be undefined or function.');

        // initialize
        if(info.next.length) this.next = info.next;
        else this.next = [];
        
        if(info.prev.length) this.prev = info.prev;
        else this.prev = [];

        if (!info.activate){
            this.activate = ActivateFunction.ReLU;
        }

        this.dx = 0;
        
        this.enabled = info.enabled === false ? false : true;
    }
    connectNext(neuron){
        this.next.push(neuron);
    }
    connectPrev(neuron){
        this.next.push(neuron);
    }
}

class Layer{
    constructor(info){
        this.length = info.length;
    }
}

class ActivateFunction{
    static sigmoid = x => 1/(1+Math.exp(-x));
    static tanh = Math.tanh;
    static ReLU = x => x > 0 ? x : 0;
}

new Neuron({next: [], prev: [], enabled: true, activate: ActivateFunction});

