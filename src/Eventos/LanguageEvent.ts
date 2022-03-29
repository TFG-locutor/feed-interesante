/*
id	string
name*	string
extensions*	[string]
filter_compiler_files	boolean
allow_judge	boolean
time_factor*	number($double)
entry_point_required	boolean
entry_point_name	string
*/

import { Evento } from "./Evento";

class LanguageEvent extends Evento {

    id!:string;
    name!:string;
    extensions!:[string];
    filter_compiler_files!:boolean;
    allow_judge!:boolean;
    time_factor!:number; //double
    entry_point_required!:boolean;
    entry_point_name!:string;

    constructor(json : any, op: string, _moment: string) {
        super(op, "language", _moment, json, ["id","name","extensions","filter_compiler_files","allow_judge","time_factor","entry_point_required","entry_point_name"]);
    }

}

export{LanguageEvent}