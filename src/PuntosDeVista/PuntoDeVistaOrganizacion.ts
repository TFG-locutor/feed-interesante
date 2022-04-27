
import moment from "moment";
import { Observable } from "rxjs";
import { ContestEvent } from "../Eventos/ContestEvent";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { EventoSalida, PuntoDeVista } from "./PuntoDeVista";

type TTeamSBData = {
    score: number;
    total_penal: number;
    ranking_pos: number;
    problem_penal: Map<string,number>;
};

class PuntoDeVistaOrganizacion extends PuntoDeVista{
    
    id_organizacion : string;
    nombre_organizacion : string;

    //registro del tiempo de penalización
    penalty_time : number;
    start_moment : moment.Moment;

    //Asocia un equipo a su puntuación, penalización y posición actual en el ranking
    private teams : Array<string>;
    private team_data : Map<string,TTeamSBData>;

    constructor( eventFeed : Observable<Evento>, id_organizacion : string, nombre_organizacion : string ) {
        super( eventFeed );
        this.id_organizacion = id_organizacion;
        this.nombre_organizacion = nombre_organizacion;
        this.teams = new Array<string>();
        this.team_data = new Map<string,TTeamSBData>();
        this.penalty_time = 0;
        this.start_moment = moment();
        console.log("creado punto de vista de la organizacion "+nombre_organizacion+" ("+id_organizacion+")")
    }

    filtrar(evento: Evento): boolean {
        if(evento.tipo=="veredicto" && evento.id_organizacion == this.id_organizacion) return true;
        if(evento.tipo=="contest" && (evento.op=="create"||evento.op=="update")) return true;
        return false;
    }

    actualizar(evento: Evento): void {
        switch(evento.tipo) {
            case "veredicto":
                var evVer = evento as EventoVeredicto;
                if(!this.team_data.has(evVer.id_equipo)) {
                    this.teams.push(evVer.id_equipo);
                    this.team_data.set(evVer.id_equipo,{
                        score: 0,
                        total_penal: 0,
                        ranking_pos: this.teams.length, //si no se tenían datos, la posición era la última
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
                if(pastPenal==undefined) throw "Error interno, no se puede asociar penalización al problema "+evVer.id_problema+" del equipo "+evVer.id_equipo;
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

                /* if(pastRanking!=tData.ranking_pos) {
                    var eventoSalida = new EventoSalida("El equipo "+evVer.equipo+" ha pasado de la posición "+pastRanking+" a la posición "+tData.ranking_pos+" dentro de la organización "+this.nombre_organizacion+" después de recibir un "+evVer.resultado+" en el problema "+evVer.problema,
                        EventoSalida.priority.media,[this.nombre_organizacion, evVer.equipo, evVer.resultado, evVer.id_organizacion, "scoreboard_organization"],{},evVer.moment.format(),EventoSalida.eventtype.organization_scoreboard_change);
                    //this.emitir(eventoSalida);
                } */

                break;
            case "contest":
                var evCon = evento as ContestEvent;
                this.penalty_time = evCon.penalty_time;
                this.start_moment = evCon.start_time;
                break;
        }
    }
};

export{PuntoDeVistaOrganizacion};

