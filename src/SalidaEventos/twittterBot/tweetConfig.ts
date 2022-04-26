import { EventoSalida, PuntoDeVista } from "../../PuntosDeVista/PuntoDeVista"

var twitterConfig = {
    twitter_bot: {
        appKey: '',
        appSecret: '',
        accessToken: '',
        accessSecret: ''
    },
    minimum_priority_all_events: EventoSalida.priority.maxima,
    minimum_priority_interestedin_events: EventoSalida.priority.media,
    interested_in_tags: ["Comercio"]

}

export{
    twitterConfig
}


