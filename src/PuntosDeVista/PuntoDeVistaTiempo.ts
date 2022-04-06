import moment, { now } from "moment";
import { Observable } from "rxjs";
import { ContestEvent } from "../Eventos/ContestEvent";
import { CambioEstado, EventoCambioEstado, TipoCambioEstado } from "../Eventos/Custom/EventoCambioEstado";
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
                            this.emitir("Se ha congelado el marcador");
                        } else {
                            this.emitir("Se ha descongelado el marcador");
                        }
                        break;
                    case CambioEstado.ConcursoIniciado:
                        if(forward) {
                            this.emitir("Ha empezado el concurso");
                        } else {
                            this.emitir("El concurso aún no ha empezado");
                        }
                        break;
                    case CambioEstado.ConcursoFinalizado:
                        if(forward) {
                            this.emitir("Ha terminado el concurso");
                        } else {
                            this.emitir("El concurso aún no ha terminado");
                        }
                        break;
                }
                break;
        }
    }

}

export{PuntoDeVistaTiempo}