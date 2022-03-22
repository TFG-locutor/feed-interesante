/*
"shortname": "string",
"id": "string",
"icpc_id": "string",
"name": "string",
"formal_name": "string",
"country": "string",
"logo": [
{
    "href": "string",
    "mime": "string",
    "width": 0,
    "height": 0
}
]
*/

import { Evento } from "./Evento";

class OrganizationEvent extends Evento {

    
    id!: string;
    shortname!: string;
    icpc_id!: string;
    name!: string;
    formal_name!: string;
    country!: string;
    /*
    logo: [{
        href: string,
        mime: string,
        width: number,
        height: number
    }];
    */

    constructor(json : any, op: string) {
        super(op, "organization", json, ["id","shortname","icpc_id","name","formal_name","country","logo"]);
    }

}

export {OrganizationEvent}