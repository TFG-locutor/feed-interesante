import { Hash } from "crypto";
import { EventoEnvio } from "../Eventos/Custom/EventoEnvio";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { JudgementEvent } from "../Eventos/JudgementEvent";
import { ProblemEvent } from "../Eventos/ProblemEvent";
import { SubmissionEvent } from "../Eventos/SubmissionEvent";
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
    /*
    old_filtrar(evento: Evento): boolean {
        if(evento.tipo=="submission" && evento.op=="create" && evento.problem_id==this._id_problema) return true;
        if(evento.tipo=="judgement" && evento.op=="update" && this._pending_submissions.get(evento.submission_id) ) return true;
        return false;
    }

    old_actualizar(evento: Evento): void {
        switch(evento.tipo) {
            case "submission":
                var evSub = evento as SubmissionEvent;

                var eq = evSub.team_id;
                //if(!this._datos_por_equipo.has(eq)) this._datos_por_equipo.set(eq,0); //parece que no hace falta
                if(this._datos_por_equipo.get(eq)==-1) return; //Este equipo ya ha resuelto el problema, se ignoran envios posteriores
                this._datos_por_equipo.set(eq,(this._datos_por_equipo.get(eq)|0)+1);

                //console.log((this._pending_submissions.get(evSub.id) | 0));
                this._pending_submissions.set(evSub.id, evSub.team_id);
                this._callback("Envio con id "+evSub.id+" al problema "+this._id_problema+" del equipo con id "+evSub.team_id);
                break;
            case "judgement":
                var evJud = evento as JudgementEvent;
                //console.log(evJud);
                
                let equipo = this._pending_submissions.get(evJud.submission_id);
                if(equipo==undefined) throw "Error interno, no existe un envío pasado con id "+evJud.submission_id;
                this._pending_submissions.delete(evJud.submission_id);

                //TODO: cambiar el ACs hardcodeadedo, utilizando la entidad judgement_type

                this._callback("El resultado del envío "+evJud.submission_id+" ha sido "+evJud.judgement_type_id );
                if(evJud.judgement_type_id=="AC"){
                    this._datos_por_equipo.set(equipo,-1);
                    if(!this._ha_sido_resuelto) {
                        this._ha_sido_resuelto = true;
                        this._callback("El equipo con id "+equipo+" ha sido el primero en resolver el problema con id "+this._id_problema);
                    }
                }
                break;
        }

    }*/
};

export{PtoVistaProblem};
