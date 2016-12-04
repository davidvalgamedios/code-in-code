import {BoundariesUtils} from "./boundaries-utils";

export class Resource{
    private minionSize:number = BoundariesUtils.getMinionSize();

    private stats = {
        remaining: 10000
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
    getRemaining(): number{
        return this.stats.remaining>0?this.stats.remaining:0;
    }
    take(){
        if(this.stats.remaining > 0){
            this.stats.remaining--;
        }
    }
}