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
        return this.posX;
    }
    getY(): number{
        return this.posY;
    }
    getXpx(): number{
        return this.posX*this.minionSize;
    }
    getYpx(): number{
        return this.posY*this.minionSize;
    }

    getStored(): number{
        return this.stats.stored>0?this.stats.stored:0;
    }
    store(value:number){
        this.stats.stored += value;
    }

    getStateData(){
        return {
            posX: this.posX,
            posY: this.posY,
            stats: this.stats
        }
    }
    restoreStateData(preData){
        this.posX = preData.posX || 0;
        this.posY = preData.posY || 0;
        this.stats = preData.stats || {
                stored: 0
            };
    }
}