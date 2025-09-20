import type { APMapOptions, APMapEventType } from '@airportmap/types';
import { URLHandler } from '@map/utils/URLHandler';
import deepmerge from 'deepmerge';
import L from 'leaflet';

export class APMap {

    private element: HTMLElement;
    private options: Required< APMapOptions >;
    private map: L.Map;
    private eventListeners: Map< string, Function[] > = new Map();

    private urlHandler?: URLHandler;

    public get center () : { lat: number, lng: number } {

        const center = this.map.getCenter();

        return { lat: center.lat, lng: center.lng };

    }

    public get zoom () : number { return this.map.getZoom() };
    public get bounds () : L.LatLngBounds { return this.map.getBounds() }

    constructor (
        element: HTMLElement,
        options?: APMapOptions
    ) {

        if ( ! element || ! ( element instanceof HTMLElement ) ) throw new Error (
            `Given element is not a valid HTML element or does not exists`
        );

        this.element = element;
        this.options = this.mergeDefaultOptions( options ?? {} );

        this.map = this.createMap();

        this.initUtils();

    }

    private mergeDefaultOptions ( options: APMapOptions ) : Required< APMapOptions > {

        return deepmerge< Required< APMapOptions > >( {
            mapOptions: {
                minZoom: 4,
                maxZoom: 16
            },
            mode: 'normal',
            allowFullscreen: true,
            urlManipulation: false,
            trackUserPosition: false,
            enableDeviceOrientation: false,
            showDayNightBoundary: false
        }, options );

    }

    private createMap () : L.Map {

        return new L.Map ( this.element, this.options.mapOptions );

    }

    private initUtils() : void {

        if ( this.options.urlManipulation )
            this.urlHandler = new URLHandler( this );

    }

    public addEventListener ( event: APMapEventType, callback: Function ) : void {

        if ( ! this.eventListeners.has( event ) )
            this.eventListeners.set( event, [] );

        this.eventListeners.get( event )!.push( callback );

    }

    public removeEventListener ( event: APMapEventType, callback: Function ) : void {

        if ( ! this.eventListeners.has( event ) ) return;

        const listeners = this.eventListeners.get( event ) || [];
        const index = listeners.indexOf( callback );

        if ( index !== -1 ) listeners.splice( index, 1 );

    }

    public dispatchEvent ( event: APMapEventType, data: any ) : void {

        if ( ! this.eventListeners.has( event ) ) return;

        const listeners = this.eventListeners.get( event ) || [];
        listeners.forEach( callback => callback( data ) );

    }

    public setCenter ( lat: number, lng: number ) : void {

        this.map.setView( [ lat, lng ], this.map.getZoom() );

    }

    public setZoom ( zoom: number ) : void {

        this.map.setZoom( zoom );

    }

    public setView ( lat: number, lng: number, zoom: number ) : void {

        this.map.setView( [ lat, lng ], zoom );

    }

    public destroy () : void {

        this.map.remove();

        this.eventListeners.clear();
        this.urlHandler?.destroy();

    }

}
