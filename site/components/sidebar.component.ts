import { Component } from '@angular/core';
import {TerrainService} from "../services/terrain.service";
import {Minion} from "../objects/minion";

@Component({
    selector: 'sidebar',
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
        
        <div class="button clear block" (click)="saveGameState()">Guardar <i class="icon-floppy"></i></div>
    `
})
export class SidebarComponent {
    minionList:Minion[];

    constructor(private terrainService:TerrainService){
        this.minionList = terrainService.getMinionList();
    }

    saveGameState(){
        this.terrainService.saveGameState();
    }
}