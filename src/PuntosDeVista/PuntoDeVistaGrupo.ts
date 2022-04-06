
import moment from "moment";
import { Observable } from "rxjs";
import { ContestEvent } from "../Eventos/ContestEvent";
import { EventoVeredicto } from "../Eventos/Custom/EventoVeredicto";
import { Evento } from "../Eventos/Evento";
import { PuntoDeVista } from "./PuntoDeVista";

type TTeamSBData = {
    score: number;
    total_penal: number;
    ranking_pos: number;
    problem_penal: Map<string,number>;
};

class PuntoDeVistaGrupo extends PuntoDeVista{
    
    id_grupo : string;
    nombre_grupo : string;

    //registro del tiempo de penalización
    penalty_time : number;
    start_moment : moment.Moment;

    //Asocia un equipo a su puntuación, penalización y posición actual en el ranking
    private teams : Array<string>;
    private team_data : Map<string,TTeamSBData>;

    constructor( eventFeed : Observable<Evento>, id_grupo : string, nombre_grupo : string ) {
        super( eventFeed );
        this.id_grupo = id_grupo;
        this.nombre_grupo = nombre_grupo;
        this.teams = new Array<string>();
        this.team_data = new Map<string,TTeamSBData>();
        this.penalty_time = 0;
        this.start_moment = moment();
        console.log("creado punto de vista del grupo "+nombre_grupo+" ("+id_grupo+")")
    }

    filtrar(evento: Evento): boolean {
        if(evento.tipo=="veredicto" && evento.grupos.indexOf(this.id_grupo)!=-1) return true;
        return false;
    }

    actualizar(evento: Evento): void {
        switch(evento.tipo) {
            
        }
    }
};

export{PuntoDeVistaGrupo};

