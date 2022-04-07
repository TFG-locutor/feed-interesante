type TSubData = {
    equipo:string;
    problema:string;
};

type TJudTypeData = {
    nombre: string;
    penaliza: boolean;
    resuelto: boolean;
};

type TProblemData = {
    nombre: string;
};

type TEquipoData = {
    nombre: string;
    grupos: [string];
    organizacion: string;
};

type TGrupoData = {
    id: string;
    nombre: string;
    oculto: boolean;
};

type TOrganizacionData = {
    id: string;
    nombre: string;
};

export{
    TSubData,
    TJudTypeData,
    TProblemData,
    TEquipoData,
    TGrupoData,
    TOrganizacionData
}