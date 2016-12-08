import {BoundariesUtils} from "./boundaries-utils";
import {ResourcesSource} from "./resource-source";
import {ResourcesStorage} from "./resource-storage";

export class Minion{
    private minionSize:number = BoundariesUtils.getMinionSize();
    private terrainHeight:number = BoundariesUtils.getTerrainHeight();
    private terrainWidth:number = BoundariesUtils.getTerrainWidth();

    stats;
    private maximumLoad = 10;
    private inPause:boolean = false;

    private userCode = "";
    private customData = {};
    private userFunctions;

    lookAt:string = '';
    digDir: string = "";
    resting:boolean = false;

    constructor(private id:string, private posX:number, private posY:number, private terrainDist){
        this.stats = {
            health: 100,
            energy: 100,
            load: 0,
            strength: 0
        };
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
    getId():string{
        return this.id;
    }
    getHealth(): number{
        return this.stats.health>0?this.stats.health:0;
    }
    getEnergy():number{
        return this.stats.energy>0?this.stats.energy:0;
    }
    getLoad():number{
        return this.stats.load;
    }
    getTerrain(x,y):any{
        let object = this.terrainDist[x][y];
        if(object){
            let name = object.constructor.name;
            switch (name){
                case 'ResourcesStorage':
                    return 'storage';
                case 'ResourcesSource':
                    return 'source';
                case 'Minion':
                    return 'minion';
                default:
                    return null;
            }
        }
        return null;
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


    //CODE EXECUTION
    executeCode(){
        this.userFunctions = {
            myX: this.getX(),
            myY: this.getY(),
            getEnergy: this.getEnergy(),
            getHealth: this.getHealth(),
            getLoad: this.getLoad(),
            getTerrain: this.getTerrain,
            dig: this.dig,
            store: this.store
        };
        this.resting = false;
        this.digDir = '';
        if(!this.inPause){
            this.lookAt = '';
            try {
                let usrFun = new Function('fn', 'data', this.userCode);
                let res =  usrFun(this.userFunctions, this.customData);
                this.parseResponse(res);
            }
            catch(err){
                console.info("Errorcito");
                console.info(err.message);
            }
        }
    }
    private parseResponse(res){
        if(res && res.hasOwnProperty('action')){
            if(res.action == 'go'){
                this.go(res.arg);
            }
            else if(res.action == 'rest'){
                this.rest();
            }
            else if(res.action == 'dig'){
                this.dig(res.arg);
            }
            else if(res.action == 'store'){
                this.store(res.arg);
            }
        }
    }



    //POSSIBLE EVENTS
    private rest(){
        if(this.stats.energy < 100){
            this.resting = true;
            this.stats.energy += 5;
            if(this.stats.energy > 100){
                this.stats.energy = 100;
            }
        }
    }
    private go(dir:string):void{
        if(this.getEnergy() == 0 || !this.canIGo(dir)){
            this.lookAt = '';
            return;
        }
        let old = {
            x:this.posX,
            y:this.posY,
        };
        this.lookAt = dir;
        this.stats.energy-= 1;
        if(dir.indexOf('U')!=-1) this.posY -= 1;
        if(dir.indexOf('D')!=-1) this.posY += 1;
        if(dir.indexOf('R')!=-1) this.posX += 1;
        if(dir.indexOf('L')!=-1) this.posX -= 1;

        this.terrainDist[old.x][old.y] = null;
        this.terrainDist[this.posX][this.posY] = this;
    }
    private dig(dir:string):void{
        if(this.isValidPosition(dir)){
            let oResource:ResourcesSource = this.terrainDist
                [
            this.posX+(dir=='R'?1:(dir=='L'?-1:0))
                ][
            this.posY+(dir=='D'?1:(dir=='U'?-1:0))
                ];
            if(oResource && oResource.constructor.name == 'ResourcesSource'){
                if(this.stats.load < this.maximumLoad && oResource.getRemaining() > 0){
                    this.lookAt = dir;
                    this.digDir = 'dig'+dir;
                    oResource.dig(this.stats.strength);
                    this.stats.load += this.stats.strength;
                }
            }
        }
    }
    private store(dir:string):void{
        if(this.isValidPosition(dir)){
            let oStorage:ResourcesStorage = this.terrainDist
                [
            this.posX+(dir=='R'?1:(dir=='L'?-1:0))
                ][
            this.posY+(dir=='D'?1:(dir=='U'?-1:0))
                ];
            if(oStorage && oStorage.constructor.name == 'ResourcesStorage'){
                oStorage.store(this.stats.load);
                this.digDir = 'dig'+dir;
                this.stats.load = 0;
            }
        }
    }


    //HELPERS
    private canIGo(dir):boolean{
        if(!this.isValidPosition(dir)){
            return false;
        }
        let oCell = this.terrainDist
            [
        this.posX+(dir.indexOf('R')!=-1?1:(dir.indexOf('L')!=-1?-1:0))
            ][
        this.posY+(dir.indexOf('D')!=-1?1:(dir.indexOf('U')!=-1?-1:0))
            ];
        return !oCell;
    }
    private isValidPosition(dir):boolean{
        if((dir.length != 1 && dir.length != 2) ||
            dir.indexOf('U') != -1 && dir.indexOf('D') != -1 ||
            dir.indexOf('L') != -1 && dir.indexOf('R') != -1){
            return false;
        }
        if(dir.indexOf('U') != -1 && this.posY == 0) return false;
        if(dir.indexOf('D') != -1 && this.posY == this.terrainHeight-1) return false;
        if(dir.indexOf('L') != -1 && this.posX == 0) return false;
        if(dir.indexOf('R') != -1 && this.posX == this.terrainWidth-1) return false;

        return true;
    }


    //SAVING UTILITIES
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
    restoreStateData(preData) {
        this.posX = preData.posX==undefined?0:preData.posX;
        this.posY = preData.posY==undefined?0:preData.posY;
        this.stats.health = preData.stats.health==undefined?100:preData.stats.health;
        this.stats.energy = preData.stats.energy==undefined?100:preData.stats.energy;
        this.stats.load = preData.stats.load==undefined?0:preData.stats.load;
        this.stats.strength = preData.stats.strength==undefined?1:preData.stats.strength;
        this.userCode = preData.userCode==undefined?'':preData.userCode;
        this.customData = preData.customData==undefined?{}:preData.customData;
    }
}