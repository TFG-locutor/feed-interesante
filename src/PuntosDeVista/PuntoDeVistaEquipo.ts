
import { Observable } from "rxjs";
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "./PuntoDeVista";

class PuntoDeVistaEquipo extends PuntoDeVista{
    
    id_equipo: string;

    constructor( eventFeed : Observable<Evento>, id_equipo: string) {
        super( eventFeed );
        this.id_equipo = id_equipo;
    }

    filtrar(evento: Evento): boolean {
        if(evento.tipo=="veredicto" && evento.id_equipo == this.id_equipo) return true;
        return false;
    }

    actualizar(evento: Evento): void {
        //console.log("Evento de equipo:");
        //console.log(evento)
    }
};

export{PuntoDeVistaEquipo};

