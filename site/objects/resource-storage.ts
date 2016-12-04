import {BoundariesUtils} from "./boundaries-utils";

export class ResourcesStorage{
    private minionSize:number = BoundariesUtils.getMinionSize();

    private stats = {
        stored: 0
    };

    constructor(private posX:number, private posY:number){

    }
    //Getters
    getX(): number{
        return this.posX*this.minionSize;
    }
    getY(): number{
        return this.posY*this.minionSize;
    }

    getStored(): number{
        return this.stats.stored>0?this.stats.stored:0;
    }
    store(value:number){
        this.stats.stored += value;
    }



    restoreStateData(data){

    }
}