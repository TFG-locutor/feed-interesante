import { Observable } from "rxjs";
import { EventoSalida } from "../PuntosDeVista/PuntoDeVista";

abstract class EventHandler {
    eventFeeds : Array<Observable<EventoSalida>>;
    constructor() {
        this.eventFeeds = new Array<Observable<EventoSalida>>();
    }

    observeNewEventFeed(eventFeed : Observable<EventoSalida>){
        this.eventFeeds.push(eventFeed);

        const that = this;
        eventFeed.subscribe({
            next(event) { that.procesar(event) },
            error(err) { console.error('something wrong occurred: ' + err); },
            complete() { console.log('done');}
        });
    }
    abstract procesar( evento : EventoSalida ) : void;
}

export { EventHandler };