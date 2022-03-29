import moment, { now } from "moment";
import { Observable } from "rxjs";
import { ContestEvent } from "../Eventos/ContestsEvent";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "./PuntoDeVista";

class PuntoDeVistaTiempo extends PuntoDeVista {

    sb_freeze_duration : string | null;
    contest_end : moment.Moment | null;

    freezeTime : moment.Moment | null;
    marcadorCongeladoComunicado : boolean;

    constructor(eventFeed : Observable<Evento>) {
        super(eventFeed);
        this.sb_freeze_duration = null;
        this.contest_end = null;
        this.freezeTime = null;
        this.marcadorCongeladoComunicado = false;
    }

    private comunicarMarcadorCongelado() {
        //TODO: emitir un evento en vez de esto
        console.log("Se ha congelado el marcador!");
        this.marcadorCongeladoComunicado = true;
    }

    filtrar(evento: Evento): boolean {
        if( evento.tipo == "state" ) return true;
        if( evento.tipo == "contest" ) return true;
        if( evento.tipo == "bump") return true;
        return false;
    }
    actualizar(evento: Evento): void {
        //console.log("Evento relacionado con el tiempo:");
        //console.log(evento);
        switch(evento.tipo) {
            case "bump":
                if(!this.marcadorCongeladoComunicado && this.freezeTime!=null && this.freezeTime.isSameOrBefore(moment()))
                    this.comunicarMarcadorCongelado();
                break;
            case "contest":
                var evCon = evento as ContestEvent;
                this.sb_freeze_duration = evCon.scoreboard_freeze_duration;
                this.contest_end = evCon.end_time;
                if(this.sb_freeze_duration!=null && this.contest_end!=null) {
                    this.freezeTime = this.contest_end.clone();
                    this.freezeTime.subtract(this.sb_freeze_duration);
                    console.log("Se ha actualizado la hora de congelado a: "+this.freezeTime.format());
                    //Si el momento de congelar el marcador ha pasado del guturo al pasado
                    //if( this.freezeTime.isSameOrBefore(moment()) && !this.marcadorCongeladoComunicado )
                        //this.comunicarMarcadorCongelado();
                    //Probando otra cosa: solo si 
                    this.marcadorCongeladoComunicado = this.freezeTime.isSameOrBefore(evCon.moment);
                    if(!this.marcadorCongeladoComunicado) console.log("Marcador descongelado")
                    //if(!this.marcadorCongeladoComunicado) this.comunicarMarcadorCongelado();
                    
                }
                break;
        }
    }

}

export{PuntoDeVistaTiempo}