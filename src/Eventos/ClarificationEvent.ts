/*
"time": "string",
"contest_time": "string",
"problem_id": "string",
"reply_to_id": "string",
"from_team_id": "string",
"to_team_id": "string",
"id": "string",
"externalid": "string",
"text": "string",
"answered": true
*/

import { assert } from "console";
import { Evento } from "./Evento";

class ClarificationEvent extends Evento {

    id: string;
    time: string;
    contest_time: string;
    problem_id: string;
    reply_to_id: string;
    from_team_id: string;
    to_team_id: string;
    externalid: string;
    text: string;
    answered: boolean;

    constructor(json : any, op: string) {
        super(op,"clarification")
        this.id = json.id;
        assert(this.id!=undefined&&this.id!=null);
        this.time = json.time;
        assert(this.time!=undefined&&this.time!=null);
        this.contest_time = json.contest_time;
        assert(this.contest_time!=undefined&&this.contest_time!=null);
        this.problem_id = json.problem_id;
        assert(this.problem_id!=undefined&&this.problem_id!=null);
        this.reply_to_id = json.reply_to_id;
        assert(this.reply_to_id!=undefined&&this.reply_to_id!=null);
        this.from_team_id = json.from_team_id;
        assert(this.from_team_id!=undefined&&this.from_team_id!=null);
        this.to_team_id = json.to_team_id;
        assert(this.to_team_id!=undefined&&this.to_team_id!=null);
        this.externalid = json.externalid;
        assert(this.externalid!=undefined&&this.externalid!=null);
        this.text = json.text;
        assert(this.text!=undefined&&this.text!=null);
        this.answered = json.answered;
        assert(this.answered!=undefined&&this.answered!=null);

    }

}

export {ClarificationEvent}