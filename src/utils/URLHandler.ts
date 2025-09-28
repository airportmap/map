import { APMap } from '@map/core/APMap';

export class URLHandler {

    private readonly TIMEOUT: number = 250;

    private updateTimer: number | null = null;
    private enabled: boolean = true;

    public get isEnabled () : boolean { return this.enabled }

    constructor ( private map: APMap ) {

        this.initFromURL();

        this.map.addEventListener( 'position-changed', this.updateURL.bind( this ) );
        this.map.addEventListener( 'zoom-changed', this.updateURL.bind( this ) );

    }

    private initFromURL () : void {

        const hash = new URL( window.location.href ).hash;
        const [ zoom, lat, lng ] = hash.slice( 1 ).split( '/' ).map( Number );

        if ( zoom && lat && lng ) this.map.setView( lat, lng, zoom );

    }

    private updateURLImmediate () : void {

        const { lat, lng } = this.map.center;
        const zoom = this.map.zoom;

        if ( zoom && lat && lng ) window.location.hash = `#${zoom}/${lat}/${lng}`;

    }

    public updateURL () : void {

        if ( ! this.enabled ) return;

        this.destroy();

        this.updateTimer = window.setTimeout(
            this.updateURLImmediate.bind( this ),
            this.TIMEOUT
        );

    }

    public enable () : void { this.enabled = true }

    public disable () : void { this.enabled = false }

    public destroy () : void {

        if ( this.updateTimer !== null ) window.clearTimeout( this.updateTimer );

    }

}
