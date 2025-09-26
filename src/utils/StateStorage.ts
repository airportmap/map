import { APMapEventType, APMapState } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import deepmerge from 'deepmerge';

export class StateStorage {

    private readonly storageKey: string;
    private enabled: boolean;
    private restoreOnLoad: boolean;

    private mapState: APMapState = {};

    constructor ( private map: APMap ) {

        const { enabled = false, restoreOnLoad = true, mapId = undefined } = this.map.opt.stateStorage;

        this.enabled = enabled;
        this.restoreOnLoad = restoreOnLoad;
        this.storageKey = `__apmap_state_${ mapId ?? 'default' }`;

        if ( this.enabled ) this.mapState = this.getState();
        if ( this.enabled && this.restoreOnLoad ) this.restoreState();

        this.map.addEventListener( 'position-changed' as APMapEventType, () => {
            this.merge( this.map.center );
        } );

        this.map.addEventListener( 'zoom-changed' as APMapEventType, () => {
            this.set( 'zoom', this.map.zoom );
        } );

    }

    public getState () : APMapState {

        return JSON.parse( localStorage.getItem( this.storageKey ) ?? '' ) as APMapState;

    }

    public saveState () : boolean {

        if ( ! this.enabled ) return false;

        localStorage.setItem( this.storageKey, JSON.stringify( this.mapState ) );

        return true;

    }

    public restoreState () : boolean {

        if ( ! this.enabled ) return false;

        try {

            if (
                typeof this.mapState.lat === 'number' &&
                typeof this.mapState.lng === 'number' &&
                typeof this.mapState.zoom === 'number'
            ) {

                this.map.setView( this.mapState.lat, this.mapState.lng, this.mapState.zoom );

            }

            return true;

        } catch { return false }

    }

    public enable () : void { this.enabled = true }

    public disable () : void { this.enabled = false }

    public get< T > ( key: keyof APMapState ) : T { return this.mapState[ key ] as T }

    public set ( key: keyof APMapState, value: any ) : APMapState {

        this.mapState[ key ] = value;
        this.saveState();

        return this.mapState;

    }

    public merge ( state: Partial< APMapState > ) : APMapState {

        this.mapState = deepmerge( this.mapState, state );
        this.saveState();

        return this.mapState;

    }

    public export () : string { return JSON.stringify( this.mapState ) }

    public import ( stateString: string ) : boolean {

        if ( ! this.enabled ) return false;

        try {

            this.mapState = JSON.parse( stateString ) as APMapState;
            this.saveState();

            return true;

        } catch { return false }

    }

    public clear () : void {

        localStorage.removeItem( this.storageKey );
        this.mapState = {};

    }

    public destroy () : void { this.mapState = {} }

}
