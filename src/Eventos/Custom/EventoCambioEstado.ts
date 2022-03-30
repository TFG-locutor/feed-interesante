import { Evento } from "../Evento";

enum CambioEstado {
    ConcursoIniciado,
    MarcadorCongelado,
    ConcursoFinalizado
}

enum TipoCambioEstado {
    Normal,
    Deshacer
}

class EventoCambioEstado extends Evento {

    cambio: CambioEstado;
    tipo_cambio: TipoCambioEstado;

    constructor(_moment: string, cambio: CambioEstado, tipo_cambio: TipoCambioEstado) {
        super("update", "cambio_estado", _moment, null, []);
        
        this.cambio = cambio;
        this.tipo_cambio = tipo_cambio;
    }

}

export{EventoCambioEstado,CambioEstado,TipoCambioEstado}