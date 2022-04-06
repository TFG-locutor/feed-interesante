
import { Observable } from "rxjs";
import { EventoConfiguracion } from "../Eventos/Custom/EventoConfiguracion";
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "./PuntoDeVista";

class PuntoDeVistaProblema extends PuntoDeVista{
    

    id_problema : string;
    nombre_problema : string;

    _ha_sido_resuelto : boolean;

    _nEquipos : number;

    constructor( eventFeed : Observable<Evento>, id_problema : string, nombre_problema: string) {
        super( eventFeed );
        this.id_problema = id_problema;
        this.nombre_problema = nombre_problema;
        this._ha_sido_resuelto = false;
        this._nEquipos = 0;
        console.log("creado punto de vista del problema "+this.nombre_problema+" ("+this.id_problema+")");
    }

    filtrar(evento: Evento): boolean {
        if(evento.tipo=="envio" && evento.id_problema == this.id_problema) return true;
        if(evento.tipo=="veredicto" && evento.id_problema == this.id_problema) return true;
        if(evento.tipo=="configuracion") return true;
        return false;
    }

    actualizar(evento: Evento): void {
        switch(evento.tipo) {
            case "envio":
                var evEnv = evento as EventoEnvio;
                this.emitir(evEnv.moment.format()+": Envio con id "+evEnv.id_envio+" al problema '"+evEnv.problema+"' ("+evEnv.id_problema+") del equipo '"+evEnv.equipo+"' ("+evEnv.id_equipo+")");
                break;
            case "veredicto":
                var evVer = evento as EventoVeredicto;
                this.emitir(evVer.moment.format()+": El resultado del envío "+evVer.id_envio+" ha sido "+evVer.resultado+ ", lleva "+evVer.n_intento+" intentos" );
                if(evVer.resultado=="AC"){
                    if(!this._ha_sido_resuelto) {
                        this._ha_sido_resuelto = true;
                        this.emitir(evVer.moment.format()+": El equipo '"+evVer.equipo+"' ("+evVer.id_equipo+") ha sido el primero en resolver el problema '"+evVer.problema+"' ("+this.id_problema+") - ["+evVer.n_intento+" intento/s]");
                    }
                }
                break;
            case "configuracion":
                var evConf = evento as EventoConfiguracion;
                if(evConf.nEquipos!=-1) this._nEquipos = evConf.nEquipos;
                break;
        }

    }
};

export{PuntoDeVistaProblema};

