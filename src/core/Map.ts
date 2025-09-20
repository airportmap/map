import type { APMapOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';
import L from 'leaflet';

export class Map {

    private element: HTMLElement
    private options: Required< APMapOptions >;
    private map: L.Map;

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

    }

    private mergeDefaultOptions ( options: APMapOptions ) : Required< APMapOptions > {

        return deepmerge< Required< APMapOptions > >( {
            mapOptions: {}
        }, options );

    }

    private createMap () : L.Map {

        return new L.Map ( this.element, this.options.mapOptions );

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

    }

}
