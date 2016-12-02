import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Minion} from "./minion";

@Component({
    selector: 'code-footer',
    template: `
        <div class="footer" [style.bottom]="selectedMinion?'0':'-200px'">
            <div *ngIf="selectedMinion">
                <div class="close" (click)="closeFooter()">X</div>
                
                <div class="button">Editar código</div>
                {{selectedMinion.getId()}}
            </div>
        </div>
    `,
    providers:[]
})
export class FooterComponent {
    @Input() selectedMinion:Minion;
    @Output() notify: EventEmitter<string> = new EventEmitter<string>();

    constructor(){
    }

    closeFooter(){
        this.notify.emit('Close');
    }
}