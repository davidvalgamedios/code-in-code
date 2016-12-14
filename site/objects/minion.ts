import {BoundariesUtils} from "./boundaries-utils";
import {ResourcesSource} from "./resource-source";
import {ResourcesStorage} from "./resource-storage";
import {CommonVariablesService} from "../services/common-variables.service";

export class Minion{
    private minionSize:number = BoundariesUtils.getMinionSize();
    private terrainHeight:number = BoundariesUtils.getTerrainHeight();
    private terrainWidth:number = BoundariesUtils.getTerrainWidth();

    stats;
    expPoints;
    private inPause:boolean = false;

    private userCode = "";
    private customData = {};
    private userFunctions;

    lookAt:string = '';
    digDir: string = "";
    resting:boolean = false;

    lastErrors:Array<string> = [];

    constructor(private id:string, private posX:number, private posY:number, private terrainDist, private commonVarsService){
        this.stats = {
            health: 100,
            maxHealth: 100,
            energy: 100,
            maxEnergy: 100,
            load: 0,
            maxLoad: 10,
            strength: 0
        };

        this.expPoints = {
            battle: 0,
            harvest: 0
        }
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
    getCustomData(){
        return this.customData;
    }

    //Setters
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
                let usrFun = new Function('fn', 'data', 'common', this.userCode);
                let res =  usrFun(this.userFunctions, this.customData, this.commonVarsService.getVariables());

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
            else if(res.action == 'run'){
                this.run(res.arg);
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
        if(this.getEnergy() == 0){
            this.addError('No energy');
            this.lookAt = '';
            return;
        }
        if(!this.canIGo(dir)){
            this.addError('Invalid position');
            this.lookAt = '';
            return;
        }
        let old = {
            x:this.posX,
            y:this.posY,
        };
        this.lookAt = dir.length == 2?dir[0]+' '+dir[1]:dir;
        this.stats.energy-= 1;
        if(dir.indexOf('U')!=-1) this.posY -= 1;
        if(dir.indexOf('D')!=-1) this.posY += 1;
        if(dir.indexOf('R')!=-1) this.posX += 1;
        if(dir.indexOf('L')!=-1) this.posX -= 1;

        this.terrainDist[old.x][old.y] = null;
        this.terrainDist[this.posX][this.posY] = this;
    }
    private run(dir:string):void{
        if(this.getEnergy() < 3 || !this.canIGo(dir)){
            this.lookAt = '';
            return;
        }
        let old = {
            x:this.posX,
            y:this.posY,
        };
        this.lookAt = dir.length == 2?dir[0]+' '+dir[1]:dir;
        this.stats.energy -= 5;
        if(dir.indexOf('U')!=-1) this.posY -= 1;
        if(dir.indexOf('D')!=-1) this.posY += 1;
        if(dir.indexOf('R')!=-1) this.posX += 1;
        if(dir.indexOf('L')!=-1) this.posX -= 1;

        if(this.canIGo(dir)){
            if(dir.indexOf('U')!=-1) this.posY -= 1;
            if(dir.indexOf('D')!=-1) this.posY += 1;
            if(dir.indexOf('R')!=-1) this.posX += 1;
            if(dir.indexOf('L')!=-1) this.posX -= 1;
        }

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
                if(this.stats.load < this.stats.maxLoad){
                    let digged = oResource.dig(this.stats.strength);
                    if(digged > 0){
                        this.expPoints.harvest++;
                        this.lookAt = dir;
                        this.digDir = 'dig'+dir;
                        this.stats.load += digged;

                        if(this.stats.load > this.stats.maxLoad){//For removing max stats
                            this.stats.load = JSON.parse(JSON.stringify(this.stats.maxLoad));
                        }
                    }
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
                this.expPoints.harvest+=5;
                oStorage.store(this.stats.load);
                this.digDir = 'dig'+dir;
                this.stats.load = 0;
            }
        }
    }


    //HELPERS
    private canIGo(dir):boolean{
        if(!this.isValidDirection(dir)){
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
        if(dir.length != 1){
            return false;
        }
        if(dir == 'U' && this.posY == 0) return false;
        if(dir == 'D' && this.posY == this.terrainHeight-1) return false;
        if(dir == 'L' && this.posX == 0) return false;
        if(dir == 'R' && this.posX == this.terrainWidth-1) return false;

        return true;
    }
    private isValidDirection(dir):boolean{
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
    private addError(msg):void{
        let oNow = new Date();
        if(this.lastErrors.length >2){
            this.lastErrors.shift();
        }
        this.lastErrors.push(oNow.getHours()+':'+oNow.getMinutes()+':'+oNow.getSeconds()+' - '+msg);
    }


    //SAVING UTILITIES
    getStateData(){
        return {
            id: this.id,
            posX: this.posX,
            posY: this.posY,
            userCode: this.userCode,
            customData: this.customData,

            stats: this.stats,
            expPoints: this.expPoints
        }
    }
    restoreStateData(preData) {
        this.posX = preData.posX==undefined?0:preData.posX;
        this.posY = preData.posY==undefined?0:preData.posY;
        this.userCode = preData.userCode==undefined?'':preData.userCode;
        this.customData = preData.customData==undefined?{}:preData.customData;

        if(this.stats){
            this.stats.health = preData.stats.health==undefined?100:preData.stats.health;
            this.stats.maxHealth = preData.stats.maxHealth==undefined?100:preData.stats.maxHealth;
            this.stats.energy = preData.stats.energy==undefined?100:preData.stats.energy;
            this.stats.maxEnergy = preData.stats.maxEnergy==undefined?100:preData.stats.maxEnergy;
            this.stats.load = preData.stats.load==undefined?0:preData.stats.load;
            this.stats.maxLoad = preData.stats.maxLoad==undefined?10:preData.stats.maxLoad;
            this.stats.strength = preData.stats.strength==undefined?1:preData.stats.strength;
        }

        if(preData.expPoints){
            this.expPoints.battle = preData.expPoints.battle==undefined?0:preData.expPoints.battle;
            this.expPoints.harvest = preData.expPoints.harvest==undefined?0:preData.expPoints.harvest;
        }
    }
}