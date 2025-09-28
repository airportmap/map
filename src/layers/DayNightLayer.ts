import { APMapDayNightLayerOptions } from '@airportmap/types';
import { BaseLayer } from '@map/layers/BaseLayer';
import deepmerge from 'deepmerge';
import { LatLngExpression, Polygon } from 'leaflet';

function julian(date: Date): number {
    return (date.getTime() / 86400000) + 2440587.5;
}

function GMST(julianDay: number): number {
    const d = julianDay - 2451545.0;
    return (18.697374558 + 24.06570982441908 * d) % 24;
}

function sunEclipticPosition(julianDay: number) {
    const n = julianDay - 2451545.0;
    let L = 280.460 + 0.9856474 * n;
    L %= 360;
    let g = 357.528 + 0.9856003 * n;
    g %= 360;
    const lambda = L + 1.915 * Math.sin(g * Math.PI / 180) +
        0.02 * Math.sin(2 * g * Math.PI / 180);
    return { lambda, g };
}

function eclipticObliquity(julianDay: number): number {
    const n = julianDay - 2451545.0;
    const T = n / 36525;
    return 23.43929111 -
        T * (46.836769 / 3600
            - T * (0.0001831 / 3600
                + T * (0.00200340 / 3600
                    - T * (0.576e-6 / 3600
                        - T * 4.34e-8 / 3600))));
}

function sunEquatorialPosition(lambda: number, eclObliq: number) {
    const D2R = Math.PI / 180;
    const R2D = 180 / Math.PI;
    let alpha = Math.atan(Math.cos(eclObliq * D2R) * Math.tan(lambda * D2R)) * R2D;
    let delta = Math.asin(Math.sin(eclObliq * D2R) * Math.sin(lambda * D2R)) * R2D;
    const lQuadrant = Math.floor(lambda / 90) * 90;
    const raQuadrant = Math.floor(alpha / 90) * 90;
    alpha = alpha + (lQuadrant - raQuadrant);
    return { alpha, delta };
}

function hourAngle(lng: number, sunPos: { alpha: number }, gst: number): number {
    const lst = gst + lng / 15;
    return lst * 15 - sunPos.alpha;
}

function latitude(ha: number, sunPos: { delta: number }): number {
    const D2R = Math.PI / 180;
    const R2D = 180 / Math.PI;
    return Math.atan(-Math.cos(ha * D2R) / Math.tan(sunPos.delta * D2R)) * R2D;
}

export class DayNightLayer extends BaseLayer< APMapDayNightLayerOptions > {

    private animationFrame: number | null = null;
    private lastUpdate: number = 0;

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

    private calculateDayNightBoundary ( date: Date = new Date() ) : LatLngExpression[] {

        const longitudeRange = 720;
        const resolution = this.options.resolution || 2;
        const today = date;
        const julianDay = julian(today);
        const gst = GMST(julianDay);

        const sunEclPos = sunEclipticPosition(julianDay);
        const eclObliq = eclipticObliquity(julianDay);
        const sunEqPos = sunEquatorialPosition(sunEclPos.lambda, eclObliq);

        const latLng: LatLngExpression[] = [];
        for (let i = 0; i <= longitudeRange * resolution; i++) {
            const lng = -longitudeRange / 2 + i / resolution;
            const ha = hourAngle(lng, sunEqPos, gst);
            latLng[i + 1] = [latitude(ha, sunEqPos), lng];
        }
        if (sunEqPos.delta < 0) {
            latLng[0] = [90, -longitudeRange / 2];
            latLng[latLng.length] = [90, longitudeRange / 2];
        } else {
            latLng[0] = [-90, -longitudeRange / 2];
            latLng[latLng.length] = [-90, longitudeRange / 2];
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

    protected initEventHandlers () : void {}

    public update ( date?: Date ) : void {

        const boundary = this.calculateDayNightBoundary( date );

        ( this.leafletLayer as Polygon ).setLatLngs( boundary );
        this.lastUpdate = Date.now();

    }

    public startAnimation () : void {

        this.stopAnimation();

        const animate = () => {

            const now = Date.now();
            const elapsed = now - this.lastUpdate;

            if ( elapsed > 1000 / ( this.options.animationSpeed || 1 ) ) this.update();

            this.animationFrame = requestAnimationFrame( animate );

        };

        this.animationFrame = requestAnimationFrame( animate );

    }

    public stopAnimation () : void {

        if ( this.animationFrame !== null ) {

            cancelAnimationFrame( this.animationFrame );
            this.animationFrame = null;

        }

    }

}