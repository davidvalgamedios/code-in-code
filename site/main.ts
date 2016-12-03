import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import {TerrainService} from "./services/terrain.service";
const platform = platformBrowserDynamic();

//import {enableProdMode} from '@angular/core';
//enableProdMode();
platform.bootstrapModule(AppModule, [TerrainService]);
