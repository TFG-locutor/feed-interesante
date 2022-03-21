

abstract class Evento{
    
    tipo: string;
    op: string;

    [k: string]: any;

    constructor(op: string, tipo: string, json: any, campos: Array<string>) {
        this.op = op;
        this.tipo = tipo;
        for(var prop of campos) {
            this[prop] = json[prop];
            if(this[prop]===undefined/*||this[prop]==null*/) throw "No se puede construir un evento de tipo "+tipo+" porque el valor de "+prop+" es "+json[prop];
        }
    }

};

export{Evento};