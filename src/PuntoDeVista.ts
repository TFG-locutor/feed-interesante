import { Evento } from "./Eventos/Evento";

abstract class PuntoDeVista {

    _callback : Function;

    constructor( callback : Function ) {
        this._callback = callback;
    }

    abstract filtrar( evento : Evento ) : boolean;
    abstract procesar( evento : JSON ) : void;


};

export{PuntoDeVista};