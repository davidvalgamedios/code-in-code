import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Minion} from "../objects/minion";

@Component({
    selector: 'code-editor',
    template: `
        <div class="codeEditorContainer">
            <div class="editorLayout">
                <textarea spellcheck="false" class="codeEditor"
                    onkeydown="if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+'\t'+v.substring(e);this.selectionStart=this.selectionEnd=s+1;return false;}"
                    [(ngModel)]="temporalCode"></textarea>
                <div class="editorHelp">
                    <div class="tabSelector">
                        <div id="varsTab" (click)="selectedTab='vars'"
                            [ngClass]="{'active':selectedTab=='vars'}">
                            VARS
                        </div>
                        <div id="helpTab" (click)="selectedTab='help'"
                            [ngClass]="{'active':selectedTab=='help'}">
                            <i class="icon-help"></i>
                        </div>
                    </div>
                    <div *ngIf="selectedTab=='help'" class="tabSection">
                        <h3>Data</h3>
                        <p>data.any</p>
                        <h3>Getters</h3>
                        <p>
                            fn.getEnergy()<br>
                            fn.getHealth()<br>
                            fn.getLoad()<br>
                            fn.getTerrain(x, y)
                        </p>
                        <h3>Acciones</h3>
                        <p>Formato: (action: %, arg: %)</p>
                        <p>
                            go(dir) [U, D, L, R]<br>
                            rest()<br>
                            dig(dir)<br>
                            store(dir)
                        </p>
                    </div>
                    <div *ngIf="selectedTab=='vars'" class="tabSection">
                        
                    </div>
                </div>
            </div>
            <div class="editorFooter">
                <div class="button clear" (click)="closeEditor()">Cerrar</div>
                <div class="button clear" (click)="saveCode()">Guardar <i class="icon-floppy"></i></div>
            </div>
        </div>
    `,
    providers:[]
})
export class CodeEditorComponent implements OnInit{
    @Input() selectedMinion:Minion;
    @Output() notify: EventEmitter<string> = new EventEmitter<string>();
    temporalCode:string;
    selectedTab:string = 'vars';

    constructor(){
    }

    ngOnInit(){
        this.temporalCode = JSON.parse(JSON.stringify(this.selectedMinion.getUserCode()));
    }

    closeEditor(){
        this.notify.emit('Close');
    }

    saveCode(){
        this.selectedMinion.setUserCode(this.temporalCode);
        this.closeEditor()
    }
}