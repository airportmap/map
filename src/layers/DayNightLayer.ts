import { APMapDayNightLayerOptions } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { BaseLayer } from '@map/layers/BaseLayer';
import deepmerge from 'deepmerge';
import { LatLngExpression, Polygon } from 'leaflet';

export class DayNightLayer extends BaseLayer< APMapDayNightLayerOptions > {

    private animationFrame: number | null = null;
    private lastUpdate: number = 0;

    public get updated () : number { return this.lastUpdate }
    public get speed () : number { return this.options.animationSpeed }

    constructor ( map: APMap, options: Partial< APMapDayNightLayerOptions > ) {

        super( map, deepmerge( {
            _id: '__day_night_layer__',
            name: 'Day/Night Boundary',
            visible: true,
            animationSpeed: 1,
            nightColor: '#000',
            nightOpacity: 0.3,
            longitudeRange: 720,
            resolution: 36,
            interactive: false
        }, options ) );

    }

    private julian ( date: Date ) : number {

        return ( date.getTime() / 86400000 ) + 2440587.5;

    }

    private GMST ( julianDay: number ) : number {

        return ( 18.697374558 + 24.06570982441908 * ( julianDay - 2451545.0 ) ) % 24;

    }

    private sunEclipticPosition ( julianDay: number ) : { lambda: number, g: number } {

        const n = julianDay - 2451545.0;
        const L = ( 280.460 + 0.9856474 * n ) % 360;
        const g = ( 357.528 + 0.9856003 * n ) % 360;

        const lambda = L + 1.915 * Math.sin( g * Math.PI / 180 ) + 0.02 * Math.sin( 2 * g * Math.PI / 180 );

        return { lambda, g };

    }

    private eclipticObliquity ( julianDay: number ) : number {

        const T = ( julianDay - 2451545.0 ) / 36525;

        return 23.43929111 - T * ( 46.836769 / 3600 - T * ( 0.0001831 / 3600 + T * (
            0.00200340 / 3600 - T * ( 0.576e-6 / 3600 - T * 4.34e-8 / 3600 )
        ) ) );

    }

    private sunEquatorialPosition ( lambda: number, eclObliq: number ) : { alpha: number, delta: number } {

        const D2R = Math.PI / 180;
        const R2D = 180 / Math.PI;

        let alpha = Math.atan( Math.cos( eclObliq * D2R ) * Math.tan( lambda * D2R ) ) * R2D;
        let delta = Math.asin( Math.sin( eclObliq * D2R ) * Math.sin( lambda * D2R ) ) * R2D;

        alpha = alpha + ( ( Math.floor( lambda / 90 ) * 90 ) - ( Math.floor( alpha / 90 ) * 90 ) );

        return { alpha, delta };

    }

    private hourAngle ( lng: number, sunPos: { alpha: number }, gst: number ) : number {

        return ( gst + lng / 15 ) * 15 - sunPos.alpha;

    }

    private latitude ( ha: number, sunPos: { delta: number } ) : number {

        const D2R = Math.PI / 180;
        const R2D = 180 / Math.PI;

        return Math.atan( -Math.cos( ha * D2R ) / Math.tan( sunPos.delta * D2R ) ) * R2D;

    }

    private calculateDayNightBoundary ( date: Date = new Date() ) : LatLngExpression[] {

        const { longitudeRange, resolution } = this.options;

        const julianDay = this.julian( date );
        const gst = this.GMST( julianDay );

        const sunEclPos = this.sunEclipticPosition( julianDay );
        const eclObliq = this.eclipticObliquity( julianDay );
        const sunEqPos = this.sunEquatorialPosition( sunEclPos.lambda, eclObliq );

        const latLng: LatLngExpression[] = [];

        for ( let i = 0; i <= longitudeRange * resolution; i++ ) {

            const lng = -longitudeRange / 2 + i / resolution;
            const ha = this.hourAngle( lng, sunEqPos, gst );

            latLng[ i + 1 ] = [ this.latitude( ha, sunEqPos ), lng ];

        }

        if ( sunEqPos.delta < 0 ) {

            latLng[ 0 ] = [ 90, -longitudeRange / 2 ];
            latLng[ latLng.length ] = [ 90, longitudeRange / 2 ];

        } else {

            latLng[ 0 ] = [ -90, -longitudeRange / 2 ];
            latLng[ latLng.length ] = [ -90, longitudeRange / 2 ];

        }

        return latLng;

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

    protected initEventHandlers () : void {

        this.layer.on( 'add', this.startAnimation.bind( this ) );
        this.layer.on( 'remove', this.stopAnimation.bind( this ) );

    }

    public update ( date?: Date ) : void {

        const boundary = this.calculateDayNightBoundary( date );

        ( this.layer as Polygon ).setLatLngs( boundary );
        this.lastUpdate = Date.now();

    }

    public startAnimation () : void {

        this.stopAnimation();

        if ( this.options.animationSpeed ) {

            const animate = () => {

                const now = Date.now();
                const elapsed = now - this.lastUpdate;

                if ( elapsed > 1000 / ( this.options.animationSpeed || 1 ) ) this.update();

                this.animationFrame = requestAnimationFrame( animate );

            };

            this.animationFrame = requestAnimationFrame( animate );

        }

    }

    public stopAnimation () : void {

        if ( this.animationFrame !== null ) {

            cancelAnimationFrame( this.animationFrame );
            this.animationFrame = null;

        }

    }

    public setAnimationSpeed ( speed: number ) : void {

        this.options.animationSpeed = speed;
        this.startAnimation();

    }

    public setNightColor ( color: string ) : void {

        this.options.nightColor = color;
        ( this.layer as Polygon ).setStyle( { fillColor: color } );

    }

    public setNightOpacity ( opacity: number ) : void {

        this.options.nightOpacity = opacity;
        ( this.layer as Polygon ).setStyle( { fillOpacity: opacity } );

    }

    public destroy () : void { this.stopAnimation() }

}
