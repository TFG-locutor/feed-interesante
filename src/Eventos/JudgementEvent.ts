/*
"start_time": "string",
"start_contest_time": "string",
"end_time": "string",
"end_contest_time": "string",
"submission_id": "string",
"id": "string",
"valid": true,
"judgement_type_id": "string",
"judgehost": "string",
"max_run_time": 0
*/

import { Evento } from "./Evento";

class JudgementEvent extends Evento {

    id!: string;
    start_time!: moment.Moment;
    start_contest_time!: moment.Moment;
    end_time!: moment.Moment;
    end_contest_time!: moment.Moment;
    submission_id!: string;
    valid!: boolean;
    judgement_type_id!: string;
    judgehost!: string;
    max_run_time!: number;

    constructor(json : any, op: string, _moment: string) {
        super(op, "judgement", _moment, json, ["id","start_time@moment","start_contest_time@moment","end_time@moment","end_contest_time@moment","submission_id","valid","judgement_type_id","judgehost","max_run_time"]);
    }

}

export {JudgementEvent}