import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Minion} from "../objects/minion";

@Component({
    selector: 'code-editor',
    template: `
        <div class="codeEditorContainer">
            <div class="editorLayout">
                <textarea spellcheck="false" class="codeEditor"
                    [(ngModel)]="temporalCode"></textarea>
                <div class="editorHelp">
                    <h3>Getters</h3>
                    <p>getEnergy()</p>
                    <p>getHealth()</p>
                    
                    <h3>Acciones</h3>
                    <p>go(dir) -> [U, D, L, R]</p>
                    
                    <h3>Variables</h3>
                    <p>custom (Object)</p>
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