import {BoundariesUtils} from "./boundaries-utils";
import {ResourcesSource} from "./resource-source";
import {ResourcesStorage} from "./resource-storage";

export class Minion{
    private minionSize:number = BoundariesUtils.getMinionSize();
    private terrainHeight:number = BoundariesUtils.getTerrainHeight();
    private terrainWidth:number = BoundariesUtils.getTerrainWidth();

    private stats;
    private maximumLoad = 10;
    private customData;
    private inPause:boolean = false;

    private userCode = "";
    private userFunctions;

    lookAt:string = '';
    digDir: string= "";

    constructor(private id:string, private posX:number, private posY:number, private terrainDist){
        this.stats = {
            health: 100,
            energy: 100,
            load: 0,
            strength: 0
        };
        this.customData = {};
        this.userFunctions = {
            getEnergy: this.getEnergy,
            getHealth: this.getHealth,
            getLoad: this.getLoad,
            getTerrain: this.getTerrain,
            dig: this.dig,
            store: this.store
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
        this.digDir = '';
        if(!this.inPause){
            this.lookAt = '';
            try {
                let usrFun = new Function('fn', 'data',  this.userCode);
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
        }
    }



    //POSSIBLE EVENTS
    private rest(){
        if(this.stats.energy <100){
            this.stats.energy++;
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
    private dig(dir:string):void{
        if(this.isValidPosition(dir)){
            let oResource:ResourcesSource = this.terrainDist
                [
            this.posX+(dir=='R'?1:(dir=='L'?-1:0))
                ][
            this.posY+(dir=='D'?1:(dir=='U'?-1:0))
                ];
            if(oResource && oResource.constructor.name == 'ResourcesSource'){
                console.log('FOUND');
                if(this.stats.load < this.maximumLoad && oResource.getRemaining() > 0){
                    this.lookAt = dir;
                    this.digDir = 'dig'+dir;
                    oResource.dig(this.stats.strength);
                    this.stats.load += this.stats.strength;
                }
            }
        }
        else{
            console.log('Invalid position: '+dir);
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
                console.log();
            }
        }
        else{
            console.log('Invalid position: '+dir);
        }
    }


    //HELPERS
    private canIGo(dir):boolean{
        if(!this.isValidPosition(dir)){
            return false;
        }
        let oCell = this.terrainDist
            [
        this.posX+(dir=='R'?1:(dir=='L'?-1:0))
            ][
        this.posY+(dir=='D'?1:(dir=='U'?-1:0))
            ];
        return !oCell;
    }
    private isValidPosition(dir):boolean{
        switch (dir){
            case 'U':
                return this.posY != 0;
            case 'D':
                return this.posY != this.terrainHeight-1;
            case 'L':
                return this.posX != 0;
            case 'R':
                return this.posX != this.terrainWidth-1;
            default:
                return false;
        }
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
        this.posX = preData.posX || 0;
        this.posY = preData.posY || 0;
        this.stats.health = preData.stats.load || 100;
        this.stats.energy = preData.stats.energy || 100;
        this.stats.load = preData.stats.load || 0;
        this.stats.strength = preData.stats.strength || 1;
        this.userCode = preData.userCode || "";
        this.customData = preData.customData || {};
    }
}