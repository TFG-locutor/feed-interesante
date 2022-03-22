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

import { Evento } from "./Evento";

class ClarificationEvent extends Evento {

    id!: string;
    time!: string;
    contest_time!: string;
    problem_id!: string;
    reply_to_id!: string;
    from_team_id!: string;
    to_team_id!: string;
    externalid!: string;
    text!: string;
    answered!: boolean;

    constructor(json : any, op: string) {
        super(op, "clarification", json, ["id","time","contest_time","problem:_id","reply_to_id","from_team_id","to_team_id","externalid","text","answered"]);
    }

}

export {ClarificationEvent}