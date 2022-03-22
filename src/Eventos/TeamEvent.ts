/*
"organization_id": "string",
"group_ids": [
    "string"
],
"affiliation": "string",
"nationality": "string",
"id": "string",
"icpc_id": "string",
"name": "string",
"display_name": "string",
"members": "string",
"photo": [
{
    "href": "string",
    "mime": "string",
    "width": 0,
    "height": 0
}
]
*/

import { Evento } from "./Evento";

class TeamEvent extends Evento {

    id!: string;
    organization_id!: string;
    group_ids!: [string];
    affiliation!: string;
    nationality!: string;
    icpc_id!: string;
    name!: string;
    display_name!: string;
    members!: string;
    /*
    photo: [ {
        href: string,
        mime: string,
        width: number,
        height: number
    } ];
    */

    constructor(json : any, op: string) {
        super(op, "team", json, ["id","organization_id","group_ids","affiliation","nationality","icpc_id","name","display_name","members"/*,"photo"*/]);
    }

}

export {TeamEvent}