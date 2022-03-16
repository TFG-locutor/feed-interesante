import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "../PuntoDeVista";

class PtoVistaProblem extends PuntoDeVista{

    _id_problema : string;

    constructor( callback : Function , id_problema : string ) {
        super( callback );
        this._id_problema = id_problema;
    }

    filtrar(evento: Evento): boolean {
        throw new Error("Method not implemented.");
    }
    procesar(evento: any): void {
        //console.log(evento);
        if(evento.tipo=="submission" && evento.problem_id==this._id_problema) {
            this._callback("Soy yo!");
        }
    }
};

export{PtoVistaProblem};
