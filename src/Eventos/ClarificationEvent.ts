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

import moment from "moment";
import { Evento } from "./Evento";

class ClarificationEvent extends Evento {

    id!: string;
    time!: moment.Moment;
    contest_time!: string;
    problem_id!: string;
    reply_to_id!: string;
    from_team_id!: string;
    to_team_id!: string;
    externalid!: string;
    text!: string;
    //answered!: boolean;

    constructor(json : any, op: string, _moment: string) {
        super(op, "clarification", _moment, json, ["id","time@moment","contest_time","problem_id","reply_to_id","from_team_id","to_team_id","externalid","text",/*"answered"*/]);
    }

}

export {ClarificationEvent}