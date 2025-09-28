import { APMapDayNightLayerOptions } from '@airportmap/types';
import { BaseLayer } from '@map/layers/BaseLayer';
import deepmerge from 'deepmerge';
import { LatLng, Layer, Polygon } from 'leaflet';

export class DayNightLayer extends BaseLayer< APMapDayNightLayerOptions > {

    constructor ( options: APMapDayNightLayerOptions ) {

        super( deepmerge( {
            _id: '__day_night_layer__',
            name: 'Day/Night Boundary',
            visible: true,
            animationSpeed: 1,
            nightColor: '#000',
            nightOpacity: 0.3,
            resolution: 36,
            interactive: false
        }, options ) );

    }

    private calculateSunPosition ( date: Date ) : LatLng {

        const start = new Date( date.getFullYear(), 0, 0 );
        const diff = date.getTime() - start.getTime();
        const dayOfYear = Math.floor( diff / 86.4e6 );

        const declination = 23.45 * Math.sin( ( 2 * Math.PI / 365 ) * ( dayOfYear - 81 ) );

        const b = ( 2 * Math.PI * ( dayOfYear - 81 ) ) / 364;
        const eqTime = 9.87 * Math.sin( 2 * b ) - 7.53 * Math.cos( b ) - 1.5 * Math.sin( b );

        const solarNoon = 12 - eqTime / 60;

        const hoursFromNoon = date.getUTCHours() + date.getUTCMinutes() / 60 - solarNoon;
        const longitude = hoursFromNoon * 15;

        return new LatLng( declination, longitude );

    }

    protected createLeafletLayer () : Layer {

        return new Polygon( [], {
            stroke: false,
            fillColor: this.options.nightColor,
            fillOpacity: this.options.nightOpacity,
            smoothFactor: 1,
            interactive: false
        } );

    }

    protected initEventHandlers () : void {}

}