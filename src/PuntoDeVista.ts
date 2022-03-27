import { Evento } from "./Eventos/Evento";
import { Observable } from 'rxjs';

abstract class PuntoDeVista {
    eventFeed : Observable<Evento>;
    constructor(eventFeed : Observable<Evento> ) {
        this.eventFeed =eventFeed;
        const that = this;
        this.eventFeed.subscribe({
            next(event) { that.procesar(event) },
            error(err) { console.error('something wrong occurred: ' + err); },
            complete() { console.log('done');}
        })
    }

    abstract filtrar( evento : Evento ) : boolean;
    abstract actualizar( evento : Evento ) : void;

    emitir(mensaje:String): void {
        console.log(mensaje)
    }
    
    procesar( evento : Evento ) : void {
        if(this.filtrar(evento)) this.actualizar(evento);
    }

};

export{PuntoDeVista};