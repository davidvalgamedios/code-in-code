import {Injectable} from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Minion} from "../objects/minion";
import {RandomUtils} from "../objects/random-utils";
import {BoundariesUtils} from "../objects/boundaries-utils";
import { UUID } from 'angular2-uuid';
import {ResourcesStorage} from "../objects/resource-storage";
import {ResourcesSource} from "../objects/resource-source";

@Injectable()
export class TerrainService{
    private terrainDist = [];
    private minionList:Minion[] = [];
    private storageList:ResourcesStorage[] = [];
    private resourceList:ResourcesSource[] = [];

    constructor(/*private http:Http*/){
        this.initTerrainDist();
        let savedData = localStorage.getItem('cic-minions');
        if(savedData){
            let savedMinions = JSON.parse(savedData);
            savedMinions.forEach(mn => {
                let minion = new Minion(mn.id, 0, 0, this.terrainDist);
                minion.restoreStateData(mn);
                this.minionList.push(minion);
                this.terrainDist[minion.getX()][minion.getY()] = minion;
            });
        }
        else{
            this.generateRandomMinions();
        }



        savedData = localStorage.getItem('cic-storage');
        if(savedData){
            let savedStorage = JSON.parse(savedData);
            savedStorage.forEach(st => {
                let storage = new ResourcesStorage(0, 0);
                storage.restoreStateData(st);
                this.storageList.push(storage);
                this.terrainDist[storage.getX()][storage.getY()] = storage;
            })
        }
        else{
            this.generateResourceStorage();
        }

        savedData = localStorage.getItem('cic-resource');
        if(savedData){
            let savedResources = JSON.parse(savedData);
            savedResources.forEach(st => {
                let resource = new ResourcesSource(0, 0);
                resource.restoreStateData(st);
                this.resourceList.push(resource);
                this.terrainDist[resource.getX()][resource.getY()] = resource;
            })
        }
        else{
            this.generateResourceSource();
        }

        setInterval(any=>{
            this.executeMinionCodes()
        }, 1000);
    }

    executeMinionCodes(){
        this.minionList.forEach(mn => {
            mn.executeCode();
        });
    }

    getMinionList(){
        return this.minionList;
    }
    getStorageList(){
        return this.storageList;
    }
    getResourceList(){
        return this.resourceList;
    }
    getTerrainDist(){
        return this.terrainDist;
    }

    /*createRoom(){
        this.http.post('/api/call', {
            data: 'data'
        }).toPromise()
        .then(oRes => {
            oRes.json();
        });
    }*/



    saveGameState(){
        let aMinionData = [];
        this.minionList.forEach(oMinion => {
           aMinionData.push(oMinion.getStateData())
        });
        localStorage.setItem('cic-minions', JSON.stringify(aMinionData));

        let aStorageData = [];
        this.storageList.forEach(oStr => {
            aStorageData.push(oStr.getStateData())
        });
        localStorage.setItem('cic-storage', JSON.stringify(aStorageData));

        let aResourcesData = [];
        this.resourceList.forEach(oRsc => {
            aResourcesData.push(oRsc.getStateData())
        });
        localStorage.setItem('cic-resource', JSON.stringify(aResourcesData));
    }

    initTerrainDist(){
        for(let x=0;x<BoundariesUtils.getTerrainWidth();x++){
            this.terrainDist.push(new Array(BoundariesUtils.getTerrainHeight()));
        }
    }
    generateRandomMinions(){
        console.info("GENERA MINIONS");
        let uuid = UUID.UUID();
        let randX = RandomUtils.randomInt(0, BoundariesUtils.getTerrainWidth()-1);
        let randY = RandomUtils.randomInt(0, BoundariesUtils.getTerrainHeight()-1);
        let newMinion = new Minion(uuid, randX, randY, this.terrainDist);
        this.minionList.push(newMinion);
        this.terrainDist[randX][randY] = newMinion;

        uuid = UUID.UUID();
        randX = RandomUtils.randomInt(0, BoundariesUtils.getTerrainWidth()-1);
        randY = RandomUtils.randomInt(0, BoundariesUtils.getTerrainHeight()-1);
        newMinion = new Minion(uuid, randX, randY, this.terrainDist);
        this.minionList.push(newMinion);
        this.terrainDist[randX][randY] = newMinion;
    }
    generateResourceStorage(){
        console.info("GENERA STORAGE");
        let resource = new ResourcesStorage(2, 15);
        this.storageList.push(resource);
        this.terrainDist[2][15] = resource;
    }
    generateResourceSource(){
        console.info("GENERA RESOURCES");
        let source = new ResourcesSource(15, 2);
        this.resourceList.push(source);
        this.terrainDist[15][2] = source;
    }
}