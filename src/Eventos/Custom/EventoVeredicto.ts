
import { Evento } from "../Evento";

//Evento emitido cuando se obtiene un nuevo veredicto para un problema que no se había resuelto antes

class EventoVeredicto extends Evento {

    id_envio: string;

    id_equipo: string;
    equipo: string;

    id_organizacion: string;

    grupos: Array<string>;

    id_problema: string;
    problema: string;

    resultado: string;
    resuelto: boolean;
    penaliza: boolean;

    n_intento: number;

    constructor(_moment: string, id_envio: string, id_equipo:string, equipo: string, id_organizacion: string, grupos: Array<string>, id_problema: string, problema: string, resultado: string, solved: boolean, penalty: boolean, n_intento: number) {
        
        super("create","veredicto", _moment,null,[]);

        this.id_envio = id_envio;

        this.id_equipo = id_equipo;
        this.equipo = equipo;

        this.id_organizacion = id_organizacion;

        this.grupos = grupos;

        this.id_problema = id_problema;
        this.problema = problema;

        this.resultado = resultado;
        this.resuelto = solved;
        this.penaliza = penalty;

        this.n_intento = n_intento;
    }

}

export{EventoVeredicto};