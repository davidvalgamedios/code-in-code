import { Component } from '@angular/core';
import {TerrainService} from "../services/terrain.service";
import {Minion} from "../objects/minion";
import {ResourcesStorage} from "../objects/resource-storage";
import {ResourcesSource} from "../objects/resource-source";

@Component({
    selector: 'terrain',
    template: `
        <div class="minion" *ngFor="let mn of minionList"
            (click)="selectMinion(mn)"
            [ngClass]="{'selected':selectedMinion == mn}" 
            [style.top]="mn.getYpx()"
            [style.left]="mn.getXpx()">
                <div class="eye" [ngClass]="mn.getLookAt()"></div>
        </div>
        
        <div class="storage" *ngFor="let st of storageList" 
            [style.top]="st.getYpx()"
            [style.left]="st.getXpx()">
                <i class="icon icon-box"></i>
        </div>
        
        <div class="resource" *ngFor="let rs of resourceList" 
            [style.top]="rs.getYpx()"
            [style.left]="rs.getXpx()">
                <i class="icon icon-diamond"></i>
        </div>
        
        <code-footer (notify)="closeFooter($event)" [selectedMinion]="selectedMinion"></code-footer>
    `
})
export class TerrainComponent {
    private terrainDist;

    private minionList:Minion[];
    private storageList:ResourcesStorage[];
    private resourceList:ResourcesSource[] = [];
    private selectedMinion:Minion;

    constructor(private terrainService:TerrainService){
        this.terrainDist = this.terrainService.getTerrainDist();
        this.minionList = this.terrainService.getMinionList();
        this.storageList = this.terrainService.getStorageList();
        this.resourceList = this.terrainService.getResourceList();

        setInterval(any=>{
            this.executeMinionCodes()
        }, 1000);
    }

    closeFooter(msg:string){
        this.selectedMinion.setPause(false);
        this.selectedMinion = null;
    }

    selectMinion(minion:Minion){
        minion.setPause(true);
        this.selectedMinion = minion;
    }

    executeMinionCodes(){
        this.minionList.forEach(mn => {
            mn.executeCode();
        });
    }
}