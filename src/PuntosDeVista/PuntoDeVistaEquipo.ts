
import { Observable } from "rxjs";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "./PuntoDeVista";

class PuntoDeVistaDummy extends PuntoDeVista{
    
    id_equipo: string;

    constructor( eventFeed : Observable<Evento>, id_equipo: string) {
        super( eventFeed );
        this.id_equipo = id_equipo;
    }

    filtrar(evento: Evento): boolean {
        return false;
    }

    actualizar(evento: Evento): void {
        
    }
};

export{PuntoDeVistaDummy};

