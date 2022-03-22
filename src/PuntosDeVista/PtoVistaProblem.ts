
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "../PuntoDeVista";

class PtoVistaProblem extends PuntoDeVista{

    _id_problema : string;
    _ha_sido_resuelto : boolean;

    constructor( callback : Function , id_problema : string ) {
        super( callback );
        this._id_problema = id_problema;
        this._ha_sido_resuelto = false;
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
                this._callback("Envio con id "+evEnv.id_envio+" al problema '"+evEnv.problema+"' ("+evEnv.id_problema+") del equipo '"+evEnv.equipo+"' ("+evEnv.id_equipo+")");
                break;
            case "veredicto":
                var evVer = evento as EventoVeredicto;
                this._callback("El resultado del envío "+evVer.id_envio+" ha sido "+evVer.resultado );
                if(evVer.resultado=="AC"){
                    if(!this._ha_sido_resuelto) {
                        this._ha_sido_resuelto = true;
                        this._callback("El equipo '"+evVer.equipo+"' ("+evVer.id_equipo+") ha sido el primero en resolver el problema '"+evVer.problema+"' ("+this._id_problema+") - ["+evVer.n_intento+" intento/s]");
                    }
                }
                break;
        }

    }
};

export{PtoVistaProblem};
