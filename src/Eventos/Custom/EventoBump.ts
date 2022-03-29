
import moment from "moment";
import { Evento } from "../Evento";

//Evento que se envía periodicamente a los puntos de vista (para que emitan eventos que dependen del tiempo)

class EventoBump extends Evento {

    constructor(_moment: string) {
        super("void","bump",_moment,null,[]);
    }

}

export{EventoBump};