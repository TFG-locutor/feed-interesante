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

import { assert } from "console";
import { Evento } from "./Evento";

class JudgementEvent extends Evento {

    id: string;
    start_time: string;
    start_contest_time: string;
    end_time: string;
    end_contest_time: string;
    submission_id: string;
    valid: boolean;
    judgement_type_id: string;
    judgehost: string;
    max_run_time: number;

    constructor(json : any, op: string) {
        super(op,"judgement")
        this.id = json.id;
        assert(this.id!=undefined&&this.id!=null);
        this.start_time = json.start_time;
        assert(this.start_time!=undefined&&this.start_time!=null);
        this.start_contest_time = json.start_contest_time;
        assert(this.start_contest_time!=undefined&&this.start_contest_time!=null);
        this.end_time = json.end_time;
        assert(this.end_time!=undefined&&this.end_time!=null);
        this.end_contest_time = json.end_contest_time;
        assert(this.end_contest_time!=undefined&&this.end_contest_time!=null);
        this.submission_id = json.submission_id;
        assert(this.submission_id!=undefined&&this.submission_id!=null);
        this.valid = json.valid;
        assert(this.valid!=undefined&&this.valid!=null);
        this.judgement_type_id = json.judgement_type_id;
        assert(this.judgement_type_id!=undefined&&this.judgement_type_id!=null);
        this.judgehost = json.judgehost;
        assert(this.judgehost!=undefined&&this.judgehost!=null);
        this.max_run_time = json.max_run_time;
        assert(this.max_run_time!=undefined&&this.max_run_time!=null);

    }

}

export {JudgementEvent}