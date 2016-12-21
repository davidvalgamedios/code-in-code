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
        this.resting = false;
        this.digDir = '';
        if(!this.inPause){
            this.lookAt = '';
            let res;

                //TEST
                if(this.userCode){
                    res = this.valeroTestingCode(this.customData, this.commonVarsService.getVariables());
                }
                //TEST

                //let usrFun = new Function('data', 'common', this.userCode).bind(this);
                //res =  usrFun(this.customData, this.commonVarsService.getVariables());
            try {}
            catch(err){
                this.inPause = true;
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
        if(dir=='U') this.posY -= 1;
        else if(dir=='D') this.posY += 1;
        if(dir=='R') this.posX += 1;
        else if(dir=='L') this.posX -= 1;

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
        if(dir=='U') this.posY -= 1;
        else if(dir=='D') this.posY += 1;
        if(dir=='R') this.posX += 1;
        else if(dir=='L') this.posX -= 1;

        if(this.canIGo(dir)){
            if(dir=='U') this.posY -= 1;
            else if(dir=='D') this.posY += 1;
            if(dir=='R') this.posX += 1;
            else if(dir=='L') this.posX -= 1;
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
            let res = this.whatsIn(dir);
            if(dir){
                surroundings[dir] = res;
            }
        });

        return surroundings;
    }
    private whatsIn(dir):string|null{
        if(!this.isValidPosition(dir)) return 'out';

        let oCell:Minion|ResourcesStorage|ResourcesSource = this.terrainDist
            [
        this.posX+(dir=='R'?1:(dir=='L'?-1:0))
            ][
        this.posY+(dir=='D'?1:(dir=='U'?-1:0))
            ];
        if(oCell){
            return oCell.getType();
        }
        return null;
    }
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
        if(dir.length != 1){
            return false;
        }
        if(dir == 'U' && this.posY == 0) return false;
        else if(dir == 'D' && this.posY == this.terrainHeight-1) return false;
        if(dir == 'L' && this.posX == 0) return false;
        else if(dir == 'R' && this.posX == this.terrainWidth-1) return false;

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

    private valeroTestingCode(data, common){
        console.log("START VALERO CODE");

        //RESTING
        let restAction = checkResting(this);
        if(restAction){
            return restAction;
        }


        if(this.loadIsFull()){//MUST STORE
            let dir = getNearStorage(this);
            if(dir) {
                return {action:'store',arg:dir}
            }
            dir = goToCoords(this, 2, 15);
            return {action:'go', arg:dir};
        }
        else{//MUST DIG
            let dir = getNearSource(this);
            if(dir){
                return {action:'dig',arg:dir}
            }
            if(common.sourceX && common.sourceY){//Check if anybody knows where is source
                dir = goToCoords(this, common.sourceX, common.sourceY);
                return {action:'go', arg:dir};
            }
            else if(data.searchDirX && data.searchDirY){//Check if Im already looking for source
                dir = resumeSearching(this);
                return {action:'go', arg:dir};
            }
            else{//Go to position
                dir = goToSearchStart(this);
                return {action:'go', arg:dir};
            }
        }


        function goToSearchStart(scope){
            let myX = scope.getX();
            let myY = scope.getY();
            if(myX == 0 && myY == 0){
                data.searchDirX = 1;
                data.searchDirY = 1;
                return '';
            }
            else{
                return goToCoords(scope, data.initialSearch.x, data.initialSearch.y);
            }
        }

        function goToCoords(scope, x, y){
            let myX = scope.getX();
            let myY = scope.getY();
            let vDir;
            let hDir;

            //First calculate intention
            if(myY > y) vDir = 'U';
            else if(myY < y) vDir = 'D';
            if(myX > x) hDir = 'L';
            else if(myX < x) hDir = 'R';

            if(data.verticalFirst && vDir && scope.whatsIn(vDir) == null){
                return vDir;
            }
            else if(hDir && scope.whatsIn(hDir) == null){
                 return hDir;
            }
            else if(vDir && scope.whatsIn(vDir) == null){
                return vDir;
            }
            //I can't go where I want to go
            let reverseV;
            let reverseH;

            if(vDir){
                reverseV = vDir=='U'?'D':'U';
            }
            if(hDir){
                reverseH = hDir=='R'?'L':'R';
            }

            //Check other alternatives
            if(data.verticalFirst && scope.whatsIn(reverseV) == null) return reverseV;
            else if(scope.whatsIn(reverseH) == null) return reverseH;
            else if(scope.whatsIn(reverseV) == null) return reverseV;

            //I can't move
            return '';
        }

        function resumeSearching(scope){//searchDirX exists
            let dir;

            if(data.verticalFirst){
                dir = tryVerticalSearch(scope);
                if(dir) return dir;
                dir = tryHorizontalSearch(scope);
                if(dir) return dir;
                return '';
            }
            else{
                dir = tryHorizontalSearch(scope);
                if(dir) return dir;
                dir = tryVerticalSearch(scope);
                if(dir) return dir;
                return '';
            }
        }

        function tryVerticalSearch(scope){
            let dir = data.searchY == 1?'D':'U';
            let path = scope.whatsIn(dir);
            if(path == null){
                return dir;
            }
            if(path == 'out'){
                data.searchY = data.searchY == 1?0:1;
            }
            return null;
        }

        function tryHorizontalSearch(scope){
            let dir = data.searchX == 1?'R':'L';
            let path = scope.whatsIn(dir);
            if(path == null){
                return dir;
            }
            if(path == 'out'){
                data.searchX = data.searchX == 1?0:1;
            }
            return null;
        }

        function getNearStorage(scope){
            let nearObjects = scope.getSurroundings();
            let dest = null;
            Object.keys(nearObjects).forEach(dir => {
                if(nearObjects[dir] == 'Storage'){
                    dest = dir;
                }
            });
            return dest;
        }

        function getNearSource(scope){
            let nearObjects = scope.getSurroundings();
            let dest = null;
            Object.keys(nearObjects).forEach(dir => {
                if(nearObjects[dir] == 'Source'){
                    let myX = scope.getX();
                    let myY = scope.getY();
                    if(dir == 'U') myY--;
                    else if(dir == 'D') myY++;
                    else if(dir == 'L') myX--;
                    else if(dir == 'R') myX++;
                    //Update common source X
                    common.sourceX = myX;
                    common.sourceY = myY;
                    //Delete search
                    data.searchDirX = null;
                    data.searchDirY = null;
                    dest = dir;
                }
            });
            return dest;
        }

        function checkResting(scope){
            if(data.isResting){
                if(scope.getEnergy() >= 100){
                    data.isResting = false;
                    return null;
                }
                else{
                    return{
                        action: 'rest'
                    }
                }
            }
            if(scope.getEnergy() == 0){
                data.isResting = true;
                return{
                    action: 'rest'
                }
            }
            return null;
        }
    }
}