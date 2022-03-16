import { assert } from "console";
import { Evento } from "./Evento";
import { ClarificationEvent } from "./ClarificationEvent";
import { GroupEvent } from "./GroupEvent";
import { JudgementEvent } from "./JudgementEvent";
import { JudgementTypeEvent } from "./JudgementTypeEvent";
import { OrganizationEvent } from "./OrganizationEvent";
import { ProblemEvent } from "./ProblemEvent";
import { TeamEvent } from "./TeamEvent";
import { SubmissionEvent } from "./SubmissionEvent";

abstract class EventFactory {

    static obtenerEventoDesdeJSON(json: any): Evento {

        assert(json!=undefined&&json!=null);
        assert(json.type!=undefined&&json.type!=null);
        assert(json.op!=undefined&&json.op!=null);
        assert(json.data!=undefined&&json.data!=null);

        switch(json.type) {
            case "clarifications": return new ClarificationEvent(json.data, json.op);
            case "groups": return new GroupEvent(json.data, json.op);
            case "judgements": return new JudgementEvent(json.data, json.op);
            case "judgement-types": return new JudgementTypeEvent(json.data, json.op);
            case "organizations": return new OrganizationEvent(json.data, json.op);
            case "problems": return new ProblemEvent(json.data, json.op);
            case "submissions": return new SubmissionEvent(json.data, json.op);
            case "teams": return new TeamEvent(json.data, json.op);
        }


        throw "Evento no reconocido: "+json.type;

    }

}

export{EventFactory}