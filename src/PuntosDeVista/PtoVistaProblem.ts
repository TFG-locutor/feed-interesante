import { Hash } from "crypto";
import { Evento } from "../Eventos/Evento";
import { JudgementEvent } from "../Eventos/JudgementEvent";
import { ProblemEvent } from "../Eventos/ProblemEvent";
import { SubmissionEvent } from "../Eventos/SubmissionEvent";
import { PuntoDeVista } from "../PuntoDeVista";

class PtoVistaProblem extends PuntoDeVista{

    _id_problema : string;
    //asocia el id de un equipo a los intentos fallidos de un problema (-1 si AC)
    _datos_por_equipo : Map<string,any>;
    //Asocia una submission a un equipo (para luego poder recuperarlo)
    _pending_submissions : Map<string,string>;

    _ha_sido_resuelto : boolean;

    constructor( callback : Function , id_problema : string ) {
        super( callback );
        this._id_problema = id_problema;
        this._datos_por_equipo = new Map<string,any>();
        this._pending_submissions = new Map<string,string>();
        this._ha_sido_resuelto = false;
    }

    filtrar(evento: Evento): boolean {
        if(evento.tipo=="submission" && evento.op=="create" && evento.problem_id==this._id_problema) return true;
        if(evento.tipo=="judgement" && evento.op=="update" && this._pending_submissions.get(evento.submission_id) ) return true;
        return false;
    }

    actualizar(evento: Evento): void {
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

    }
};

export{PtoVistaProblem};
