import { Evento } from "../Eventos/Evento";
import { Observable, Subject } from 'rxjs';

enum priority { 
    minima,
    baja,
    media,
    alta,
    maxima
}
class EventoSalida {
    

    id: string; 
    message: string; 
    prioridad: priority; 
    tags: String[]; 
    info: {};
    time : String;

    static readonly priority = priority;
    readonly priority = EventoSalida.priority;

    constructor(id: string, message: string, prioridad: number, tags: String[], info: {}, time: String) {
        this.id = id;
        this.message = message;
        this.prioridad = prioridad;
        this.tags = tags;
        this.info = info;
        this.time = time;
    }

    

}
abstract class PuntoDeVista {
    //emisor eventos de salida
    eventEmiter : Subject<EventoSalida>;
    eventFeed : Observable<Evento>;


    constructor(eventFeed : Observable<Evento> ) {
        this.eventFeed =eventFeed;
        const that = this;
        this.eventFeed.subscribe({
            next(event) { that.procesar(event) },
            error(err) { console.error('something wrong occurred: ' + err); },
            complete() { console.log('done');}
        })

        this.eventEmiter = new Subject<EventoSalida>();

    }

    abstract filtrar( evento : Evento ) : boolean;
    abstract actualizar( evento : Evento ) : void;

    emitir(mensaje:EventoSalida ): void {
        this.eventEmiter.next(mensaje);
        //TODO borrar
        //console.log(mensaje)
    }
    
    procesar( evento : Evento ) : void {
        if(this.filtrar(evento)) this.actualizar(evento);
    }

    getEventEmiter(): Observable<Object> {
        return this.eventEmiter.asObservable();
    }

};

export{PuntoDeVista, EventoSalida};