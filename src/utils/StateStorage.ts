import { APMapEventType, APMapState } from '@airportmap/types';
import { APMap } from '@map/core/APMap';

export class StateStorage {

    private readonly storageKey: string;
    private enabled: boolean;
    private restoreOnLoad: boolean;

    public set enable ( is: boolean ) { this.enabled = is }

    constructor ( private map: APMap ) {

        const { enabled = false, restoreOnLoad = true, mapId = null } = this.map.opt.stateStorage;

        this.enabled = enabled;
        this.restoreOnLoad = restoreOnLoad;
        this.storageKey = `__apmap_state_${ mapId ?? 'default' }`;

        if ( this.enabled && this.restoreOnLoad ) this.restore();

        this.map.addEventListener( 'position-changed' as APMapEventType, this.save.bind( this ) );
        this.map.addEventListener( 'zoom-changed' as APMapEventType, this.save.bind( this ) );

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

    public restore () : boolean {

        if ( ! this.enabled ) return false;

        const raw = localStorage.getItem( this.storageKey );

        if ( ! raw ) return false;

        try {

            const state: APMapState = JSON.parse( raw );

            if (
                typeof state.lat === 'number' &&
                typeof state.lng === 'number' &&
                typeof state.zoom === 'number'
            ) {

                this.map.setView( state.lat, state.lng, state.zoom );

            }

            return true;

        } catch { return false }

    }

    public clear () : void { localStorage.removeItem( this.storageKey ) }

    public export () : string | null { return localStorage.getItem( this.storageKey ) }

    public import ( stateString: string ) : boolean {

        try {

            localStorage.setItem( this.storageKey, JSON.stringify(
                JSON.parse( stateString ) as APMapState
            ) );

            return true;

        } catch { return false }

    }

}
