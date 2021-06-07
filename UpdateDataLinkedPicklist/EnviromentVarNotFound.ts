export class EnviromentVarNotFound extends Error {
    constructor(message){
        super(message);
        this.name = "EnviromentVarNotFound";
    }
}