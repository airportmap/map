import { APMapState } from '@airportmap/types';
import { APMap } from '@map/core/APMap';

export class StateStorage {

    private readonly storageKey: string;
    private enabled: boolean;
    private restoreOnLoad: boolean;

    constructor ( private map: APMap ) {

        const { enabled = false, restoreOnLoad = true, mapId = null } = this.map.opt.stateStorage;

        this.enabled = enabled;
        this.restoreOnLoad = restoreOnLoad;
        this.storageKey = `__apmap_state_${ mapId ?? 'default' }`;

    }

    public save () : APMapState | undefined {

        if ( ! this.enabled ) return;

        const state: APMapState = {
            ...this.map.center,
            zoom: this.map.zoom
        };

        localStorage.setItem( this.storageKey, JSON.stringify( state ) );

        return state;

    }

    public clear () : void { localStorage.removeItem( this.storageKey ) }

    public export () : string | null { return localStorage.getItem( this.storageKey ) }

}
