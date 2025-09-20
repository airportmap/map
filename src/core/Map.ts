import type { APMapOptions } from '@airportmap/types';
import { Map, type MapOptions } from 'leaflet';

class APMap {

    private element: HTMLElement
    private options: Required< APMapOptions >;
    private map: Map;

    constructor (
        element: HTMLElement,
        options?: APMapOptions
    ) {

        if ( ! element || ! ( element instanceof HTMLElement ) ) throw new Error (
            `Given element is not a valid HTML element or does not exists`
        );

        this.element = element;

        this.options = {
            mode: 'normal',
            fullscreenAllowed: true,
            zoomMin: 4,
            zoomMax: 16,
            ...options
        };

        this.create();

    }

    private create () { this.map = new Map ( this.element, {} ) }

    public draw () {

        //

    }

}

export { APMap };
