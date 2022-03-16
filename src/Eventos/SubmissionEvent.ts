
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

import { assert } from "console";
import { Evento } from "./Evento";

class SubmissionEvent extends Evento {

    id : string;
    language_id: string;
    time: string;
    contest_time: string;
    team_id: string;
    problem_id: string;
    external_id: string;
    entry_point: string;

    constructor(json : any, op: string) {
        super(op, "submission");
        /*
        for(var prop in ["id","language_id","time","contest_time","team_id","problem_id","external_id","entry_point"]) {
            this[prop] = json[prop];
            assert(this[prop]!=undefined&&this[prop]!=null);
        }*/
        this.id = json.id;
        assert(this.id!=undefined&&this.id!=null);
        this.language_id = json.language_id;
        assert(this.language_id!=undefined&&this.language_id!=null);
        this.time = json.time;
        assert(this.time!=undefined&&this.time!=null);
        this.contest_time = json.contest_time;
        assert(this.contest_time!=undefined&&this.contest_time!=null);
        this.team_id = json.team_id;
        assert(this.team_id!=undefined&&this.team_id!=null);
        this.problem_id = json.problem_id;
        assert(this.problem_id!=undefined&&this.problem_id!=null);
        this.external_id = json.external_id;
        assert(this.external_id!=undefined&&this.external_id!=null);
        this.entry_point = json.entry_point;
        assert(this.entry_point!=undefined&&this.entry_point!=null);

    }

    
}

export {SubmissionEvent};