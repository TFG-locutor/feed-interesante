
abstract class Evento{
    
    tipo: string;
    op: string;

    constructor(op: string, tipo: string) {
        this.op = op;
        this.tipo = tipo;
    }

};

export{Evento};