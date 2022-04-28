import { connectLogger } from "log4js";
import { Observable } from "rxjs";


import Twitter, { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2'
import { EventoSalida } from "../../PuntosDeVista/PuntoDeVista";
import { EventHandler } from "../EventHandler";
import { twitterConfig } from "./tweetConfig";
import { configure, getLogger, Log4js, Logger } from "log4js";
import moment from "moment";



class tweetEvent extends EventHandler{


	client: TwitterApiReadWrite;
	interested_in_tags: string[];
	minimum_priority_all_events: number
    minimum_priority_interestedin_events: number
    constructor(){
        super();   
		this.client = new Twitter(twitterConfig.twitter_bot).readWrite
		this.interested_in_tags = twitterConfig.interested_in_tags  
		this.minimum_priority_all_events = twitterConfig.minimum_priority_all_events
		this.minimum_priority_interestedin_events = twitterConfig.minimum_priority_interestedin_events

		configure({
            appenders: { 'file': { type: 'file', filename: 'logs/'+moment().format("DDMMYYYYhhmmss")+'twitter.log' } },
            categories: { default: { appenders: ['file'], level: 'debug' }}
          });   
    }

	tweet (message: string) {
		this.client.v2.tweet(message).then((val) => {
			getLogger().debug(val + "wrote tweet");
		}).catch((err) => {
			getLogger().debug(err);
		})
	}
    procesar(evento: EventoSalida): void {
		if(evento.gettags().some(tag => this.interested_in_tags.includes(tag) && evento.getprioridad() >= this.minimum_priority_interestedin_events ||
		evento.getprioridad() >= this.minimum_priority_all_events)){
			this.tweet(evento.getmessage());
		}
	}
}

export { tweetEvent };