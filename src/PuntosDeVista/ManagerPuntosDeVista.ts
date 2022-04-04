import { Observable } from "rxjs"
import { Evento } from "../Eventos/Evento";
import { PuntoDeVistaProblema } from "./PuntoDeVistaProblema";
import { PuntoDeVista } from "./PuntoDeVista";
import { PuntoDeVistaTiempo } from "./PuntoDeVistaTiempo";

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
        //this.viewpoint_data.push( new PuntoDeVistaProblema(ManagerPuntosDeVista.obs, "script_hello_judge") );

        //TODO: quitar los puntos hardcodeados de quí descomentar la creacción en la factoría eventos
        //Puntos de vista hardcodeados con el propósito de testear, hasta que se arregle lo de la información que sale del feed
        this.viewpoint_data.push( new PuntoDeVistaProblema(ManagerPuntosDeVista.obs, "script_hello_judge") );
        this.viewpoint_data.push( new PuntoDeVistaProblema(ManagerPuntosDeVista.obs, "ext-p-1") );
        this.viewpoint_data.push( new PuntoDeVistaProblema(ManagerPuntosDeVista.obs, "ext-prob-2") );
        
        this.viewpoint_data.push( new PuntoDeVistaTiempo(ManagerPuntosDeVista.obs) );
    }

    public static getviewpoint_data() : Array<PuntoDeVista> {
        return this.instance.viewpoint_data;
    }
    
    public static registrarPuntoDeVistaProblema(id_problema: string) {
        ManagerPuntosDeVista.getInstance().viewpoint_data.push(
            new PuntoDeVistaProblema(ManagerPuntosDeVista.obs, id_problema)
        );
        console.log("Registrado punto de vista de problema con id "+id_problema);
    }

    public static registrarPuntoDeVistaEquipo(id_equipo: string) {
        ManagerPuntosDeVista.getInstance().viewpoint_data.push(
            new PuntoDeVistaProblema(ManagerPuntosDeVista.obs, id_equipo)
        );
        console.log("Registrado punto de vista de equipo con id "+id_equipo);
    }



};

class PuntoDeVistaDummy extends PuntoDeVista{
    constructor( eventFeed : Observable<any> ) { super( eventFeed ); }
    filtrar(evento: Evento): boolean { return false; }
    actualizar(evento: Evento): void { }
};

export{ManagerPuntosDeVista}