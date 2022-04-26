
import { Observable } from "rxjs";
import { EventoConfiguracion } from "../Eventos/Custom/EventoConfiguracion";
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { EventoSalida, PuntoDeVista } from "./PuntoDeVista";

class PuntoDeVistaEquipo extends PuntoDeVista{
    
    id_equipo: string;
    nombre_equipo: string;

    nProblemas: number;

    haResueltoUnProblema: boolean;
    nProblemasResueltos: number;

    nProblemasResueltosALaPrimera: number;
    proporcionProblemasResueltosALaPrimeraParaQueSeaInteresante: number;
    msgNumAltoProblemasALaPrimera: boolean;
    minProblemasResueltosParaComparar: number;

    constructor( eventFeed : Observable<Evento>, id_equipo: string, nombre_equipo: string) {
        super( eventFeed );
        this.id_equipo = id_equipo;
        this.nombre_equipo = nombre_equipo;
        this.nProblemasResueltos = 0;
        this.nProblemasResueltosALaPrimera = 0;
        this.haResueltoUnProblema = false;
        this.nProblemas = 0;
        this.proporcionProblemasResueltosALaPrimeraParaQueSeaInteresante = 0.7;
        this.msgNumAltoProblemasALaPrimera = false;
        this.minProblemasResueltosParaComparar = 3;
        console.log("creado el punto de vista del equipo "+this.nombre_equipo+" ("+this.id_equipo+")")
    }

    filtrar(evento: Evento): boolean {
        if(evento.tipo=="veredicto" && evento.id_equipo == this.id_equipo) return true;
        return false;
    }

    actualizar(evento: Evento): void {
        switch(evento.tipo) {
            case "veredicto":
                var evVer = evento as EventoVeredicto;
                if(evVer.resuelto) {
                    ++this.nProblemasResueltos;
                    if(evVer.n_intento==1) ++this.nProblemasResueltosALaPrimera;
                    if(!this.haResueltoUnProblema) {
                        this.haResueltoUnProblema = true;
                        var eventoSalida = new EventoSalida("El equipo "+this.nombre_equipo+" ("+this.id_equipo+") ha resuelto su primer problema!, "+evVer.problema+" ("+evVer.id_problema+")",
                        EventoSalida.priority.media,[this.nombre_equipo,  evVer.resultado, evVer.problema],{},evVer.moment.format(),EventoSalida.eventtype.accepted_answer);
                        this.emitir(eventoSalida);
                    }
                    if(this.nProblemasResueltos==this.nProblemas) {
                        var eventoSalida = new EventoSalida("El equipo "+this.nombre_equipo+" ("+this.id_equipo+") ha resuelto todos los problemas!",
                        EventoSalida.priority.maxima,[this.nombre_equipo,  evVer.resultado],{},evVer.moment.format(),EventoSalida.eventtype.accepted_answer);
                        //this.emitir()
                        this.emitir(eventoSalida);
                    }
                    if(this.nProblemasResueltos>=this.minProblemasResueltosParaComparar&&!this.msgNumAltoProblemasALaPrimera&&this.nProblemasResueltosALaPrimera/this.nProblemasResueltos>=this.proporcionProblemasResueltosALaPrimeraParaQueSeaInteresante) {
                        this.msgNumAltoProblemasALaPrimera = true;
                        var eventoSalida = new EventoSalida("El equipo "+this.nombre_equipo+" ("+this.id_equipo+") ha resuelto muchos problemas al primer intento!",
                        EventoSalida.priority.alta,[this.nombre_equipo,  evVer.resultado],{},evVer.moment.format(),EventoSalida.eventtype.team_multiple_firsttry_ac);
                        //this.emitir(evVer.moment.format()+": El equipo "+this.nombre_equipo+" ("+this.id_equipo+") ha resuelto muchos problemas al primer intento!");
                        this.emitir(eventoSalida);
                    }
                }
                break;
            case "configuracion":
                var evConf = evento as EventoConfiguracion;
                if(evConf.nEquipos!=-1) this.nProblemas = evConf.nProblemas;
                break;
        }
        
    }
};

export{PuntoDeVistaEquipo};

