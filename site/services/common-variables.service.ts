import {Injectable} from '@angular/core';

@Injectable()
export class CommonVariablesService{
    private common = {};

    constructor(){
        let savedData = localStorage.getItem('cic-common-vars');
        if(savedData){
            this.common = JSON.parse(savedData);
        }
    }

    getVariables(){
        return this.common;
    }

    saveVariablesState(){
        localStorage.setItem('cic-common-vars', JSON.stringify(this.common));
    }
}