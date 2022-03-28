
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
import { ManagerPuntosDeVista } from "../PuntosDeVista/ManagerPuntosDeVista";

type TSubData = {
    equipo:string;
    problema:string;
};

type TJudTypeData = {
    nombre: string;
    penaliza: boolean;
    resuelto: boolean;
};

type TProblemData = {
    nombre: string;
};

type TEquipoData = {
    nombre: string;
};

//singleton
class EventFactory {

    //Istancia del singleton
    private static instance: EventFactory;

    //asocia el id de un equipo y el id de un problema a los intentos (negativo si AC)
    //this._intentos_por_equipo[id_equipo][id_problema]
    _intentos_por_equipo: Map<string,Map<string,number>>;

    //Asocia una submission a un equipo y un problema (para luego poder recuperarlo)
    _pending_submissions: Map<string,TSubData>;

    //Asocia un id a un tipo de submission
    _judgement_types: Map<string,TJudTypeData>;

    //Asocia un id a los datos de un problema
    _problemas: Map<string,TProblemData>;
    private getProblemName(id: string) : string {
        var problema = this._problemas.get(id);
        if(problema==undefined || problema.nombre == undefined) return "unknown problem name";
        return problema.nombre;
    }

    //Asocia un id a los datos de un equipo
    _equipos: Map<string,TEquipoData>;
    private getTeamName(id: string) : string {
        var equipo = this._equipos.get(id);
        if(equipo==undefined || equipo.nombre==undefined) return "unknown team name";
        return equipo.nombre;
    }

    private constructor() {
        this._intentos_por_equipo = new Map<string,Map<string,number>>();
        this._pending_submissions = new Map<string,TSubData>();
        this._judgement_types = new Map<string,TJudTypeData>();
        this._problemas = new Map<string,TProblemData>();
        this._equipos = new Map<string,TEquipoData>();
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
            case "runs": case "state": return null;//new DummyEvent();
            default: throw "Evento no reconocido: "+json.type;
        }

    }

    //función que recive un evento, e intenta reemitirlo con información simplificada
    //la idea es reducir la lógica dentro de los puntos de vista
    //Si no se puede hacer nada, se devuelve tal y como está
    public static ProcesarYEnriquecerEvento (ev: Evento) : Evento | null {
        return EventFactory.getInstance().ProcesarYEnriquecerEvento(ev);
    }
    public ProcesarYEnriquecerEvento (ev: any) : Evento | null {
        if(ev==undefined||ev==null||ev.tipo==undefined) return ev;
        //console.log(ev);
        switch(ev.tipo) {
            case "problem":
                let evPro = ev as ProblemEvent;
                //console.log(evPro);
                if(evPro.op=="create"||evPro.op=="update") {
                    if(evPro.op=="create") {
                        //ManagerPuntosDeVista.registrarPuntoDeVistaProblema(evPro.id);
                    }
                    this._problemas.set(evPro.id, { nombre: evPro.name });
                }
                break;
            case "team":
                let evTea = ev as TeamEvent; 
                if(evTea.op=="create"||evTea.op=="update") {
                    if(this._equipos.get(evTea.id)==undefined) {//if(evTea.op=="create") {
                        //El problema es nuevo, hay que crear un punto de vista
                        //ManagerPuntosDeVista.registrarPuntoDeVistaEquipo(evTea.id);
                    }
                    this._equipos.set(evTea.id, {nombre: evTea.display_name});
                }
                break;
            case "submission":
                if(ev.op=="create") {
                    var evSub = ev as SubmissionEvent;
                    var eq = evSub.team_id;

                    //Se garantiza que this._intentos_por_equipo tenga entrada, y se guarda en entry_intentos_por_equipo
                    var entry_intentos_por_equipo = this._intentos_por_equipo.get(eq);
                    if(entry_intentos_por_equipo==undefined)
                        //Si no existe la entrada en el mapa para ese equipo
                        this._intentos_por_equipo.set(eq,entry_intentos_por_equipo = new Map<string,number>());
                    //Se garantiza que this._intentos_por_equipo[eq] tenga entrada, y se guarda en entry_intentos_por_equipo_problema
                    var entry_intentos_por_equipo_problema = entry_intentos_por_equipo.get(evSub.problem_id);
                    if(entry_intentos_por_equipo_problema==undefined)
                        //Si no existe la entrada en el mapa para ese problema de ese equipo
                        entry_intentos_por_equipo.set(evSub.problem_id, entry_intentos_por_equipo_problema = 0); //Se parte de un punto neutro (0 intentos)
                        
                    //Se comprueba que el equipo no tenga ya ese problema resuelto
                    if(entry_intentos_por_equipo_problema<0) break; //Este equipo ya ha resuelto el problema, se ignoran envios posteriores de cara a generar ciertos eventos custom

                    //Se añade el envío a la lista de envios pendientes de procesar
                    this._pending_submissions.set(evSub.id, {equipo: evSub.team_id, problema: evSub.problem_id});
                    return new EventoEnvio(
                        evSub.id,
                        eq, this.getTeamName(eq),
                        evSub.problem_id, this.getProblemName(evSub.problem_id)
                    );
                }
                break;
            case "judgement_type":
                if(ev.op=="create"||ev.op=="update") {
                    var evJudType = ev as JudgementTypeEvent;
                    this._judgement_types.set(evJudType.id, {nombre: evJudType.name, penaliza: evJudType.penalty, resuelto: evJudType.solved});
                }
                break;
            case "judgement":
                if(ev.op=="create" || ev.op=="update") {
                    var evJud = ev as JudgementEvent;
                    
                    //Si no contiene información del veredicto, se ignora, porque se sabe que en el futuro se va a recibir una actualización
                    if(!evJud.judgement_type_id) break;

                    let subData = this._pending_submissions.get(evJud.submission_id);
                    if(subData==undefined) break; //throw "Error interno, no existe un envío pasado con id "+evJud.submission_id;
                    this._pending_submissions.delete(evJud.submission_id);
    
                    //Entradas del mapa _intentos_por_equipo
                    var entry_intentos_por_equipo = this._intentos_por_equipo.get(subData.equipo)
                    var entry_intentos_por_equipo_problema : number | undefined = 0;
                    if(entry_intentos_por_equipo!=undefined) {
                        entry_intentos_por_equipo_problema = entry_intentos_por_equipo.get(subData.problema);
                        if(entry_intentos_por_equipo_problema==undefined)
                            throw "Error interno, no existe la entrada '"+subData.problema+"' en el mapa de intentos por equipo/problema";
                    } else throw "Error interno, no existe la entrada '"+subData.equipo+"' en el mapa de intentos por equipo";
                    
                    //Entrada del mapa _judgement_types
                    var entry_judgement_type = this._judgement_types.get(evJud.judgement_type_id);
                    if(entry_judgement_type==undefined) throw "Error interno, no existe la entrada '"+evJud.judgement_type_id+"' en el mapa de tipos de veredicto";

                    //Se suma 1 al número de intentos, pero solo si el veredizto penaliza (en muchos casos CE no penaliza), o es el intento que resuelve el problema
                    if(entry_judgement_type.resuelto || entry_judgement_type.penaliza)
                        entry_intentos_por_equipo.set(subData.problema, entry_intentos_por_equipo_problema = entry_intentos_por_equipo_problema + 1)

                    //Se comprueba si se ha resuelto el problema
                    if(entry_judgement_type.resuelto){
                        //Se pasa a negativo para indicar que el problema ha sido resuelto
                        entry_intentos_por_equipo.set(subData.problema,entry_intentos_por_equipo_problema=-entry_intentos_por_equipo_problema);
                    }
                    
                    return new EventoVeredicto(
                        evJud.submission_id,
                        subData.equipo, this.getTeamName(subData.equipo),
                        subData.problema, this.getProblemName(subData.problema),
                        evJud.judgement_type_id,
                        Math.abs(entry_intentos_por_equipo_problema)
                    );
                }
                break;
        }

        return null;//new DummyEvent();
    }

}

export{EventFactory}