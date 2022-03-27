import { Evento } from "./Eventos/Evento";
import { Observable } from 'rxjs';

abstract class PuntoDeVista {


    eventFeed : Observable<Evento>;

    constructor(eventFeed : Observable<Evento> ) {
        this.eventFeed =eventFeed;
    }

    abstract filtrar( evento : Evento ) : boolean;
    abstract actualizar( evento : Evento ) : void;
    abstract emitir (mensaje:String):void;
    
    procesar( evento : Evento ) : void {
        if(this.filtrar(evento)) this.actualizar(evento);
    }

};

export{PuntoDeVista};