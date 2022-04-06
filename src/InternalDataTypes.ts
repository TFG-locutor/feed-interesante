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
};

type TGrupoData = {
    id: string;
    nombre: string;
    oculto: boolean;
};

export{
    TSubData,
    TJudTypeData,
    TProblemData,
    TEquipoData,
    TGrupoData
}