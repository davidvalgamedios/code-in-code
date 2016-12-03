import {BoundariesUtils} from "./boundaries-utils";

export class Minion{
    private minionSize:number = BoundariesUtils.getMinionSize();
    private terrainHeight:number = BoundariesUtils.getTerrainHeight();
    private terrainWidth:number = BoundariesUtils.getTerrainWidth();
    private lookAt:string = '';

    private stats;
    private customData;
    private inPause:boolean = false;

    private userCode = "";

    constructor(private id:string, private posX:number, private posY:number, private terrain){
        this.stats = {
            health: 100,
            energy: 100
        };
        this.customData = {};
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
    setPause(doPause:boolean){
        this.inPause = doPause;
    }

    executeCode(){
        if(!this.inPause){
            try {
                eval(this.userCode);
            }
            catch(err){
                console.info("Errorcito");
                console.log(err.message);
            }
        }
    }




    private go(dir:string):void{
        if(this.getEnergy() == 0 || !this.canIGo(dir)){
            this.lookAt = '';
            return;
        }
        this.lookAt = dir;
        this.stats.energy--;
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
        this.posX = preData.posX || 0;
        this.posY = preData.posY || 0;
        this.stats = preData.stats || {
                health: 100,
                energy: 100
            };
        this.userCode = preData.userCode || "";
        this.customData = preData.customData || {};
    }

    getStateData(){
        return {
            id: this.id,
            posX: this.posX,
            posY: this.posY,
            stats: this.stats,
            userCode: this.userCode,
            customData: this.customData
        }
    }
}