
import { Evento } from "../Evento";

class EventoConfiguracion extends Evento {

    nProblemas : number;
    nEquipos : number;
    nGrupos : number;
    nOrganizaciones : number;

    constructor(_moment: string, nProblemas: number=-1, nEquipos: number=-1, nGrupos: number=-1, nOrganizaciones: number=-1) {
        super("create","configuracion",_moment,null,[]);
        this.nProblemas = nProblemas;
        this.nEquipos = nEquipos;
        this.nGrupos = nGrupos;
        this.nOrganizaciones = nOrganizaciones;
    }

}

export{EventoConfiguracion};