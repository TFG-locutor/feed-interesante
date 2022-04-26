import { Evento } from "../Eventos/Evento";
import { Observable, Subject } from 'rxjs';

enum priority { 
    minima  ,
    baja ,
    media ,
    alta ,
    maxima
}

enum eventtype {
    //problems
    accepted_answer = 'accepted_answer',
    not_accepted_answer     = 'not_accepted_answer',

    //teams actions

    //scoreboard
    general_scoreboard_change = 'general_scoreboard_change',
    organization_scoreboard_change = 'organization_scoreboard_change',
    group_scoreboard_change = 'group_scoreboard_change',
    
    //time
    contest_start = 'contest_start',
    contest_end = 'contest_end',
    contest_freeze = 'contest_freeze',
    contest_unfreeze = 'contest_unfreeze',
    contest_not_started = 'contest_not_started',
    contest_not_ended = 'contest_not_ended',
}

class idGenerator {
    private static id = 0;
    public static next(): number {
        return ++idGenerator.id;
    }
}
class EventoSalida {
    

    private id: number; 
    private message: string; 
    private prioridad: priority; 
    private tags: String[]; 
    private info: {};
    private time : String;
    private type: eventtype;
    static readonly priority = priority;
    static readonly eventtype = eventtype;

    constructor(message: string, prioridad: priority, tags: String[], info: {}, time: String , type: eventtype) {
        this.id = idGenerator.next();
        this.message = message;
        this.prioridad = prioridad;
        this.tags = tags;
        this.info = info;
        this.time = time;
        this.type = type;
    }

    

    public getid() : number {
        return this.id
    }

    public getmessage() : string {
        return this.message
    }

    public getprioridad() : priority {
        return this.prioridad
    }

    public gettags() : String[] {
        return this.tags
    }

    public getinfo() : {} {
        return this.info
    }

    public gettime() : String {
        return this.time
    }

    public getJson() : string {
        return JSON.stringify(this);
    }

    public gettype() : eventtype {
        return this.type
    }

    public settype(type: eventtype) {
        this.type = type;
    }

    public setmessage(message: string) {
        this.message = message;
    }

    public setprioridad(prioridad: priority) {
        this.prioridad = prioridad;
    }

    public settags(tags: String[]) {
        this.tags = tags;
    }

    public setinfo(info: {}) {
        this.info = info;
    }

    public settime(time: String) {
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

    getEventEmiter(): Observable<EventoSalida> {
        return this.eventEmiter.asObservable();
    }

};

export{PuntoDeVista, EventoSalida};