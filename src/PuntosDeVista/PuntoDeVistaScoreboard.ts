
import { IncomingMessage } from "http";
import moment, { Moment } from "moment";
import { map, Observable } from "rxjs";
import { ConfigurationLoader } from "../config";
import { ContestEvent } from "../Eventos/ContestEvent";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { EventFactory } from "../Eventos/EventFactory";
import { Evento } from "../Eventos/Evento";
import { TEquipoData, TOrganizacionData, TProblemData } from "../InternalDataTypes";
import { EventoSalida, PuntoDeVista } from "./PuntoDeVista";
import { CambioEstado, TipoCambioEstado, EventoCambioEstado } from "../Eventos/Custom/EventoCambioEstado"

const http = require("http");
const https = require("https");

/*
type TTeamSBData = {
    score: number;
    total_penal: number;
    ranking_pos: number;
    problem_penal: Map<string,number>;
};*/

type TTeamSBData = {
    score: {
        num_solved: number;
        total_time: number;
    };
    rank: number;
    problems: Map<string,{
        num_judged: number;
        num_pending: number;
        solved: boolean;
        time: number | null;
        first_to_solve: boolean | null;
    }>;
};

interface Tscoreboard{
    time: moment.Moment;
    contest_time: string;
    state: {
        started: moment.Moment | null;
        ended: moment.Moment | null;
        finalized: moment.Moment | null;
        end_of_updates: moment.Moment | null;
        frozen: moment.Moment | null;
    };
    rows: [{
        rank: number;
        team_id: string;
        score: {
            num_solved: number;
            total_time: number;
        };
        problems: [{
            problem_id: string;
            num_judged: number;
            num_pending: number;
            solved: boolean;
            time: number;
            first_to_solve: boolean;
        }];
    }];
};

class PuntoDeVistaScoreboard extends PuntoDeVista{
    
    private pedir_scoreboard(callback: (sb : Tscoreboard, that : PuntoDeVistaScoreboard) => void , that : PuntoDeVistaScoreboard ) : void {
        var conf = ConfigurationLoader.load();
        var options = {
            hostname: conf.cds.url,
            port: conf.cds.port,
            path: '/api/contests/'+conf.cds.contest_id+'/scoreboard',
            method: 'GET',
            auth: conf.cds.api_user.length>0 ? conf.cds.api_user+':'+conf.cds.api_password : null
        }
        var proto = conf.cds.https ? https : http;
        //console.log("Se va a hacer la petici??n al scoreboard");
        let req = proto.request(options, (resp: IncomingMessage) => {
            let rawData : string = '';
            resp.on("data", (chunk) => {
                rawData += chunk;
                //console.log("chunk scoreboard");
            });
            resp.on("end", () => {
                //console.log("end scoreboard");
                let sb = JSON.parse(rawData);
                sb.time = moment(sb.time);
                //state
                if(sb.state.started) sb.state.started = moment(sb.state.started);
                if(sb.state.ended) sb.state.ended = moment(sb.state.ended);
                if(sb.state.finalized) sb.state.finalized = moment(sb.state.finalized);
                if(sb.state.end_of_updates) sb.state.end_of_updates = moment(sb.state.end_of_updates);
                if(sb.state.frozen) sb.state.frozen = moment(sb.state.frozen);
                let _sb : Tscoreboard = sb as Tscoreboard;
                callback(_sb, that);
            });
            resp.on("error", (err) => {
                console.log("error interno, no se puede obtener el scoreboard");
            });
        }).on("error", (err:Error) => {
            console.log("error interno, no se puede obtener el scoreboard");
        });
        req.end();
    }

    private scoreboard : Tscoreboard | null;
    //asocia un id de un equipo a los datos de ese equipo desde la ??tlima vez, para camparar
    private datosEquipo : Map<string,TTeamSBData>;
    private datosEquipoOrganizacion : Map<String, Map<string, TTeamSBData>>;

    private penalty_time : number;
    private start_moment : moment.Moment | null;
    private congelado : boolean;
    private fin_recap : boolean;

    private procesarScoreboard(sb : Tscoreboard, that : PuntoDeVistaScoreboard) : void {

        var ef : EventFactory = EventFactory.getInstance();

        //Primero se preprocesa todo para poder construir los SV peque??os y una estructura que asignar directamente a las variables antiguas

        var nuevosDatosEquipo = new Map<string, TTeamSBData>();
        var nuevosDatosEquipoOrganizacion = new Map<string, Map<string, TTeamSBData>>();
        for(var row of sb.rows) {
            var problems = new Map<string,{
                num_judged: number;
                num_pending: number;
                solved: boolean;
                time: number | null;
                first_to_solve: boolean | null;
            }>();
            for(var problem of row.problems) {
                problems.set(problem.problem_id, {
                    num_judged: problem.num_judged,
                    num_pending: problem.num_pending,
                    solved: problem.solved,
                    time: problem.time ? problem.time : null,
                    first_to_solve: problem.first_to_solve ? problem.first_to_solve : null
                });
            }
            nuevosDatosEquipo.set(row.team_id, {
                score: row.score,
                rank: row.rank,
                problems: problems
            });
            var teamData : TEquipoData | null = ef.getDatosEquipo(row.team_id);
                if(teamData==null) { teamData = {
                    nombre: "unknown team name",
                    grupos: [""],
                    organizacion: ""
                }; console.log("Error interno, no hay datos asociados al equipo con id '"+row.team_id+"'");}
            var orgData : TOrganizacionData | null = ef.getDatosOrganizacion(teamData.organizacion);
            //console.log(orgData);
            if(orgData) {
                var entryDatosEquipoOrg = nuevosDatosEquipoOrganizacion.get(orgData.id);
                if(!entryDatosEquipoOrg) nuevosDatosEquipoOrganizacion.set(orgData.id, entryDatosEquipoOrg = new Map<string, TTeamSBData>())
                entryDatosEquipoOrg.set(row.team_id, {
                    score: row.score,
                    rank: row.rank,
                    problems: problems
                });
            }
        }
        //Actualizar los sub-scoreboards de las organizaciones
        //TODO: quitar console.logs cuando se verifique 
        //console.log("Scoreboard de las organizaciones");
        for(var [org, subSB] of nuevosDatosEquipoOrganizacion.entries() ) {
            var rank = 1;
            var processed = 0;
            var lastScore = 0;
            var lastTime = 0;
            //console.log("  Scoreboard de la organizaci??n "+org);
            for(var [teamId, subSBTeamData] of subSB) {
                ++processed;
                if(subSBTeamData.score.num_solved<lastScore || (subSBTeamData.score.num_solved==lastScore && subSBTeamData.score.total_time > lastTime) )
                    rank = processed;
                subSBTeamData.rank = rank;

                lastScore = subSBTeamData.score.num_solved;
                lastTime = subSBTeamData.score.total_time;

                //console.log("    "+teamId+": rango "+subSBTeamData.rank+" con "+subSBTeamData.score.num_solved+" resueltos y un tiempo de "+subSBTeamData.score.total_time);
            }
        }

        if(that.scoreboard != null) {
            
            //Luego se compara (si no es la primera vez que se llama)

            for(var row of sb.rows) {
                //row.team_id;
                //row.rank;
                //row.score;

                var teamData : TEquipoData | null = ef.getDatosEquipo(row.team_id);
                if(teamData==null) { teamData = {
                    nombre: "unknown team name",
                    grupos: [""],
                    organizacion: ""
                }; console.log("Error interno, no hay datos asociados al equipo con id '"+row.team_id+"'");}

                var orgData : TOrganizacionData | null = ef.getDatosOrganizacion(teamData.organizacion);
                if(orgData==null) { orgData = {
                    id: "-1",
                    nombre: "unknown team name"
                }; console.log("Error interno, no hay datos asociados al la organizaci??n con id '"+teamData.organizacion+"'");}

                //que cambios ha tenido un equipo desde la ??ltima comprobaci??n
                var cambioEquipo : String | null = null;
                var cambioEquipoOrg : String | null = null;

                var entryDataNewOrg = nuevosDatosEquipoOrganizacion.get(teamData.organizacion)?.get(row.team_id);
                var entryDataOldOrg = that.datosEquipoOrganizacion.get(teamData.organizacion)?.get(row.team_id);

                for(var problem of row.problems) {
                    //problem.problem_id;
                    //problem.num_judged;
                    //problem.num_pending;
                    //problem.solved;
                    //problem.time; //undefined si solved = false
                    //problem.first_to_solve; //posiblemente undefined
                    
                    var problemData : TProblemData | null = ef.getDatosProblema(problem.problem_id);
                    if(problemData==null) {problemData = {
                        nombre: "unknown problem name"
                    }; console.log("Error interno,. no hay datos asociados al problema con id '"+problem.problem_id+"'");}

                    //Calcular diferencias entre problemas de un equipo
                    //En teor??a solo va a haber una diferencia entre sb y sb
                    //pero esto puede que no se cumpla si se hacen muchos env??os muy r??pido
                    //en ese caso simplemente se va a ignorar cualquier cambio m??s all?? del primero
                    //ya que solo se est?? limitando que un equipo realize alguna acci??n cada poco tiempo (3-4seg?)

                    var oldEntryProblema = that.datosEquipo.get(row.team_id)?.problems.get(problem.problem_id);

                    if(cambioEquipo==null) {
                        //Se comprueban en cascada todos los cambios que ha podido tener un problema
                        if(problem.solved && (!oldEntryProblema || !oldEntryProblema.solved)) {
                            cambioEquipo = "resolver el problema "+problemData.nombre+""
                            if(!oldEntryProblema || problem.num_judged==1) cambioEquipo += " a la primera"
                        }
                        if(!oldEntryProblema) {
                            //Se ha intentado un problema que no ten??a una entrada antes
                            
                        } else {

                        }
                        
                    }

                    var entryDataProblemaNewOrg = entryDataNewOrg?.problems.get(problem.problem_id);
                    var entryDataProblemaOldOrg = entryDataOldOrg?.problems.get(problem.problem_id);

                    if(cambioEquipoOrg==null) {
                        if(entryDataProblemaNewOrg?.solved && (!entryDataProblemaOldOrg || !entryDataProblemaOldOrg?.solved) ) {
                            cambioEquipoOrg = "resolver el problema "+problemData.nombre+"";
                            if(!entryDataProblemaOldOrg || entryDataProblemaNewOrg.num_judged==1) cambioEquipoOrg += " a la primera";
                        }
                    }
                    
                }

                //Calcular diferencias entre un equipo y el mismo

                var oldEntryEquipo = that.datosEquipo.get(row.team_id);
                var prio = EventoSalida.priority.alta;
                if(oldEntryEquipo && row.rank < oldEntryEquipo.rank) {
                    prio = (row.rank<=10 ? EventoSalida.priority.alta : (row.rank<=20 ? EventoSalida.priority.media : EventoSalida.priority.baja));
                    var eventoSalida = new EventoSalida("El equipo "+teamData.nombre+" ha pasado de la posici??n "+oldEntryEquipo.rank+" a la posici??n "+row.rank+" despu??s de "+cambioEquipo,
                    prio,[teamData.nombre, orgData.id, "AC", "scoreboard_general"],{},moment().format(),EventoSalida.eventtype.general_scoreboard_change);
                    that.emitir(eventoSalida);
                }

                //Calcular diferencias entre un equipo y el mismo (dentro de una organizaci??n)
                
                if(entryDataOldOrg && entryDataNewOrg && entryDataOldOrg.rank > entryDataNewOrg.rank) {
                    var eventoSalida = new EventoSalida("El equipo "+teamData.nombre+" ha pasado de la posici??n "+entryDataOldOrg.rank+" a la posici??n "+entryDataNewOrg.rank+" dentro de la organizaci??n "+orgData.nombre+" despu??s de "+cambioEquipoOrg,
                    EventoSalida.priority.media,[teamData.nombre, orgData.id, "AC", "scoreboard_organizacion"],{},moment().format(),EventoSalida.eventtype.organization_scoreboard_change);
                    that.emitir(eventoSalida);

                }
                
            }

        }
        
        //Actualizar la informaci??n para la pr??xima vez que se llame aqu??
        that.scoreboard = sb;
        that.datosEquipo = nuevosDatosEquipo;
        that.datosEquipoOrganizacion = nuevosDatosEquipoOrganizacion;

    }

    //registro del tiempo de penalizaci??n
    //start_moment : moment.Moment;

    //Asocia un equipo a su puntuaci??n, penalizaci??n y posici??n actual en el ranking
    //private teams : Array<string>;
    //private team_data : Map<string,TTeamSBData>;

    constructor( eventFeed : Observable<Evento> ) {
        super( eventFeed );
        this.scoreboard = null;
        this.penalty_time = 0;
        this.start_moment = null;
        this.congelado = false;
        this.fin_recap = false;
        /*
        this.teams = new Array<string>();
        this.team_data = new Map<string,TTeamSBData>();
        this.penalty_time = 0;
        this.start_moment = moment();
        */
        this.datosEquipo = new Map<string,TTeamSBData>();
        this.datosEquipoOrganizacion = new Map<String, Map<string, TTeamSBData>>();
        console.log("creado el punto de vista del scoreboard")
    }

    last_comparacion_primeros : moment.Moment | null = null;
    
    comparar_primeros() {
        try{
            if(this.start_moment==null) return;
            var now = moment();
            if(this.last_comparacion_primeros==null) this.last_comparacion_primeros = this.start_moment;
            if(now.diff(this.last_comparacion_primeros, "minutes")>30) {

                //Comparar los primeros puestos
                if(this.scoreboard!=null && this.scoreboard.rows.length>2 && this.scoreboard.rows.at(0) && this.scoreboard.rows.at(1)) {
                    var pri = this.scoreboard.rows.at(0);
                    var seg = this.scoreboard.rows.at(1);
                    if(!pri || !seg) return;
                    var ef = EventFactory.getInstance();
                    var dat_pri = ef.getDatosEquipo(pri.team_id);
                    var dat_seg = ef.getDatosEquipo(seg.team_id);
                    if(!dat_pri || !dat_seg) return;
                    if(seg.score.num_solved==0) return; //no hay chicha
                    var evento : EventoSalida;
                    if(pri.score.num_solved == seg.score.num_solved) {
                        evento = new EventoSalida(
                            "??Los equipos "+dat_pri.nombre+" y "+dat_seg.nombre+" van empatados a "+pri.score.num_solved+" problemas en lo alto del podio!",
                            EventoSalida.priority.maxima,
                            [dat_pri.nombre, dat_pri.nombre, dat_pri.organizacion, dat_seg.organizacion], {}, now.format(),
                            EventoSalida.eventtype.scoreboard_close_first_and_second
                        );
                        this.emitir(evento);
                        this.last_comparacion_primeros = now;
                    } else if( pri.score.num_solved - seg.score.num_solved >= 2 ) {
                        evento = new EventoSalida(
                            "El equipo "+dat_pri.nombre+" en primera posici??n le saca una ventaja de "+(pri.score.num_solved - seg.score.num_solved)+" problemas al equipo "+dat_seg.nombre+", en segunda posici??n...",
                            EventoSalida.priority.alta,
                            [dat_pri.nombre, dat_pri.nombre, dat_pri.organizacion, dat_seg.organizacion], {}, now.format(),
                            EventoSalida.eventtype.scoreboard_uncontested_first_and_second
                        );
                        this.emitir(evento);
                        this.last_comparacion_primeros = now;
                    }
                }

            }
        } catch(e) {}
    }

    filtrar(evento: Evento): boolean {
        if(evento.tipo=="fin_recap") return true;
        if(evento.tipo=="contest" && (evento.op=="create"||evento.op=="update")) return true;
        if(evento.tipo=="envio") return true;
        if(evento.tipo=="veredicto") return true;
        if(evento.tipo=="cambio_estado") return true;
        /*
        if(evento.tipo=="veredicto") return true;
        if(evento.tipo=="contest" && (evento.op=="create"||evento.op=="update")) return true;
        */
        return false;
    }

    actualizar(evento: Evento): void {

        switch(evento.tipo) {
            case "fin_recap":
                console.log("FIN RECAP, SE PIDE EL SCOREBOARD")
                this.pedir_scoreboard(this.procesarScoreboard, this);
                this.fin_recap = true;
                break;
            case "envio":
                //if(this.fin_recap && this.congelado) {
                    //this.pedir_scoreboard(this.procesarScoreboard, this);
                //}
                this.comparar_primeros();
                break;
            case "veredicto":
                if(this.fin_recap) {
                    this.pedir_scoreboard(this.procesarScoreboard, this);
                }
                break;
            case "contest":
                var evCon = evento as ContestEvent;
                this.penalty_time = evCon.penalty_time;
                this.start_moment = evCon.start_time;
                break;
            case "cambio_estado":
                var evCE = evento as EventoCambioEstado;
                if(evCE.cambio==CambioEstado.MarcadorCongelado)
                    this.congelado = evCE.tipo_cambio==TipoCambioEstado.Normal;
                break;
        }

        /*
        switch(evento.tipo) {
            case "veredicto":
                var evVer = evento as EventoVeredicto;
                if(!this.team_data.has(evVer.id_equipo)) {
                    this.teams.push(evVer.id_equipo);
                    this.team_data.set(evVer.id_equipo,{
                        score: 0,
                        total_penal: 0,
                        ranking_pos: this.teams.length, //si no se ten??an datos, la posici??n era la ??ltima
                        problem_penal: new Map<string,number>()
                    });
                }

                //TODO: vigilar si se pasa por referencia (ahora mismo se asume que si)
                var tData = this.team_data.get(evVer.id_equipo);
                if(!tData) throw "Error interno, no se pueden crear datos para el equipo "+evVer.id_equipo;
                if(!tData.problem_penal.has(evVer.id_problema))
                    tData.problem_penal.set(evVer.id_problema,0);

                //Registrar valores del pasado antes de actualizarlos
                var pastRanking = tData.ranking_pos;                
                var pastPenal = tData.problem_penal.get(evVer.id_problema);
                if(pastPenal==undefined) throw "Error interno, no se puede asociar penalizaci??n al problema "+evVer.id_problema+" del equipo "+evVer.id_equipo;
                if(evVer.resuelto) {
                    ++tData.score;
                    tData.total_penal += pastPenal | 0;
                    tData.total_penal += evVer.moment.diff(this.start_moment)/60000; // 60000 porque 1 minuto son 60000 ms
                } else if(evVer.penaliza) {
                    tData.problem_penal.set(evVer.id_problema, pastPenal + this.penalty_time );
                }

                //ordenar y actualizar ranking_pos
                let that = this;
                this.teams.sort( (a,b) => {
                    var data_a = that.team_data.get(a);
                    var data_b = that.team_data.get(b);
                    if(!data_a) throw "Error interno, no hay datos asociados al equipo "+a;
                    if(!data_b) throw "Error interno, no hay datos asociados al equipo "+b;
                    if(data_a.score==data_b.score) return data_a.total_penal - data_b.total_penal;
                    return data_b.score - data_a.score;
                });
                var rank = 0;
                var teams_processed = 0;
                var prev_score = +Infinity;
                var prev_penal = -1;
                for(var team of this.teams) {
                    var tDat = this.team_data.get(team);
                    if(!tDat) throw "Error interno, no hay datos asociados al equipo "+team;
                    ++teams_processed;
                    if(prev_score!=tDat.score || prev_penal!=tDat.total_penal) rank = teams_processed;
                    tDat.ranking_pos = rank;
                    prev_score = tDat.score; prev_penal = tDat.total_penal;
                }

                //TODO: refactorizar esto

                if(pastRanking!=tData.ranking_pos) {
                    var eventoSalida = new EventoSalida("El equipo "+evVer.equipo+" ("+evVer.id_equipo+") ha pasado de la posici??n "+pastRanking+" a la posici??n "+tData.ranking_pos+" despu??s de recibir un "+evVer.resultado+" en el problema "+evVer.problema+" ("+evVer.id_problema+")",
                        EventoSalida.priority.alta,[evVer.equipo, evVer.resultado, "scoreboard_general"],{},evVer.moment.format(),EventoSalida.eventtype.general_scoreboard_change);
                    this.emitir(eventoSalida);
                }
                //console.log(this.teams);

                break;
            case "contest":
                var evCon = evento as ContestEvent;
                this.penalty_time = evCon.penalty_time;
                this.start_moment = evCon.start_time;
                break;
        }*/
        //console.log(evento)
    }
};

export{PuntoDeVistaScoreboard};

