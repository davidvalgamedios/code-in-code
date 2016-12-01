import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Minion} from "./minion";
import {RandomUtils} from "./random-utils";
import {BoundariesUtils} from "./boundaries-utils";

@Injectable()
export class TerrainService {
    //static instance: TerrainService;
    private minionList:Minion[] = [];

    constructor(private http:Http){
        let randX = RandomUtils.randomInt(0, BoundariesUtils.getTerrainWidth()-1);
        let randY = RandomUtils.randomInt(0, BoundariesUtils.getTerrainHeight()-1);

        this.minionList.push(new Minion(1, randX, randY, 4));
        //return TerrainService.instance = TerrainService.instance || this;
    }

    getMinionList(){
        return this.minionList;
    }

    createRoom(){
        this.http.post('/api/call', {
            data: 'data'
        }).toPromise()
        .then(oRes => {
            oRes.json();
        });
    }
}