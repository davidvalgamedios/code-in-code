import { Component } from '@angular/core';
import {TerrainService} from "./terrain.service";
import {Minion} from "./minion";

@Component({
    selector: 'terrain',
    template: `
        <div class="minion" *ngFor="let mn of minionList"
            [style.top]="mn.getY()"
            [style.left]="mn.getX()"><div class="eye"></div></div>
    `,
    providers:[TerrainService]
})
export class TerrainComponent {
    minionList:Minion[];

    constructor(private terrainService:TerrainService){

        this.minionList = this.terrainService.getMinionList();
    }
}