
import { Observable } from "rxjs";
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "../PuntoDeVista";

class PtoVistaProblem extends PuntoDeVista{
    emitir(mensaje:String): void {
        console.log(mensaje)
    }

    _id_problema : string;
    _ha_sido_resuelto : boolean;

    constructor( eventFeed : Observable<any>, id_problema : string ) {
        super( eventFeed );
        this._id_problema = id_problema;
        this._ha_sido_resuelto = false;
        const that = this;
        this.eventFeed.subscribe({
            next(event) { that.procesar(event) },
            error(err) { console.error('something wrong occurred: ' + err); },
            complete() { console.log('done');}
        })
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
                this.emitir("El resultado del envío "+evVer.id_envio+" ha sido "+evVer.resultado );
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

export{PtoVistaProblem};

