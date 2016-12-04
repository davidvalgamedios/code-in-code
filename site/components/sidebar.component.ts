import { Component } from '@angular/core';
import {TerrainService} from "../services/terrain.service";
import {Minion} from "../objects/minion";
import {ResourcesStorage} from "../objects/resource-storage";

@Component({
    selector: 'sidebar',
    template: `
        <h1 style="margin-top: 0">Minions</h1>
        <div class="minionAvatar" *ngFor="let mn of minionList">
            <div class="minionContainer">
                <div class="minion"><div class="eye"></div></div>
            </div>
            <div class="indicators">
                <div class="ind health" [style.width]="mn.getHealth()+'%'"></div>
                <div class="ind energy" [style.width]="mn.getEnergy()+'%'"></div>
            </div>
        </div>
        
        <h1 style="margin-top: 25px">Recursos</h1>
        <div class="minionAvatar" *ngFor="let st of storageList">
            <div class="minionContainer">
                <div class="storage"><i class="icon icon-box"></i></div>
            </div>
            <div class="indicators">
                <div class="ind bold">Acumulado</div>
                <div class="ind">{{st.getStored()}}</div>
            </div>
        </div>
        
        
        <div class="button clear block" (click)="saveGameState()">Guardar <i class="icon-floppy"></i></div>
    `
})
export class SidebarComponent {
    minionList:Minion[];
    storageList:ResourcesStorage[];

    constructor(private terrainService:TerrainService){
        this.minionList = terrainService.getMinionList();
        this.storageList = this.terrainService.getStorageList();
    }

    saveGameState(){
        this.terrainService.saveGameState();
    }
}