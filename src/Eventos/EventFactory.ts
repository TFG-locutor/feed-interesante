
import { Evento } from "./Evento";
import { ClarificationEvent } from "./ClarificationEvent";
import { GroupEvent } from "./GroupEvent";
import { JudgementEvent } from "./JudgementEvent";
import { JudgementTypeEvent } from "./JudgementTypeEvent";
import { OrganizationEvent } from "./OrganizationEvent";
import { ProblemEvent } from "./ProblemEvent";
import { TeamEvent } from "./TeamEvent";
import { SubmissionEvent } from "./SubmissionEvent";
import { EventoVeredicto } from "./Custom/EventoVeredicto";
import { EventoEnvio } from "./Custom/EventoEnvio";
import { ContestEvent } from "./ContestsEvent";
import { LanguageEvent } from "./LanguageEvent";

type TSubData = {
    equipo:string;
    problema:string;
};

//singleton
class EventFactory {

    //Istancia del singleton
    private static instance: EventFactory;

    //asocia el id de un equipo a su nombre
    _nombre_equipo: Map<string,string>;
    private getTeamName(id: string) : string {
        var nomEquipo = this._nombre_equipo.get(id);
        if(nomEquipo==undefined) nomEquipo="unknown team name";
        return nomEquipo;
    }

    //asocia el id de un problema a su nombre
    _nombre_problema: Map<string,string>;
    private getProblemName(id: string) : string {
        var nomProblema = this._nombre_problema.get(id);
        if(nomProblema==undefined) nomProblema="unknown problem name";
        return nomProblema;
    }

    //asocia el id de un equipo a los intentos fallidos de un problema (negativo si AC)
    _intentos_por_equipo: Map<string,any>;

    //Asocia una submission a un equipo y un problema (para luego poder recuperarlo)
    _pending_submissions: Map<string,TSubData>;

    private constructor() {
        this._intentos_por_equipo = new Map<string,any>();
        this._pending_submissions = new Map<string,TSubData>();
        this._nombre_equipo = new Map<string,string>();
        this._nombre_problema = new Map<string,string>();
    }

    public static getInstance() : EventFactory {
        if(!EventFactory.instance)
            EventFactory.instance = new EventFactory();
        return EventFactory.instance;
    }

    public static obtenerEventoDesdeJSON(json: any) : Evento | null {
        return EventFactory.getInstance().obtenerEventoDesdeJSON(json);
    }
    public obtenerEventoDesdeJSON(json: any) : Evento | null {

        //console.log(json);

        if(json==undefined||json==null) throw "JSON no existente. No se puede crear la estructura del evento";
        for(var field of ["type","op","data"]) {
            if(json[field]==undefined||json[field]==null)
                throw "No se puede crear la estructura del evento. El campo "+field+" tiene el valor: "+json[field];
        }

        switch(json.type) {
            case "contests": return new ContestEvent(json.data, json.op);
            case "clarifications": return new ClarificationEvent(json.data, json.op);
            case "groups": return new GroupEvent(json.data, json.op);
            case "judgements": return new JudgementEvent(json.data, json.op);
            case "judgement-types": return new JudgementTypeEvent(json.data, json.op);
            case "languages": return new LanguageEvent(json.data, json.op);
            case "organizations": return new OrganizationEvent(json.data, json.op);
            case "problems": return new ProblemEvent(json.data, json.op);
            case "submissions": return new SubmissionEvent(json.data, json.op);
            case "teams": return new TeamEvent(json.data, json.op);
            case "runs": case "state":return null;
            default: throw "Evento no reconocido: "+json.type;
        }

    }

    //función que recive un evento, e intenta reemitirlo con información simplificada
    //la idea es reducir la lógica dentro de los puntos de vista
    //Si no se puede hacer nada, se devuelve tal y como está
    public static ProcesarYEnriquecerEvento (ev: Evento | null) : Evento | null {
        return EventFactory.getInstance().ProcesarYEnriquecerEvento(ev);
    }
    public ProcesarYEnriquecerEvento (ev: Evento | null) : Evento | null {
        if(ev==undefined||ev==null||ev.tipo==undefined) return ev;

        switch(ev.tipo) {
            case "problem":
                let evPro = ev as ProblemEvent; 
                if(evPro.op=="create"||evPro.op=="update") {
                    this._nombre_problema.set(evPro.id, evPro.name);
                }
                break;
            case "team":
                let evTea = ev as TeamEvent; 
                if(evTea.op=="create"||evTea.op=="update") {
                    this._nombre_equipo.set(evTea.id, evTea.display_name);
                }
                break;
            case "submission":
                if(ev.op=="create") {
                    var evSub = ev as SubmissionEvent;
                    var eq = evSub.team_id;
                    if(this._intentos_por_equipo.get(eq)<0) break; //Este equipo ya ha resuelto el problema, se ignoran envios posteriores
                    this._intentos_por_equipo.set(eq,(this._intentos_por_equipo.get(eq)|0)+1);
                    this._pending_submissions.set(evSub.id, {equipo: evSub.team_id, problema: evSub.problem_id});
                    return new EventoEnvio(
                        evSub.id,
                        eq, this.getTeamName(eq),
                        evSub.problem_id, this.getProblemName(evSub.problem_id)
                    );
                }
                break;
            case "judgement":
                if(ev.op=="update") {
                    var evJud = ev as JudgementEvent;
                    
                    let subData = this._pending_submissions.get(evJud.submission_id);
                    if(subData==undefined) break; //throw "Error interno, no existe un envío pasado con id "+evJud.submission_id;
                    this._pending_submissions.delete(evJud.submission_id);
    
                    //TODO: cambiar el ACs hardcodeadedo, utilizando la entidad judgement_type

                    if(evJud.judgement_type_id=="AC"){
                        this._intentos_por_equipo.set(subData.equipo,-this._intentos_por_equipo.get(subData.equipo));
                    }
                    
                    return new EventoVeredicto(
                        evJud.submission_id,
                        subData.equipo, this.getTeamName(subData.equipo),
                        subData.problema, this.getProblemName(subData.problema),
                        evJud.judgement_type_id,
                        Math.abs(this._intentos_por_equipo.get(subData.equipo))
                    );
                }
                break;
        }

        return null;
    }

}

export{EventFactory}