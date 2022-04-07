
import { Observable } from "rxjs";
import { EventoConfiguracion } from "../Eventos/Custom/EventoConfiguracion";
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "./PuntoDeVista";

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
                        this.emitir(evVer.moment.format()+": El equipo "+this.nombre_equipo+" ("+this.id_equipo+") ha resuelto su primer problema!, "+evVer.problema+" ("+evVer.id_problema+")");
                    }
                    if(this.nProblemasResueltos==this.nProblemas) {
                        this.emitir(evVer.moment.format()+": El equipo "+this.nombre_equipo+" ("+this.id_equipo+") ha resuelto todos los problemas!")
                    }
                    if(this.nProblemasResueltos>=this.minProblemasResueltosParaComparar&&!this.msgNumAltoProblemasALaPrimera&&this.nProblemasResueltosALaPrimera/this.nProblemasResueltos>=this.proporcionProblemasResueltosALaPrimeraParaQueSeaInteresante) {
                        this.msgNumAltoProblemasALaPrimera = true;
                        this.emitir(evVer.moment.format()+": El equipo "+this.nombre_equipo+" ("+this.id_equipo+") ha resuelto muchos problemas al primer intento!");
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

