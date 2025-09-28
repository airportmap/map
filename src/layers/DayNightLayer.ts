import { APMapDayNightLayerOptions } from '@airportmap/types';
import { BaseLayer } from '@map/layers/BaseLayer';
import deepmerge from 'deepmerge';
import { LatLng, LatLngExpression, Polygon } from 'leaflet';

export class DayNightLayer extends BaseLayer< APMapDayNightLayerOptions > {

    private animationFrame: number | null = null;
    private lastUpdate: number = 0;

    protected override leafletLayer: Polygon;

    constructor ( options: Partial< APMapDayNightLayerOptions > ) {

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

        if ( this.visible ) this.startAnimation();

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

    private calculateDayNightBoundary ( date: Date = new Date() ) : LatLngExpression[] {

        const sunPos = this.calculateSunPosition( date );

        const resolution = this.options.resolution || 36;
        const points: LatLngExpression[] = [];

        const antipodeLat = -sunPos.lat;
        const antipodeLng = sunPos.lng > 0 ? sunPos.lng - 180 : sunPos.lng + 180;

        for ( let i = 0; i < resolution; i++ ) {

            const angle = ( i / resolution ) * 2 * Math.PI;
            const latOffset = 90 * Math.cos( angle );
            const lngOffset = 90 * Math.sin( angle ) / Math.cos(
                ( antipodeLat + latOffset ) * Math.PI / 180
            );

            let lat = antipodeLat + latOffset;
            let lng = antipodeLng + lngOffset;

            if ( lat > 90 ) lat = 90;
            if ( lat < -90 ) lat = -90;
            if ( lng > 180 ) lng -= 360;
            if ( lng < -180 ) lng += 360;

            points.push( [ lat, lng ] );

        }

        if ( points.length > 0 ) points.push( points[ 0 ] );

        if ( antipodeLat > 0 ) {

            points.push( [ -90, -180 ] );
            points.push( [ -90, 0 ] );
            points.push( [ -90, 180 ] );

        } else {

            points.push( [ 90, -180 ] );
            points.push( [ 90, 0 ] );
            points.push( [ 90, 180 ] );

        }

        return points;

    }

    private startAnimation () : void {

        this.stopAnimation();

        const animate = () => {

            const now = Date.now();
            const elapsed = now - this.lastUpdate;

            if ( elapsed > 1000 / ( this.options.animationSpeed || 1 ) ) this.update();

            this.animationFrame = requestAnimationFrame( animate );

        };

        this.animationFrame = requestAnimationFrame( animate );

    }

    private stopAnimation () : void {

        if ( this.animationFrame !== null ) {

            cancelAnimationFrame( this.animationFrame );
            this.animationFrame = null;

        }

    }

    protected createLeafletLayer () : Polygon {

        return new Polygon( [], {
            stroke: false,
            fillColor: this.options.nightColor,
            fillOpacity: this.options.nightOpacity,
            smoothFactor: 1,
            interactive: false
        } );

    }

    protected initEventHandlers () : void {}

    public update () : void {

        const boundary = this.calculateDayNightBoundary();

        this.leafletLayer.setLatLngs( boundary );
        this.lastUpdate = Date.now();

    }

}