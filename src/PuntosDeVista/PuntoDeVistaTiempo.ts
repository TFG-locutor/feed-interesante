import moment, { now } from "moment";
import { Observable } from "rxjs";
import { ContestEvent } from "../Eventos/ContestEvent";
import { CambioEstado, EventoCambioEstado, TipoCambioEstado } from "../Eventos/Custom/EventoCambioEstado";
import { Evento } from "../Eventos/Evento";
import { EventoSalida, PuntoDeVista } from "./PuntoDeVista";

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
        console.log("creado el punto de vista del tiempo")
    }

    filtrar(evento: Evento): boolean {
        if( evento.tipo == "cambio_estado" ) return true;
        return false;
    }
    actualizar(evento: Evento): void {
        //console.log("Evento relacionado con el tiempo:");
        //console.log(evento);
        switch(evento.tipo) {
            case "cambio_estado":
                var evCE = evento as EventoCambioEstado;
                var forward : boolean = evCE.tipo_cambio == TipoCambioEstado.Normal;
                switch(evCE.cambio) {
                    case CambioEstado.MarcadorCongelado:
                        if(forward) {
                            var eventoSalida = new EventoSalida("Se ha congelado el marcador",
                        EventoSalida.priority.maxima,[],{},evCE.moment.format(),EventoSalida.eventtype.accepted_answer);
                            this.emitir(eventoSalida);
                        } else {
                            var eventoSalida = new EventoSalida("Se ha descongelado el marcador",
                        EventoSalida.priority.maxima,[],{},evCE.moment.format(),EventoSalida.eventtype.accepted_answer);
                            this.emitir(eventoSalida);
                        }
                        break;
                    case CambioEstado.ConcursoIniciado:
                        if(forward) {
                            var eventoSalida = new EventoSalida("Ha empezado el concurso",
                        EventoSalida.priority.maxima,[],{},evCE.moment.format(),EventoSalida.eventtype.accepted_answer);
                            this.emitir(eventoSalida);
                        } else {
                            var eventoSalida = new EventoSalida("El concurso aún no ha empezado",
                        EventoSalida.priority.maxima,[],{},evCE.moment.format(),EventoSalida.eventtype.accepted_answer);
                            this.emitir(eventoSalida);
                        }
                        break;
                    case CambioEstado.ConcursoFinalizado:
                        if(forward) {
                            var eventoSalida = new EventoSalida("Ha terminado el concurso",
                        EventoSalida.priority.maxima,[],{},evCE.moment.format(),EventoSalida.eventtype.accepted_answer);
                            this.emitir(eventoSalida);
                        } else {
                            var eventoSalida = new EventoSalida("El concurso aún no ha terminado",
                        EventoSalida.priority.maxima,[],{},evCE.moment.format(),EventoSalida.eventtype.accepted_answer);
                            this.emitir(eventoSalida);
                        }
                        break;
                }
                break;
        }
    }

}

export{PuntoDeVistaTiempo}