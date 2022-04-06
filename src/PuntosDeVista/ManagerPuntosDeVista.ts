import { Observable, Subject } from "rxjs"
import { Evento } from "../Eventos/Evento";
import { PuntoDeVistaProblema } from "./PuntoDeVistaProblema";
import { PuntoDeVista } from "./PuntoDeVista";
import { PuntoDeVistaTiempo } from "./PuntoDeVistaTiempo";
import { IncomingMessage } from "http";
import { EventFactory } from "../Eventos/EventFactory";
import { ConfigurationLoader } from "../config";
import { PuntoDeVistaScoreboard } from "./PuntoDeVistaScoreboard";
import { PuntoDeVistaEquipo } from "./PuntoDeVistaEquipo";
import { PuntoDeVistaGrupo } from "./PuntoDeVistaGrupo";
import { EventoConfiguracion } from "../Eventos/Custom/EventoConfiguracion";
import moment from "moment";
import { PuntoDeVistaOrganizacion } from "./PuntoDeVistaOrganizacion";
const http = require('http');


//Antes de llamar a getInstance es necesario llamar a setObservable una única vez
class ManagerPuntosDeVista {

    //Instancia única
    private static instance : ManagerPuntosDeVista;
    
    public static getInstance() : ManagerPuntosDeVista {
        if(!ManagerPuntosDeVista.obs)
            throw "Antes de operar con el manager de puntos de vista, es necesario asignar un objeto observable mediante el método 'setObservable'";
        return ManagerPuntosDeVista.instance;
    }
    
    private static obs : Observable<Evento>;
    public static setObservable(observable : Observable<Evento>) {
        if(ManagerPuntosDeVista.obs) throw "No puede sobreescribirse el objeto observable actual";
        ManagerPuntosDeVista.obs = observable;
        this.instance = new ManagerPuntosDeVista();
    }

    private viewpoint_data : Array<PuntoDeVista>;


    private constructor() {
        this.viewpoint_data = new Array<PuntoDeVista>();

        

        //Aqui se añaden manualmente todos los puntos de vista
        //Estos ptos. de vista siempre existirán, independientemente del concurso

        //AL MENOS TIENE QUE EXISTIR UN PUNTO DE VISTA QUE UTILICE OBS, SI NO EL PROGRAMA TERMINA INMEDIATAMENTE
        //Comentar/descomentar esta linea dependiendo de si hay más puntos de vista asignados debajo
        this.viewpoint_data.push( new PuntoDeVistaDummy(ManagerPuntosDeVista.obs) );

        this.viewpoint_data.push( new PuntoDeVistaScoreboard(ManagerPuntosDeVista.obs) );
        this.viewpoint_data.push( new PuntoDeVistaTiempo(ManagerPuntosDeVista.obs) );
    }

    public static emitCreationEvents( eventEmiter : Subject<Evento>, callback: ()=>void) {

        let conf = ConfigurationLoader.load();
        let emitChunch = (chunk : any, type: String) => {
            let event = {
                "id": -1,
                "op": "manual_create",
                "type": type,
                "data": chunk
            }
            var ev = EventFactory.obtenerEventoDesdeJSON(event);
            if(ev!=null) {
                eventEmiter.next(ev);
                var evs = EventFactory.ProcesarYEnriquecerEvento(ev);
                for(var _ev of evs) eventEmiter.next(_ev);
            }
        }

        const tipos_entidad = ["problems","teams","groups","organizations"];

        let cuentaCallbacks = 0;
        let evConf = new EventoConfiguracion("");
        let convergenciaCallBacks = (tipo: string, tam: number) => {
            ++cuentaCallbacks;
            switch(tipo) {
                case "problems": evConf.nProblemas = tam; break;
                case "teams": evConf.nEquipos = tam; break;
                case "groups": evConf.nGrupos = tam; break;
                case "organizations": evConf.nOrganizaciones = tam; break;
                default: throw "Error interno, no se reconoce el tipo '"+tipo+"'"
            }
            //Se han recibido todos los callbacks que se esperaban (1 por entidad);
            if(cuentaCallbacks==tipos_entidad.length) {
                eventEmiter.next(evConf);
                var evs = EventFactory.ProcesarYEnriquecerEvento(evConf);
                for(var _ev of evs) eventEmiter.next(_ev);
                callback();
            }
        }

        let options = {
            hostname: conf.url,
            port: conf.port,
            path: '',
            method: 'GET'
        }

        for(let tipo_entidad of tipos_entidad) {
            options.path = '/api/contests/'+conf.contest_id+'/'+tipo_entidad;
            let req = http.request(options, (resp: IncomingMessage) => {
                resp.on("data", (chunk) => {
                    let ents = JSON.parse(chunk);
                    for(let ent of ents) emitChunch(ent, tipo_entidad);
                    convergenciaCallBacks(tipo_entidad, ents.length);
                });

                resp.on("error", (err) => {
                    console.log(err);
                });
                
            });

            req.end();
        }
    }

    public static getviewpoint_data() : Array<PuntoDeVista> {
        return this.instance.viewpoint_data;
    }
    
    public static registrarPuntoDeVistaProblema(id_problema: string, nombre_problema: string) {
        ManagerPuntosDeVista.getInstance().viewpoint_data.push(
            new PuntoDeVistaProblema(ManagerPuntosDeVista.obs, id_problema, nombre_problema)
        );
        //console.log("Registrado punto de vista de problema con id "+id_problema);
    }

    public static registrarPuntoDeVistaEquipo(id_equipo: string, nombre_equipo: string) {
        ManagerPuntosDeVista.getInstance().viewpoint_data.push(
            new PuntoDeVistaEquipo(ManagerPuntosDeVista.obs, id_equipo, nombre_equipo)
        );
        //console.log("Registrado punto de vista de equipo con id "+id_equipo);
    }

    static registrarPuntoDeVistaGrupo(id_grupo: string, nombre_grupo: string) {
        ManagerPuntosDeVista.getInstance().viewpoint_data.push(
            new PuntoDeVistaGrupo(ManagerPuntosDeVista.obs, id_grupo, nombre_grupo)
        );
    }

    static registrarPuntoDeVistaOrganizacion(id_organizacion: string, nombre_organizacion: string) {
        ManagerPuntosDeVista.getInstance().viewpoint_data.push(
            new PuntoDeVistaOrganizacion(ManagerPuntosDeVista.obs, id_organizacion, nombre_organizacion)
        );
    }



};

class PuntoDeVistaDummy extends PuntoDeVista{
    constructor( eventFeed : Observable<any> ) { super( eventFeed ); }
    filtrar(evento: Evento): boolean { return false; }
    actualizar(evento: Evento): void { }
};

export{ManagerPuntosDeVista}