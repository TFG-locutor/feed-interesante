import { EventoSalida, PuntoDeVista } from "../../PuntosDeVista/PuntoDeVista"

var twitterConfig = {
    twitter_bot: {
        appKey: 'KsBeVPtfZEkzb3UlzSH0cpnhR',
        appSecret: 'E97gVlSRope4ayc6IwhDehxqGhcrsFSqHEtTu2NuT82CteZYSx',
        accessToken: '1517889802640801792-waU9sERqZpOGV24ltBnSXa6qFaMLRx',
        accessSecret: 'OFcU8lgmotG3J1Qn3LTLprI2KNtyAQy81lcSf5WCk1rBu'
    },
    minimum_priority_all_events: EventoSalida.priority.maxima,
    minimum_priority_interestedin_events: EventoSalida.priority.media,
    interested_in_tags: ["Comercio"]

}

export{
    twitterConfig
}


