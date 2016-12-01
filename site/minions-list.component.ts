import { Component } from '@angular/core';
import {TerrainService} from "./terrain.service";
import {Minion} from "./minion";

@Component({
    selector: 'minions-sidebar',
    template: `
        <h1 style="margin-top: 0">Minions</h1>
        <div class="minionAvatar" *ngFor="let mn of minionList">
            <div class="minionContainer">
                <div class="minion"><div class="eye"></div></div>
            </div>
            <div class="indicators">
                <div class="health" [style.width]="mn.getHealth()+'%'"></div>
                <div class="energy" [style.width]="mn.getEnergy()+'%'"></div>
            </div>
        </div>
    `,
    providers:[TerrainService]
})
export class MinionsListComponent {
    minionList:Minion[];

    constructor(private terrainService:TerrainService){
        this.minionList = this.terrainService.getMinionList();
    }

}