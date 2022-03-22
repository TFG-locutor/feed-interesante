
/*
    language_id: string;
    time: string;
    contest_time: string;
    team_id: string;
    problem_id: string;
    id: string;
    external_id: string;
    entry_point: string;
    files: [
    {
      href: string;
      mime: string
    }
*/

import { Evento } from "./Evento";

class SubmissionEvent extends Evento {

    id!: string;
    language_id!: string;
    time!: string;
    contest_time!: string;
    team_id!: string;
    problem_id!: string;
    external_id!: string;
    entry_point!: string;

    constructor(json : any, op: string) {
        super(op, "submission", json, ["id","language_id","time","contest_time","team_id","problem_id","external_id","entry_point"]);
    }
    
}

export {SubmissionEvent};