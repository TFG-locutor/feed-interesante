import { Evento } from "../Evento";

//La única finalidad de este evento, es comunicar a los puntos de vista que el recap (o reconstrucción del concurso) ha terminado, y a partir de ahora los eventos que se reciban serán en vivo.
class EventoFinRecap extends Evento {

    constructor(_moment : string ) {
        super("create", "fin_recap", _moment, null, []);
    }

}

export{EventoFinRecap};