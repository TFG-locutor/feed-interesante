import { EventoEntrada } from "../EventoEntrada";
import { PuntoDeVista } from "../PuntoDeVista";

class PtoVistaProblem extends PuntoDeVista{

    _id_problema : string;

    constructor( callback : Function , id_problema : string ) {
        super( callback );
        this._id_problema = id_problema;
    }

    filtrar(evento: String): boolean {
        throw new Error("Method not implemented.");
    }
    procesar(evento: any): void {
        //console.log(evento);
        if(evento.type=="submissions" && evento.data.problem_id==this._id_problema) {
            this._callback("Soy yo!");
        }
    }
};

export{PtoVistaProblem};
