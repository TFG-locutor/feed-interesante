import { Evento } from "../Eventos/Evento";
import { Observable, Subject } from 'rxjs';

abstract class PuntoDeVista {
    //emisor eventos de salida
    eventEmiter : Subject<String>;
    eventFeed : Observable<Evento>;
    constructor(eventFeed : Observable<Evento> ) {
        this.eventFeed =eventFeed;
        const that = this;
        this.eventFeed.subscribe({
            next(event) { that.procesar(event) },
            error(err) { console.error('something wrong occurred: ' + err); },
            complete() { console.log('done');}
        })

        this.eventEmiter = new Subject<String>();
    }

    abstract filtrar( evento : Evento ) : boolean;
    abstract actualizar( evento : Evento ) : void;

    emitir(mensaje:String): void {
        this.eventEmiter.next(mensaje);
    }
    
    procesar( evento : Evento ) : void {
        if(this.filtrar(evento)) this.actualizar(evento);
    }

    getEventEmiter(): Observable<String> {
        return this.eventEmiter.asObservable();
    }

};

export{PuntoDeVista};