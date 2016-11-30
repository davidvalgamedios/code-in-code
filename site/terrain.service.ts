import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TerrainService {
    static instance: TerrainService;

    constructor(private http:Http){

        return TerrainService.instance = TerrainService.instance || this;
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