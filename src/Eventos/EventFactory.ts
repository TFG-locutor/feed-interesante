
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
import { ContestEvent } from "./ContestEvent";
import { LanguageEvent } from "./LanguageEvent";
import { ManagerPuntosDeVista } from "../PuntosDeVista/ManagerPuntosDeVista";
import { CambioEstado, EventoCambioEstado, TipoCambioEstado } from "./Custom/EventoCambioEstado";
import moment from "moment";
import { TEquipoData, TGrupoData, TJudTypeData, TOrganizacionData, TProblemData, TSubData } from "../InternalDataTypes";
import { StateEvent } from "./StateEvent";
import { EventoTiempo } from "./Custom/EventoTiempo";


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
    public getDatosProblema(id: string) : TProblemData | null {
        var problema = this._problemas.get(id);
        if(problema==undefined) return null;
        return problema;
    }
    private getProblemName(id: string) : string {
        var problema = this._problemas.get(id);
        if(problema==undefined || problema.nombre == undefined) return "unknown problem name";
        return problema.nombre;
    }

    //Asocia un id a los datos de un equipo
    _equipos: Map<string,TEquipoData>;
    public getDatosEquipo(id: string) : TEquipoData | null {
        var equipo = this._equipos.get(id);
        if(equipo==undefined) return null;
        return equipo;
    }
    private getTeamName(id: string) : string {
        var equipo = this._equipos.get(id);
        if(equipo==undefined || equipo.nombre==undefined) return "unknown team name";
        return equipo.nombre;
    }

    _grupos: Map<string,TGrupoData>;
    public getDatosGrupo(id: string) : TGrupoData | null {
        var grupo = this._grupos.get(id);
        if(grupo==undefined) return null;
        return grupo;
    }
    private getGroupName(id: string) : string {
        var grupo = this._grupos.get(id);
        if(grupo==undefined ||grupo.nombre==undefined) return "unknown group name";
        return grupo.nombre;
    }

    _organizaciones: Map<string,TOrganizacionData>;
    public getDatosOrganizacion(id: string) : TOrganizacionData | null {
        var organizacion = this._organizaciones.get(id);
        if(organizacion==undefined) return null;
        return organizacion;
    }

    //Marcadores para los cambios de estado del concurso
    
    sb_freeze_duration : string | null;

    contest_start : moment.Moment | null;
    freezeTime : moment.Moment | null;
    contest_end : moment.Moment | null;

    comunicados : Map<CambioEstado,boolean>;

    private constructor() {
        this._intentos_por_equipo = new Map<string,Map<string,number>>();
        this._pending_submissions = new Map<string,TSubData>();
        this._judgement_types = new Map<string,TJudTypeData>();
        this._problemas = new Map<string,TProblemData>();
        this._equipos = new Map<string,TEquipoData>();
        this._grupos = new Map<string,TGrupoData>();
        this._organizaciones = new Map<string,TOrganizacionData>();

        this.sb_freeze_duration = null;
        this.contest_start = null;
        this.contest_end = null;
        this.freezeTime = null;
        this.comunicados = new Map<CambioEstado,boolean>();
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

        //console.log(json.data);

        if(json==undefined||json==null) throw "JSON no existente. No se puede crear la estructura del evento";
        for(var field of ["type","op","data"]) {
            if(json[field]==undefined||json[field]==null)
                throw "No se puede crear la estructura del evento. El campo "+field+" tiene el valor: "+json[field];
        }

        switch(json.type) {
            case "contests": return new ContestEvent(json.data, json.op, json.time);
            case "clarifications": return new ClarificationEvent(json.data, json.op, json.time);
            case "groups": return new GroupEvent(json.data, json.op, json.time);
            case "judgements": return new JudgementEvent(json.data, json.op, json.time);
            case "judgement-types": return new JudgementTypeEvent(json.data, json.op, json.time);
            case "languages": return new LanguageEvent(json.data, json.op, json.time);
            case "organizations": return new OrganizationEvent(json.data, json.op, json.time);
            case "problems": return new ProblemEvent(json.data, json.op, json.time);
            case "submissions": return new SubmissionEvent(json.data, json.op, json.time);
            case "teams": return new TeamEvent(json.data, json.op, json.time);
            case "state": return new StateEvent(json.data, json.op, json.time);
            case "runs": case "state": return null;//new DummyEvent();
            default: throw "Evento no reconocido: "+json.type;
        }

    }

    //función que recive un evento, e intenta reemitirlo con información simplificada
    //la idea es reducir la lógica dentro de los puntos de vista
    //Si no se puede hacer nada, se devuelve tal y como está
    public static ProcesarYEnriquecerEvento (ev: Evento) : Array<Evento> {
        return EventFactory.getInstance().ProcesarYEnriquecerEvento(ev);
    }

    private mensajeQuedaMitad = false;
    private mensajeQuedaUnCuarto = false;
    private mensajeQuedan10Mins = false;
    private mensajeQuedan5Mins = false;
    private mensajeQuedan5MinsFreeze = false;

    private end_of_recap = false;

    public ProcesarYEnriquecerEvento (ev: Evento) : Array<Evento> {
        if(ev==undefined||ev==null||ev.tipo==undefined) return [];
        //console.log(ev);
        var eventos = new Array<Evento>();
        /////////////////////////////
        //Primero se simula el bump//
        /////////////////////////////
        //console.log("bump")
        let ajusteTiempoBump : moment.Moment = ev.moment; // = moment();
        //console.log(this.comunicados);
        if( this.end_of_recap && (
                !this.mensajeQuedaMitad ||
                !this.mensajeQuedaUnCuarto ||
                !this.mensajeQuedan10Mins ||
                !this.mensajeQuedan5Mins
            ) && this.contest_start!=null && this.contest_end!=null && this.freezeTime!=null
        ) {
            //console.log(this.contest_start);
            //console.log(this.freezeTime);
            //console.log(this.contest_end);
            var minsDiff = this.contest_end.diff(ajusteTiempoBump, "minutes");
            var minsDiffFreeze = this.freezeTime.diff(ajusteTiempoBump, "minutes");
            
            //console.log("Quedan "+minsDiff+" minutos para que acabe el concurso");
            //console.log("Quedan "+minsDiffFreeze+" minutos para que se congele el marcador");
            var dur_concurso = this.contest_end.diff(this.contest_start, "minutes");
            //console.log("el concurso dura "+dur_concurso+" minutos, "+(dur_concurso/2)+" "+(dur_concurso/4) );
            if(!this.mensajeQuedaMitad && minsDiff<=(dur_concurso/2) && minsDiff>=(dur_concurso/2)-1 ) {
                eventos.push( new EventoTiempo(ajusteTiempoBump.format(), "¡Nos encontramos en el ecuador del concurso!") );
                this.mensajeQuedaMitad = true;
            }
            if(!this.mensajeQuedaUnCuarto && minsDiff<=(dur_concurso/4) && minsDiff>=(dur_concurso/4)-1 ) {
                eventos.push( new EventoTiempo(ajusteTiempoBump.format(), "¡Ya han pasado 3/4 del concurso!") );
                this.mensajeQuedaUnCuarto = true;
            }
            if(!this.mensajeQuedan10Mins && minsDiff<=10 && minsDiff>=9) {
                eventos.push( new EventoTiempo(ajusteTiempoBump.format(), "¡El concurso acaba en 10 minutos!") );
                this.mensajeQuedan10Mins = true;
            }
            if(!this.mensajeQuedan5Mins && minsDiff<=5 && minsDiff>=4) {
                eventos.push( new EventoTiempo(ajusteTiempoBump.format(), "¡El concurso acaba en 5 minutos!") );
                this.mensajeQuedan5Mins = true;
            }
            if(!this.mensajeQuedan5MinsFreeze && minsDiffFreeze<=5 && minsDiffFreeze>=4) {
                eventos.push( new EventoTiempo(ajusteTiempoBump.format(), "¡Quedan 5 minutos para que se congele el marcador!") );
                this.mensajeQuedan5MinsFreeze = true;
            }
        }

        //ajusteTiempoBump.add(1,"second");
        //Cambios en el estado del concurso (empieza, acaba, se congela)
        if(!this.comunicados.get(CambioEstado.ConcursoIniciado) && this.contest_start!=null && this.contest_start.isSameOrBefore(ajusteTiempoBump)) {
            this.comunicados.set(CambioEstado.ConcursoIniciado, true);
            eventos.push(new EventoCambioEstado(
                "null",
                CambioEstado.ConcursoIniciado,
                TipoCambioEstado.Normal
            ));
        }
        if(!this.comunicados.get(CambioEstado.ConcursoFinalizado) && this.contest_end!=null && this.contest_end.isSameOrBefore(ajusteTiempoBump)) {
            this.comunicados.set(CambioEstado.ConcursoFinalizado, true);
            eventos.push(new EventoCambioEstado(
                "null",
                CambioEstado.ConcursoFinalizado,
                TipoCambioEstado.Normal
            ));
        }
        //console.log(this.comunicados.get(CambioEstado.MarcadorCongelado) + " - " + this.freezeTime + " - " + ajusteTiempoBump);
        if(!this.comunicados.get(CambioEstado.MarcadorCongelado) && this.freezeTime!=null && this.freezeTime.isSameOrBefore(ajusteTiempoBump)) {
            this.comunicados.set(CambioEstado.MarcadorCongelado, true);
            eventos.push(new EventoCambioEstado(
                "null",
                CambioEstado.MarcadorCongelado,
                TipoCambioEstado.Normal
            ));
        }
        ////////////////////////////////////
        //Luego se procesa el evento en si//
        ////////////////////////////////////
        switch(ev.tipo) {
            case "contest":
                //No se comprueba que la operación no sea de tipo delete, porque en ese caso tienes problemas más grandes (el concurso que estabas locutando ya no existe)
                var evCon = ev as ContestEvent;
                //console.log(evCon);
                //console.log(evCon)
                this.sb_freeze_duration = evCon.scoreboard_freeze_duration;
                this.contest_end = evCon.end_time;
                this.contest_start = evCon.start_time;
                var duration = evCon.duration;
                if(!this.contest_end.isValid()) {
                    this.contest_end = this.contest_start.clone();
                    this.contest_end.add(duration);
                }
                //console.log("Start: "+this.contest_start.format());
                //console.log("End: "+this.contest_end.format());
                //El concurso no había empezado pero la nueva fecha de inicio implica que empezó en el pasado
                if(this.contest_start!=null && !this.comunicados.get(CambioEstado.ConcursoIniciado) && this.contest_start.isSameOrBefore(evCon.moment) ) {
                    this.comunicados.set( CambioEstado.ConcursoIniciado , true );
                    //El concurso empieza
                    eventos.push(new EventoCambioEstado(
                        evCon.moment.format(),
                        CambioEstado.ConcursoIniciado,
                        TipoCambioEstado.Normal
                    ));
                } else //El concurso empezó en el pasado pero la nueva fecha de inicio implica que empezará en el futuro
                if(this.contest_start!=null && this.comunicados.get(CambioEstado.ConcursoIniciado) && this.contest_start.isAfter(evCon.moment) ) {
                    this.comunicados.set( CambioEstado.ConcursoIniciado , false );
                    //El concurso ha dejado de haber empeado, aún no ha empezado (undo empezar)
                    eventos.push(new EventoCambioEstado(
                        evCon.moment.format(),
                        CambioEstado.ConcursoIniciado,
                        TipoCambioEstado.Deshacer
                    ));
                }
                //El concurso no había acabado pero la nueva fecha de fin implica que acabó en el pasado
                if(this.contest_end!=null && !this.comunicados.get(CambioEstado.ConcursoFinalizado) && this.contest_end.isSameOrBefore(evCon.moment) ) {
                    this.comunicados.set( CambioEstado.ConcursoFinalizado , true );
                    //El concurso acaba
                    eventos.push(new EventoCambioEstado(
                        evCon.moment.format(),
                        CambioEstado.ConcursoFinalizado,
                        TipoCambioEstado.Normal
                    ));
                } else //El concurso acabó en el pasado pero la nueva fecha de fin implica que acabará en el futuro
                if(this.contest_end!=null && this.comunicados.get(CambioEstado.ConcursoFinalizado) && this.contest_end.isAfter(evCon.moment) ) {
                    this.comunicados.set( CambioEstado.ConcursoFinalizado , false );
                    //El concurso ha dejado de estar acabado, sigue en marcha (undo acabar)
                    eventos.push(new EventoCambioEstado(
                        evCon.moment.format(),
                        CambioEstado.ConcursoFinalizado,
                        TipoCambioEstado.Deshacer
                    ));
                }
                //Manejo de el momento de congelación
                if(this.sb_freeze_duration!=null && this.contest_end!=null) {
                    this.freezeTime = this.contest_end.clone();
                    this.freezeTime.subtract(this.sb_freeze_duration);
                    //console.log("FreezeTime: "+this.freezeTime.format());
                    //console.log("Se ha actualizado la hora de congelado a: "+this.freezeTime.format());
                    //console.log(this.comunicados.get(CambioEstado.MarcadorCongelado) + " - " + evCon.moment.format())
                    //El marcador no se había congelado y ha pasado a estarlo
                    if(!this.comunicados.get(CambioEstado.MarcadorCongelado) && this.freezeTime.isSameOrBefore(evCon.moment) ) {
                        this.comunicados.set( CambioEstado.MarcadorCongelado , true );
                        //Marcador congelado
                        eventos.push(new EventoCambioEstado(
                            evCon.moment.format(),
                            CambioEstado.MarcadorCongelado,
                            TipoCambioEstado.Normal
                        ));
                    } else //El marcador se había congelado pero ya no lo está
                    if(this.comunicados.get(CambioEstado.MarcadorCongelado) && this.freezeTime.isAfter(evCon.moment) ) {
                        this.comunicados.set( CambioEstado.MarcadorCongelado , false );
                        //Marcador descongelado (undo congelar)
                        eventos.push(new EventoCambioEstado(
                            evCon.moment.format(),
                            CambioEstado.MarcadorCongelado,
                            TipoCambioEstado.Deshacer
                        ));
                    }
                    
                }
                break;
            case "problem":
                let evPro = ev as ProblemEvent;
                if(evPro.op=="manual_create" ||evPro.op=="create") {
                //if((evPro.op=="create" && !this._problemas.has(evPro.id))||evPro.op=="update") {
                    if(this._problemas.get(evPro.id)==undefined) {
                        ManagerPuntosDeVista.registrarPuntoDeVistaProblema(evPro.id, evPro.name);
                        this._problemas.set(evPro.id, { nombre: evPro.name });
                    }
                }
                break;
            case "team":
                let evTea = ev as TeamEvent; 
                if((evTea.op=="manual_create" || evTea.op=="create" ) && !evTea.hidden ) {
                //if((evTea.op=="create" && !this._equipos.has(evTea.id))||evTea.op=="update") {
                    if(this._equipos.get(evTea.id)==undefined) {//if(evTea.op=="create") {
                        //El problema es nuevo, hay que crear un punto de vista
                        ManagerPuntosDeVista.registrarPuntoDeVistaEquipo(evTea.id, evTea.name);
                        this._equipos.set(evTea.id, {nombre: evTea.name, organizacion: evTea.organization_id, grupos: evTea.group_ids});
                    }
                }
                break;
            case "group":
                let evGro = ev as GroupEvent;
                if(evGro.op=="manual_create" || evGro.op=="create") {
                //if((evGro.op=="create" && !this._grupos.has(evGro.id)) ||evGro.op=="update") {
                    if(this._grupos.get(evGro.id)==undefined) {
                        ManagerPuntosDeVista.registrarPuntoDeVistaGrupo(evGro.id, evGro.name);
                        this._grupos.set(evGro.id, {id: evGro.id, nombre: evGro.name, oculto: evGro.hidden});
                    }
                }
                break;
            case "organization":
                let evOrg = ev as OrganizationEvent;
                if(evOrg.op=="manual_create"||evOrg.op=="create") {
                    if(this._organizaciones.get(evOrg.id)==undefined) {
                        ManagerPuntosDeVista.registrarPuntoDeVistaOrganizacion(evOrg.id, evOrg.name);
                        this._organizaciones.set(evOrg.id, {id: evOrg.id, nombre: evOrg.name});
                    }
                }
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
                    if (this._equipos.has(evSub.team_id))
                    eventos.push( new EventoEnvio(
                        evSub.moment.format(),
                        evSub.id,
                        eq, this.getTeamName(eq),
                        evSub.problem_id, this.getProblemName(evSub.problem_id)
                    ) );
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
                    
                    var entry_equipo = this._equipos.get(subData.equipo);
                    if(entry_equipo==undefined) //throw "Error interno, no existe la entrada '"+subData.equipo+"' en el mapa de equipos"
                        break;

                    eventos.push( new EventoVeredicto(
                        evJud.moment.format(),
                        evJud.submission_id,
                        subData.equipo, this.getTeamName(subData.equipo),
                        entry_equipo.organizacion,
                        entry_equipo.grupos,
                        subData.problema, this.getProblemName(subData.problema),
                        evJud.judgement_type_id,
                        entry_judgement_type.resuelto,
                        entry_judgement_type.penaliza,
                        Math.abs(entry_intentos_por_equipo_problema)
                    ) );
                }
                break;
            case "fin_recap":
                this.end_of_recap = true;
                break;
        }

        return eventos;//new DummyEvent();
    }

}

export{EventFactory}