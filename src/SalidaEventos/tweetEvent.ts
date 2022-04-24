import got from "got/dist/source";
import { connectLogger } from "log4js";
import { Observable } from "rxjs";
import { TwitterClient } from "twitter-api-client";
import { EventHandler } from "./EventHandler";
import { EventoSalida } from "../PuntosDeVista/PuntoDeVista";

class tweetEvent extends EventHandler{
    twitterClient : TwitterClient;
    constructor(){
        super();
        this.twitterClient = new TwitterClient(
            {apiKey:"MsJW8O2REJlo6z9VKzfFAcyQY", apiSecret:"Ili0VHylBFzoCK8sjIopr6JUuuSTpXohfdDkCAVMnwByydjBWm", 
            accessToken:"1517889802640801792-sr9qGYUqpV02AbZMr0aXseRj6jS6ER"
            , accessTokenSecret:"bBmf9WQxtwIzX98O8Odo3ANsQrHsWZw2Fwat92EDgThZO)"});




        
    }
    
    
    
   
    procesar(evento: EventoSalida): void {
        /*
*	Code snippet for posting tweets to your own twitter account from node.js.
*	You must first create an app through twitter, grab the apps key/secret,
*	and generate your access token/secret (should be same page that you get the 
*	app key/secret).
* 	Uses oauth package found below:
*		https://github.com/ciaranj/node-oauth
*		npm install oauth
*	For additional usage beyond status updates, refer to twitter api
*		https://dev.twitter.com/docs/api/1.1
*/


/*var twitter_application_consumer_key = 'MsJW8O2REJlo6z9VKzfFAcyQY';  // API Key
var twitter_application_secret = 'Ili0VHylBFzoCK8sjIopr6JUuuSTpXohfdDkCAVMnwByydjBWm';  // API Secret
var twitter_user_access_token = '1517889802640801792-sr9qGYUqpV02AbZMr0aXseRj6jS6ER';  // Access Token
var twitter_user_secret = 'bBmf9WQxtwIzX98O8Odo3ANsQrHsWZw2Fwat92EDgThZO';  // Access Token Secret

var o = new Oauth.OAuth(
var oauth = new OAuth.OAuth(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	twitter_application_consumer_key,
	twitter_application_secret,
	'1.0A',
	null,
	'HMAC-SHA1'
);

var status = evento;  // This is the tweet (ie status)

var postBody = {
	'status': status
};

if(!status.match(/iniesta/)) return
// console.log('Ready to Tweet article:\n\t', postBody.status);
oauth.post('https://api.twitter.com/1.1/statuses/update.json',
	twitter_user_access_token,  // oauth_token (user access token)
    twitter_user_secret,  // oauth_secret (user secret)
    postBody,  // post body
    '',  // post content type ?
	function(err: any, data: any, res: any) {
		if (err) {
			console.log(err);
		} else {
			 console.log(data);
		}
	});
    }
*/}
}

export { tweetEvent };