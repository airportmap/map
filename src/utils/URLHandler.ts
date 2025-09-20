import { APMapEventType } from '@airportmap/types';
import { type APMap } from '@map/core/APMap';

export class URLHandler {

    private updateTimer: number | null = null;
    private enabled: boolean = true;

    public get isEnabled () : boolean { return this.enabled }

    constructor ( private map: APMap ) {
    
        this.initializeFromURL();

        this.map.addEventListener( APMapEventType.POSITION, this.updateURL );
        this.map.addEventListener( APMapEventType.ZOOM, this.updateURL );

    }

    private initializeFromURL () : void {

        const hash = new URL( window.location.href ).hash;
        const [ zoom, lat, lon ] = hash.slice( 1 ).split( '/' ).map( Number );

        if ( zoom && lat && lon ) this.map.setView( lat, lon, zoom );

    }

    private updateURLImmediate () : void {}

    public updateURL () : void {

        if ( ! this.enabled ) return;

        if ( this.updateTimer !== null ) window.clearTimeout( this.updateTimer );

        this.updateTimer = window.setTimeout( () => this.updateURLImmediate(), 500 );

    }

    public enable () : void { this.enabled = true }

    public disable () : void { this.enabled = false }

}
