import { EventoEntrada } from "./EventoEntrada";

abstract class PuntoDeVista {

    _callback : Function;

    constructor( callback : Function ) {
        this._callback = callback;
    }

    abstract filtrar( evento : EventoEntrada ) : boolean;
    abstract procesar( evento : JSON ) : void;


};

export{PuntoDeVista};