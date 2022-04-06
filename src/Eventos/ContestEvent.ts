/*
id	string
formal_name	string
penalty_time	integer
start_time	string($date-time)
end_time	string($date-time)
duration	string
scoreboard_freeze_duration	string
external_id	string
name*	string
shortname*	string
*/

import { Evento } from "./Evento";

class ContestEvent extends Evento {

    id!:string
    formal_name!:string;
    penalty_time!:number;
    start_time!:moment.Moment;//($date-time);
    end_time!:moment.Moment;//($date-time);
    duration!:string;
    scoreboard_freeze_duration!:string;
    external_id!:string;
    name!:string;
    shortname!:string;

    constructor(json : any, op: string, _moment: string) {
        super(op, "contest", _moment, json, ["id","formal_name","penalty_time","start_time@moment","end_time@moment","duration","scoreboard_freeze_duration","external_id","name","shortname"]);
    }

}

export{ContestEvent}