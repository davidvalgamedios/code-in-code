import {BoundariesUtils} from "./boundaries-utils";
import {ResourcesSource} from "./resource-source";
import {ResourcesStorage} from "./resource-storage";

export class Minion{
    private minionSize:number = BoundariesUtils.getMinionSize();
    private terrainHeight:number = BoundariesUtils.getTerrainHeight();
    private terrainWidth:number = BoundariesUtils.getTerrainWidth();

    stats;
    expPoints;
    private inPause:boolean = false;

    private userCode = "";
    private customData = {};

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
    getType():string{
        return 'minion';
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
    loadIsFull():boolean{
        return this.stats.load >= this.stats.maxLoad;
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
        console.log(this);
        this.resting = false;
        this.digDir = '';
        if(!this.inPause){
            this.lookAt = '';
            let res;
            try {
                let usrFun = new Function('data', 'common', this.userCode).bind(this);
                res =  usrFun(this.customData, this.commonVarsService.getVariables());
            }
            catch(err){
                console.info("Errorcito");
                console.info(err.message);
                return;
            }
            this.parseResponse(res);
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
        else{
            this.addError('Resting at full energy');
        }
    }
    private go(dir:string):void{
        if(this.getEnergy() == 0){
            this.addError('No energy to GO');
            this.lookAt = '';
            return;
        }
        if(!this.canIGo(dir)){
            this.addError('Invalid position to GO');
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
        if(this.getEnergy() < 3){
            this.addError('Not enough energy to RUN');
            this.lookAt = '';
            return;
        }
        if(!this.canIGo(dir)){
            this.addError('Invalid position to RUN');
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
            if(oResource && oResource.getType() == 'Source'){
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
                    else{
                        this.addError('Nothing to DIG');
                    }
                }
                else{
                    this.addError('At full capacity to DIG');
                }
            }
            else{
                this.addError('There is no ResourceSource to DIG');
            }
        }
        else{
            this.addError('Invalid position to DIG');
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
            if(oStorage && oStorage.getType() == 'Storage'){
                if(this.stats.load > 0){
                    this.expPoints.harvest += this.stats.load;
                    oStorage.store(this.stats.load);
                    this.digDir = 'dig'+dir;
                    this.stats.load = 0;
                }
                else{
                    this.addError('Nothing to STORE');
                }
            }
            else{
                this.addError('There is no ResourceStorage to STORE');
            }
        }
        else{
            this.addError('Invalid position to STORE');
        }
    }


    //HELPERS
    private getSurroundings(){
        let allDirs = ['U', 'D', 'L', 'R'];
        let surroundings = {};

        allDirs.forEach(dir => {
            if(this.isValidPosition(dir)){
                let oCell:Minion|ResourcesStorage|ResourcesSource = this.terrainDist
                    [
                this.posX+(dir.indexOf('R')!=-1?1:(dir.indexOf('L')!=-1?-1:0))
                    ][
                this.posY+(dir.indexOf('D')!=-1?1:(dir.indexOf('U')!=-1?-1:0))
                    ];
                if(oCell){
                    surroundings[dir] = oCell.getType();
                }
            }
        });

        return surroundings;
    }
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

    private cosas(data, common){

        //RESTING
        if(data.isResting){
            if(this.getEnergy() >= 100){
                data.isResting = false;
            }
            else{
                return{
                    action: 'rest'
                }
            }
        }
        if(this.getEnergy() == 0){
            data.isResting = true;
            return{
                action: 'rest'
            }
        }
        //RESTING


        if(this.loadIsFull()){//MUST STORE

        }
        else{//MUST DIG
            let dir = getNearSource();
            if(dir){
                return {action:'dig',arg:dir}
            }
            else if(common.sourceX && common.sourceY){//Check if anybody knows where is source

            }
            else if(data.imInPosition){//Check if Im already looking for source

            }
            else{//Go to position

            }
        }

        return null;

        function getNearSource(){
            let nearObjects = this.getSurroundings();
            let dest = null;
            Object.keys(nearObjects).forEach(dir => {
                if(nearObjects[dir] == 'Source'){
                    dest = dir;
                }
            });
            return dest;
        }
    }
}