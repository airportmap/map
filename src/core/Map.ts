import type { APMapOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';
import { LatLng, LatLngBounds, Map } from 'leaflet';

class APMap {

    private element: HTMLElement
    private options: Required< APMapOptions >;
    private map?: Map;

    constructor (
        element: HTMLElement,
        options?: APMapOptions
    ) {

        if ( ! element || ! ( element instanceof HTMLElement ) ) throw new Error (
            `Given element is not a valid HTML element or does not exists`
        );

        this.element = element;
        this.options = deepmerge< Required< APMapOptions > >( {
            mode: 'normal',
            allowFullscreen: true,
            mapOptions: {
                minZoom: 4,
                maxZoom: 16,
                zoom: 6,
                maxBounds: new LatLngBounds(
                    new LatLng( -90, -180 ),
                    new LatLng(  90,  180 )
                ),
                maxBoundsViscosity: 1,
                scrollWheelZoom: true,
                zoomControl: false
            }
        }, options ?? {} );

        this.create();

    }

    private create () {

        if ( ! this.map ) this.map = new Map (
            this.element,
            this.options.mapOptions
        );

    }

    public draw () {

        //

    }

}

export { APMap };
