
import moment from "moment";
import { Observable } from "rxjs";
import { EventoConfiguracion } from "../Eventos/Custom/EventoConfiguracion";
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "./PuntoDeVista";

class PuntoDeVistaProblema extends PuntoDeVista{
    
    id_problema : string;
    nombre_problema : string;

    ha_sido_resuelto : boolean;
    nVecesResuelto : number;
    last_AC : moment.Moment | null;
    msgLongSinceLastAC : boolean;
    minsCosideredLongSinceLastAC : number; //Cuantos minutos se consideran "muchos" desde el último AC

    nEquipos : number;

    msgCuestaResulverUnProblema: Set<string>;
    msgCuestaResulverUnProblemaMuyResuelto: Set<string>;
    nIntentosParaConsiderarQueTeCuesta: number;
    nIntentosParaConsiderarQueTeCuestaAlgoResuelto: number;
    proporcionVecesResueltoParaConsiderarAlgoFacil: number;

    constructor( eventFeed : Observable<Evento>, id_problema : string, nombre_problema: string) {
        super( eventFeed );
        this.id_problema = id_problema;
        this.nombre_problema = nombre_problema;
        this.ha_sido_resuelto = false;
        this.nEquipos = 0;
        this.nVecesResuelto = 0;
        this.last_AC = null;
        this.msgLongSinceLastAC = false;
        this.minsCosideredLongSinceLastAC = 20;
        this.msgCuestaResulverUnProblema = new Set<string>();
        this.msgCuestaResulverUnProblemaMuyResuelto = new Set<string>();
        this.nIntentosParaConsiderarQueTeCuesta = 7;
        this.nIntentosParaConsiderarQueTeCuestaAlgoResuelto = 5;
        this.proporcionVecesResueltoParaConsiderarAlgoFacil = 0.25;

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

                if(evVer.resuelto){
                    ++this.nVecesResuelto;
                    this.msgLongSinceLastAC = false;
                    this.last_AC = evVer.moment;
                    if(!this.ha_sido_resuelto) {
                        this.ha_sido_resuelto = true;
                        this.emitir(evVer.moment.format()+": El equipo "+evVer.equipo+" ("+evVer.id_equipo+") ha sido el primero en resolver el problema '"+evVer.problema+"' ("+this.id_problema+") - ["+evVer.n_intento+" intento/s]");
                    }
                    if(this.nVecesResuelto==this.nEquipos) {
                        this.emitir(evVer.moment.format()+": El problema "+this.nombre_problema+" ("+this.id_problema+") ha sido resuelto por todos los equipos!");
                    }
                } else if(evVer.penaliza) {
                    if(!this.msgCuestaResulverUnProblema.has(evVer.id_envio)&&evVer.n_intento>=this.nIntentosParaConsiderarQueTeCuesta) {
                        this.msgCuestaResulverUnProblema.add(evVer.id_envio);
                        this.emitir(evVer.moment.format()+": Al equipo '"+evVer.equipo+"' ("+evVer.id_equipo+") le está costando resolver el problema "+this.nombre_problema+" ("+this.id_problema+")");
                    }
                    if(!this.msgCuestaResulverUnProblemaMuyResuelto.has(evVer.id_envio)&&evVer.n_intento>=this.nIntentosParaConsiderarQueTeCuestaAlgoResuelto&&(this.nVecesResuelto/this.nEquipos)>this.proporcionVecesResueltoParaConsiderarAlgoFacil) {
                        this.msgCuestaResulverUnProblemaMuyResuelto.add(evVer.id_envio);
                        this.emitir(evVer.moment.format()+": Al equipo '"+evVer.equipo+"' ("+evVer.id_equipo+") le está costando resolver el problema "+this.nombre_problema+" ("+this.id_problema+"), que tiene ya bastantes envios correctos");
                    }
                }
                
                break;
            case "bump":
                //Ha pasado mucho tiempo desde el último AC
                if(this.last_AC!=null&&!this.msgLongSinceLastAC&&(this.last_AC.diff(evento.moment)/60000)>=this.minsCosideredLongSinceLastAC) {
                    this.msgLongSinceLastAC = true;
                    this.emitir(evento.moment.format()+": Ha pasado mucho tiempo ("+this.minsCosideredLongSinceLastAC+"mins) desde que el problema "+this.nombre_problema+" ("+this.id_problema+") se ha solucionado por última vez");
                }
                break;
            case "configuracion":
                var evConf = evento as EventoConfiguracion;
                if(evConf.nEquipos!=-1) this.nEquipos = evConf.nEquipos;
                break;
        }

    }
};

export{PuntoDeVistaProblema};

