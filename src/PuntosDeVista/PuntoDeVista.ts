import { Evento } from "../Eventos/Evento";
import { Observable, Subject } from 'rxjs';

/*
Prioridad: 0 al 4
0 / mínima:a casi nadie le interesan, ya sea porque casi seguramente ese evento se reemita con más información (por ejemplo, los envios / su posterior judgement) 
u otras causas.

1 / baja: son bajas, como todos los judgement. Sería más interesante si ese judgement 
desencadena por ejemplo un cambio en el scoreboard.

2/ media: son más interesantes que los bajos pero es posible que a otros pv no les interesa.

3 / alta: podrían llegar a interesar a todos aunque no sigas a ese pv en particular.
los cambios del scoreboard general
primer en resolver problema
le esta costando Y TIENE MUCHOS AC

4 /maxima: maxima prioridad, son interesantes SI O SI, aunque no estes enterado de un concurso de programacion y por ej solo te interese un equipo.

*/
enum priority { 
    minima  ,
    baja ,
    media ,
    alta ,
    maxima
}

enum eventtype {
    //problems 
    sent = 'sent',
    judgement = 'judgement',
    accepted_answer = 'accepted_answer',
    problem_first_ac = 'first_ac',
    problem_all_ac = 'all_ac',
    hard_to_solve = 'hard_to_solve',
    hard_to_solve_high_ac_ratio = 'hard_to_solve_high_ac_ratio',
    not_accepted_answer     = 'not_accepted_answer',
    not_solved_long_ago = 'not_solved_long_ago',

    //teams actions

    team_first_ac = 'team_first_ac',
    team_all_ac = 'team_all_ac',
    team_multiple_firsttry_ac = 'team_multiple_firsttry_ac',

    //scoreboard
    general_scoreboard_change = 'general_scoreboard_change',
    organization_scoreboard_change = 'organization_scoreboard_change',
    group_scoreboard_change = 'group_scoreboard_change',
    scoreboard_close_first_and_second = 'scoreboard_close_first_and_second',
    scoreboard_uncontested_first_and_second = 'scoreboard_uncontested_first_and_second',
    
    //time
    contest_start = 'contest_start',
    contest_end = 'contest_end',
    contest_freeze = 'contest_freeze',
    contest_unfreeze = 'contest_unfreeze',
    contest_not_started = 'contest_not_started',
    contest_not_ended = 'contest_not_ended',
    time_alert = 'time_alert',
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
    private tags: string[]; 
    private info: {};
    private time : string;
    private type: eventtype;
    static readonly priority = priority;
    static readonly eventtype = eventtype;

    constructor(message: string, prioridad: priority, tags: string[], info: {}, time: string , type: eventtype) {
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

    public gettags() : string[] {
        return this.tags
    }

    public getinfo() : {} {
        return this.info
    }

    public gettime() : string {
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

    public settags(tags: string[]) {
        this.tags = tags;
    }

    public setinfo(info: {}) {
        this.info = info;
    }

    public settime(time: string) {
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