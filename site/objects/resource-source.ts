import {BoundariesUtils} from "./boundaries-utils";

export class ResourcesSource{
    private minionSize:number = BoundariesUtils.getMinionSize();

    private stats = {
        remaining: 10000
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

    getRemaining(): number{
        return this.stats.remaining>0?this.stats.remaining:0;
    }
    dig(value:number){
        this.stats.remaining -= value;
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