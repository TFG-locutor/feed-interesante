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
    start_time!: string;
    start_contest_time!: string;
    end_time!: string;
    end_contest_time!: string;
    submission_id!: string;
    valid!: boolean;
    judgement_type_id!: string;
    judgehost!: string;
    max_run_time!: number;

    constructor(json : any, op: string) {
        super(op, "judgement", json, ["id","start_time","start_contest_time","end_time","end_contest_time","submission_id","valid","judgement_type_id","judgehost","max_run_time"]);
    }

}

export {JudgementEvent}