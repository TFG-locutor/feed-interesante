import {TwitterApi} from 'twitter-api-v2'
//let Twitter = require('twitter-api-v2');
import { twitterConfig } from "./tweetConfig.js";
//const twitterConfig = require('./tweetConfig');
//import { configure, getLogger, Log4js, Logger } from "log4js";



export default class twitterClass{

    constructor(){
		this.client = new TwitterApi(twitterConfig.twitter_bot).readWrite
		this.interested_in_tags = twitterConfig.interested_in_tags  
		this.minimum_priority_all_events = twitterConfig.minimum_priority_all_events
		this.minimum_priority_interestedin_events = twitterConfig.minimum_priority_interestedin_events
    }

	tweet (message) {
		this.client.v2.tweet(message).then((val) => {
			getLogger().debug(val + "wrote tweet");
		}).catch((err) => {
			getLogger().debug(err);
		})
	}
    procesar(evento) {
		
		if(!evento.prioridad) return;

		/*
		Prioridad: 0 al 4
		0 / mínima:a casi nadie le interesan, ya sea porque casi seguramente ese evento se reemita con más información (por ejemplo, los envios / su posterior judgement) 
		u otras causas.

		1 / baja: son bajas, como todos los judgement. Sería más interesante si ese judgement 
		desencadena por ejemplo un cambio en el scoreboard.

		2/ media: son más interesantes que los bajos pero es posible que a otros pv no les interesa.

		3 / alta: podrían llegar a interesar a todos aunque no sigas a ese pv en particular.
		los cambios del scoreboard general
		primer en resolver problema
		le esta costando Y TIENE MUCHOS AC

		4 /maxima: maxima prioridad, son interesantes SI O SI, aunque no estes enterado de un concurso de programacion y por ej solo te interese un equipo.

		*/

		if(
			evento.prioridad >= this.minimum_priority_all_events
			||
			(
			  evento.prioridad >= this.minimum_priority_interestedin_events
				&&
			  evento.tags && evento.tags.some(tag => this.interested_in_tags.includes(tag) )
			)
		) if(evento.message) this.tweet(evento.message);

	}
}