import moment, { now } from "moment";
import { Observable } from "rxjs";
import { ContestEvent } from "../Eventos/ContestEvent";
import { CambioEstado, EventoCambioEstado, TipoCambioEstado } from "../Eventos/Custom/EventoCambioEstado";
import { EventoTiempo } from "../Eventos/Custom/EventoTiempo";
import { Evento } from "../Eventos/Evento";
import { EventoSalida, PuntoDeVista } from "./PuntoDeVista";

class PuntoDeVistaTiempo extends PuntoDeVista {

    sb_freeze_duration : string | null;
    contest_end : moment.Moment | null;

    freezeTime : moment.Moment | null;
    marcadorCongeladoComunicado : boolean;

    fin_recap : boolean = false;

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
        if( evento.tipo == "tiempo") return true;
        if( evento.tipo == "fin_recap") return true;
        return false;
    }
    actualizar(evento: Evento): void {
        //console.log("Evento relacionado con el tiempo:");
        //console.log(evento);
        switch(evento.tipo) {
            case "cambio_estado":
                if(!this.fin_recap) break;
                var evCE = evento as EventoCambioEstado;
                var forward : boolean = evCE.tipo_cambio == TipoCambioEstado.Normal;
                switch(evCE.cambio) {
                    case CambioEstado.MarcadorCongelado:
                        if(forward) {
                            var eventoSalida = new EventoSalida("Se ha congelado el marcador",
                        EventoSalida.priority.maxima,["time"],{},evCE.moment.format(),EventoSalida.eventtype.contest_freeze);
                            this.emitir(eventoSalida);
                        } else {
                            var eventoSalida = new EventoSalida("Se ha descongelado el marcador",
                        EventoSalida.priority.maxima,["time"],{},evCE.moment.format(),EventoSalida.eventtype.contest_unfreeze);
                            this.emitir(eventoSalida);
                        }
                        break;
                    case CambioEstado.ConcursoIniciado:
                        if(forward) {
                            var eventoSalida = new EventoSalida("Ha empezado el concurso",
                        EventoSalida.priority.maxima,["time"],{},evCE.moment.format(),EventoSalida.eventtype.contest_start);
                            this.emitir(eventoSalida);
                        } else {
                            var eventoSalida = new EventoSalida("El concurso aún no ha empezado",
                        EventoSalida.priority.maxima,["time"],{},evCE.moment.format(),EventoSalida.eventtype.contest_not_started);
                            this.emitir(eventoSalida);
                        }
                        break;
                    case CambioEstado.ConcursoFinalizado:
                        if(forward) {
                            var eventoSalida = new EventoSalida("Ha terminado el concurso",
                        EventoSalida.priority.maxima,["time"],{},evCE.moment.format(),EventoSalida.eventtype.contest_end);
                            this.emitir(eventoSalida);
                        } else {
                            var eventoSalida = new EventoSalida("El concurso aún no ha terminado",
                        EventoSalida.priority.maxima,["time"],{},evCE.moment.format(),EventoSalida.eventtype.contest_not_ended);
                            this.emitir(eventoSalida);
                        }
                        break;
                }
                break;
            case "tiempo":
                var evTi = evento as EventoTiempo;
                this.emitir(new EventoSalida(evTi.mensaje, EventoSalida.priority.maxima, ["time_alert"], {}, evTi.moment.format(), EventoSalida.eventtype.time_alert));
                break;
        }
    }

}

export{PuntoDeVistaTiempo}