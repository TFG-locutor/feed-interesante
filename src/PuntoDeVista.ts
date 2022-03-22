import { Evento } from "./Eventos/Evento";

abstract class PuntoDeVista {

    _callback : Function;

    constructor( callback : Function ) {
        this._callback = callback;
    }

    abstract filtrar( evento : Evento ) : boolean;
    abstract actualizar( evento : Evento ) : void;

    procesar( evento : Evento ) : void {
        if(this.filtrar(evento)) this.actualizar(evento);
    }

};

export{PuntoDeVista};