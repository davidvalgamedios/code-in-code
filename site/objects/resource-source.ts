import {BoundariesUtils} from "./boundaries-utils";
import {Subject} from "rxjs/Subject";


export class ResourcesSource{
    //@Output() notify: EventEmitter<string> = new EventEmitter<string>();
    private minionSize:number = BoundariesUtils.getMinionSize();

    private stats = {
        remaining: 2500
    };

    constructor(private posX:number, private posY:number, private serviceEvent:Subject<any>){
    }
    //Getters
    getType():string{
        return 'Source';
    }
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
        if(this.stats.remaining >= value){
            this.stats.remaining -= value;
            return value;
        }
        else{
            let remaining = this.stats.remaining;
            this.stats.remaining = 0;
            this.serviceEvent.next(this);
            return remaining;
        }
    }

    getStateData(){
        return {
            posX: this.posX,
            posY: this.posY,
            stats: this.stats
        }
    }
    restoreStateData(preData){
        this.posX = preData.posX==undefined?0:preData.posX;
        this.posY = preData.posY==undefined?0:preData.posY;

        if(preData.stats){
            this.stats.remaining = preData.stats.remaining==undefined?2500:preData.stats.remaining;
        }
    }
}