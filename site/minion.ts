import {RandomUtils} from './random-utils';
import {BoundariesUtils} from "./boundaries-utils";

export class Minion{
    private minionSize:number = BoundariesUtils.getMinionSize();

    private stats = {
        health: 100,
        energy: 100
    };

    private userCode = "";

    constructor(private id:number, private posX:number, private posY:number, private terrain){

    }
    //Getters
    getX(): number{
        return this.posX*this.minionSize;
    }
    getY(): number{
        return this.posY*this.minionSize;
    }
    getId():number{
        return this.id;
    }
    getHealth(): number{
        return this.stats.health>0?this.stats.health:0;
    }
    getEnergy():number{
        return this.stats.energy>0?this.stats.energy:0;
    }

    getUserCode():string{
        return this.userCode;
    }
    setUserCode(code:string){
        this.userCode = code;
    }
}