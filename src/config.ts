import { booleanItem, Confinode, ConfinodeResult, literal, numberItem, stringItem } from "confinode"
import path from "path"

//Manuales para cambiar la configuración:
//  https://www.npmjs.com/package/confinode
//  https://github.com/slune-org/confinode/blob/HEAD/doc/en/devmanual.md

interface Configuration {
    readonly cds: {
        readonly url: string;
        readonly port: number;
        readonly https: boolean;
        readonly allow_expired_tls: boolean;
        readonly contest_id: string;
        readonly api_user: string;
        readonly api_password: string;
    };
    readonly server_port: number;
}


abstract class ConfigurationLoader {

    public static load() : Configuration {
        const description = literal<Configuration>({
            cds: literal({
                url: stringItem(),
                port: numberItem(),
                https: booleanItem(),
                allow_expired_tls: booleanItem(),
                contest_id: stringItem(),
                api_user: stringItem(),
                api_password: stringItem()
            }),
            server_port: numberItem()
        });
        const confinod = new Confinode("FeedInteresante", description , {
            cache: false,
            //logger: msg => console.log(msg)
        } );

        var dir = path.join( path.dirname(__dirname) , "FeedInteresante.config.json" );


        var datos : ConfinodeResult<Configuration> | undefined = confinod.load.sync(dir);

        if(datos==undefined) throw "Imposible cargar la configuración";

        return {
            cds: {
                url: datos.configuration.cds.url,
                port: datos.configuration.cds.port,
                https: datos.configuration.cds.https,
                allow_expired_tls: datos.configuration.cds.allow_expired_tls,
                contest_id: datos.configuration.cds.contest_id,
                api_user: datos.configuration.cds.api_user,
                api_password: datos.configuration.cds.api_password
            },
            server_port: datos.configuration.server_port
        };
    }

}

export{ConfigurationLoader, Configuration}