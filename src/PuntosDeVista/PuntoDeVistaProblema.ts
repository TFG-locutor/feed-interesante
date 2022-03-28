
import { Observable } from "rxjs";
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "./PuntoDeVista";

class PuntoDeVistaProblema extends PuntoDeVista{
    

    _id_problema : string;
    _ha_sido_resuelto : boolean;

    constructor( eventFeed : Observable<Evento>, id_problema : string ) {
        super( eventFeed );
        this._id_problema = id_problema;
        this._ha_sido_resuelto = false;
        console.log("Creado punto de vista del problema "+this._id_problema);
    }

    filtrar(evento: Evento): boolean {
        if(evento.tipo=="envio" && evento.id_problema == this._id_problema) return true;
        if(evento.tipo=="veredicto" && evento.id_problema == this._id_problema) return true;
        return false;
    }

    actualizar(evento: Evento): void {
        switch(evento.tipo) {
            case "envio":
                var evEnv = evento as EventoEnvio;
                this.emitir("Envio con id "+evEnv.id_envio+" al problema '"+evEnv.problema+"' ("+evEnv.id_problema+") del equipo '"+evEnv.equipo+"' ("+evEnv.id_equipo+")");
                break;
            case "veredicto":
                var evVer = evento as EventoVeredicto;
                this.emitir("El resultado del envío "+evVer.id_envio+" ha sido "+evVer.resultado+ ", lleva "+evVer.n_intento+" intentos" );
                if(evVer.resultado=="AC"){
                    if(!this._ha_sido_resuelto) {
                        this._ha_sido_resuelto = true;
                        this.emitir("El equipo '"+evVer.equipo+"' ("+evVer.id_equipo+") ha sido el primero en resolver el problema '"+evVer.problema+"' ("+this._id_problema+") - ["+evVer.n_intento+" intento/s]");
                    }
                }
                break;
        }

    }
};

export{PuntoDeVistaProblema};
