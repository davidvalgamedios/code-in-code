import {Injectable} from '@angular/core';

import 'rxjs/add/operator/toPromise';
import {Minion} from "../objects/minion";
import {RandomUtils} from "../objects/random-utils";
import {BoundariesUtils} from "../objects/boundaries-utils";
import { UUID } from 'angular2-uuid';
import {ResourcesStorage} from "../objects/resource-storage";
import {ResourcesSource} from "../objects/resource-source";
import {CommonVariablesService} from "./common-variables.service";
import {Subject} from "rxjs/Subject";

@Injectable()
export class TerrainService{
    private terrainDist = [];
    private minionList:Minion[] = [];
    private storageList:ResourcesStorage[] = [];
    private resourceList:ResourcesSource[] = [];

    private resourceEvent;

    constructor(/*private http:Http*/private commonVarsService:CommonVariablesService){
        this.resourceEvent = new Subject();
        this.resourceEvent.subscribe(res => {
            //this.terrainDist[res.getX()][res.getY()] = null;
            for(let i=0;i<this.resourceList.length;i++){
                if(res == this.resourceList[i]){
                    this.resourceList.splice(i, 1);
                }
            }
            this.terrainDist[res.getX()][res.getY()] = null;
            this.generateRandomResourceSource();
        });

        this.initTerrainDist();
        this.initMinions();
        this.initStorage();
        this.initResources();

        setInterval(any=>{
            this.executeMinionCodes()
        }, 1000);
    }

    executeMinionCodes(){
        this.minionList.forEach(mn => {
            mn.executeCode();
        });
    }


    //Getters
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


    //SAVES
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

    //INITS AND GENERATORS
    initTerrainDist(){
        for(let x=0;x<BoundariesUtils.getTerrainWidth();x++){
            this.terrainDist.push(new Array(BoundariesUtils.getTerrainHeight()));
        }
    }
    initMinions(){
        let savedData = localStorage.getItem('cic-minions');
        if(savedData){
            let savedMinions = JSON.parse(savedData);
            savedMinions.forEach(mn => {
                let minion = new Minion(mn.id, 0, 0, this.terrainDist, this.commonVarsService);
                minion.restoreStateData(mn);
                this.minionList.push(minion);
                this.terrainDist[minion.getX()][minion.getY()] = minion;
            });
        }
        else{
            this.generateRandomMinion();
            this.generateRandomMinion();
        }
    }
    initStorage(){
        let savedData = localStorage.getItem('cic-storage');
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
            this.generateRandomResourceStorage();
        }
    }
    initResources(){
        let savedData = localStorage.getItem('cic-resource');
        if(savedData){
            let savedResources = JSON.parse(savedData);
            savedResources.forEach(st => {
                let resource = new ResourcesSource(0, 0, this.resourceEvent);
                resource.restoreStateData(st);
                this.resourceList.push(resource);
                this.terrainDist[resource.getX()][resource.getY()] = resource;
            })
        }
        else{
            this.generateRandomResourceSource();
        }
    }
    generateRandomMinion(){
        let uuid = UUID.UUID();
        let coords = this.getRandomEmptyCoords();
        
        let newMinion = new Minion(uuid, coords.x, coords.y, this.terrainDist, this.commonVarsService);
        this.minionList.push(newMinion);
        this.terrainDist[coords.x][coords.y] = newMinion;
    }
    generateRandomResourceStorage(){
        let coords = this.getRandomEmptyCoords();

        let resource = new ResourcesStorage(coords.x, coords.y);
        this.storageList.push(resource);
        this.terrainDist[coords.x][coords.y] = resource;
    }
    generateRandomResourceSource(){
        let coords = this.getRandomEmptyCoords();

        let source = new ResourcesSource(coords.x, coords.y, this.resourceEvent);
        this.resourceList.push(source);
        this.terrainDist[coords.x][coords.y] = source;
    }
    private getRandomEmptyCoords(){
        let spot = "something";
        let randX;
        let randY;

        while(spot != null){
            randX = RandomUtils.randomInt(0, BoundariesUtils.getTerrainWidth()-1);
            randY = RandomUtils.randomInt(0, BoundariesUtils.getTerrainHeight()-1);
            spot = this.terrainDist[randX][randY];
        }

        return {x:randX,y:randY};
    }
}