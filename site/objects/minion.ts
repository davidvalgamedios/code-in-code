import {BoundariesUtils} from "./boundaries-utils";

export class Minion{
    private minionSize:number = BoundariesUtils.getMinionSize();
    private terrainHeight:number = BoundariesUtils.getTerrainHeight();
    private terrainWidth:number = BoundariesUtils.getTerrainWidth();
    private lookAt:string = '';

    private stats = {
        health: 100,
        energy: 100
    };

    private userCode = "";

    constructor(private id:string, private posX:number, private posY:number, private terrain){

    }
    //Getters
    getX(): number{
        return this.posX*this.minionSize;
    }
    getY(): number{
        return this.posY*this.minionSize;
    }
    getId():string{
        return this.id;
    }
    getHealth(): number{
        return this.stats.health>0?this.stats.health:0;
    }
    getEnergy():number{
        return this.stats.energy>0?this.stats.energy:0;
    }
    getLookAt(){
        return this.lookAt;
    }

    getUserCode():string{
        return this.userCode;
    }
    setUserCode(code:string){
        this.userCode = code;
    }

    executeCode(){
        eval(this.userCode);
    }




    private go(dir:string):void{
        //this.lastDir = dir;
        if(!this.canIGo(dir)){
            this.lookAt = '';
            return;
        }
        this.lookAt = dir;
        switch(dir){
            case 'U':
                this.posY -= 1;
                return;
            case 'D':
                this.posY += 1;
                return;
            case 'R':
                this.posX += 1;
                return;
            case 'L':
                this.posX -= 1;
                return;
            default:
                return;
        }
    }

    private canIGo(dir):boolean{
        //let mn;
        switch(dir){
            case 'U':
                if(this.posY == 0){
                    return false;
                }
                return true;
                //mn = this.terrain[this.posX][this.posY-1];
                //return mn == null || (mn.constructor.name == 'Minion' && mn.isDead());

            case 'D':
                if(this.posY == this.terrainHeight-1){
                    return false;
                }
                return true;
                //mn = this.terrain[this.posX][this.posY+1];
                //return mn == null || (mn.constructor.name == 'Minion' && mn.isDead());
            case 'L':
                if(this.posX == 0){
                    return false;
                }
                return true;
                //mn = this.terrain[this.posX-1][this.posY];
                //return mn == null || (mn.constructor.name == 'Minion' && mn.isDead());
            case 'R':
                if(this.posX == this.terrainWidth-1){
                    return false;
                }
                return true;
                //mn = this.terrain[this.posX+1][this.posY];
                //return mn == null || (mn.constructor.name == 'Minion' && mn.isDead());
            case 'I':
                return true;
            default:
                return false;
        }
    }


    restoreStateData(preData){
        console.log(preData);
        this.posX = preData.posX;
        this.posY = preData.posY;
        //this.stats = preData.stats;
        this.userCode = preData.userCode;
    }

    getStateData(){
        return {
            id: this.id,
            posX: this.posX,
            posY: this.posY,
            stats: this.stats,
            userCode: this.userCode
        }
    }
}