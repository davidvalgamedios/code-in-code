import {Injectable} from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Minion} from "../objects/minion";
import {RandomUtils} from "../objects/random-utils";
import {BoundariesUtils} from "../objects/boundaries-utils";
import { UUID } from 'angular2-uuid';

@Injectable()
export class TerrainService{
    private minionList:Minion[] = [];

    constructor(/*private http:Http*/){
        let savedData = localStorage.getItem('cic-minions');
        if(savedData){
            let savedMinions = JSON.parse(savedData);
            savedMinions.forEach(mn => {
                let minion = new Minion(mn.id, 0, 0, 0);
                minion.restoreStateData(mn);
                this.minionList.push(minion);
            });
        }
        else{
            this.generateRandomMinions();
        }
    }

    getMinionList(){
        return this.minionList;
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
    }

    generateRandomMinions(){
        let uuid = UUID.UUID();
        let randX = RandomUtils.randomInt(0, BoundariesUtils.getTerrainWidth()-1);
        let randY = RandomUtils.randomInt(0, BoundariesUtils.getTerrainHeight()-1);
        this.minionList.push(new Minion(uuid, randX, randY, 4));

        uuid = UUID.UUID();
        randX = RandomUtils.randomInt(0, BoundariesUtils.getTerrainWidth()-1);
        randY = RandomUtils.randomInt(0, BoundariesUtils.getTerrainHeight()-1);
        this.minionList.push(new Minion(uuid, randX, randY, 4));
    }
}