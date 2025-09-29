import { APMapUnitSystems } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { LatLng } from 'leaflet';

export class GeoMeasurement {

    private static readonly EARTH_CIRCUMFERENCE = 40075016.686;
    private static readonly METERS_TO_FEET = 3.28084;
    private static readonly METERS_TO_NM = 0.000539957;
    private static readonly METERS_TO_MILES = 0.000621371;

    private static readonly COMPASS_LABELS: Record< number, string > = {
        0: 'N', 45: 'NE', 90: 'E', 135: 'SE',
        180: 'S', 225: 'SW', 270: 'W', 315: 'NW'
    };
    
    private static readonly UNIT_SYSTEMS: Record< APMapUnitSystems, {
        distance: string; speed: string; altitude: string;
        toMeters: number; fromMeters: number;
    } > = {
        metric: { 
            distance: 'm', 
            speed: 'km/h', 
            altitude: 'm', 
            toMeters: 1, 
            fromMeters: 1 
        },
        imperial: { 
            distance: 'ft', 
            speed: 'mph', 
            altitude: 'ft', 
            toMeters: 1 / GeoMeasurement.METERS_TO_FEET, 
            fromMeters: GeoMeasurement.METERS_TO_FEET 
        },
        avionic: { 
            distance: 'nm', 
            speed: 'kn', 
            altitude: 'ft', 
            toMeters: 1 / GeoMeasurement.METERS_TO_NM, 
            fromMeters: GeoMeasurement.METERS_TO_NM 
        }
    };

    constructor ( private map: APMap ) {}

    private get effectiveUnits () : APMapUnitSystems {

        const units = this.map.opt.units;
        return this.map.opt.units === 'default' ? 'metric' : units as APMapUnitSystems;

    }

    private getMetersPerPixel ( lat: number, zoom: number ) : number {

        return GeoMeasurement.EARTH_CIRCUMFERENCE * 
            Math.cos( lat * Math.PI / 180 ) / 
            Math.pow( 2, zoom + 8 );

    }

    private convertDistance ( meters: number, from: APMapUnitSystems, to: APMapUnitSystems ) : number {

        if ( from === to ) return meters;

        const fFrom = GeoMeasurement.UNIT_SYSTEMS[ from ];
        const fTo = GeoMeasurement.UNIT_SYSTEMS[ to ];

        return meters * fFrom.toMeters * fTo.fromMeters;

    }

    private getNiceScales ( units: APMapUnitSystems ) : number[] {

        switch ( units ) {

            case 'metric': return [
                1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
                2000, 5000, 10000, 20000, 50000, 100000,
                200000, 500000, 1000000, 2000000, 5000000,
                10000000, 20000000, 50000000
            ];

            case 'imperial': return [
                1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
                2640, 5280, 10560, 26400, 52800, 105600,
                264000, 528000, 1056000, 2640000, 5280000,
                10560000, 26400000, 52800000
            ];

            case 'avionic': return [
                1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
                6076, 12152, 30380, 60760, 121520, 303800,
                607600, 1215200, 3038000, 6076000, 12152000,
                30380000, 60760000, 121520000
            ];

        }

    }

    private formatDistanceValue ( meters: number, units: APMapUnitSystems ) : { value: number; unit: string } {

        switch ( units ) {

            case 'metric': return meters >= 1000
                ? { value: meters / 1000, unit: 'km' }
                : { value: meters, unit: 'm' };

            case 'imperial': return meters >= 1609.34
                ? { value: meters * GeoMeasurement.METERS_TO_MILES, unit: 'mi' }
                : { value: Math.round( meters * GeoMeasurement.METERS_TO_FEET ), unit: 'ft' };

            case 'avionic': return meters >= 1852
                ? { value: meters * GeoMeasurement.METERS_TO_NM, unit: 'nm' }
                : { value: Math.round( meters * GeoMeasurement.METERS_TO_FEET ), unit: 'ft' };

        }

    }

    private findOptimalScale (
        targetMeters: number, units: APMapUnitSystems,
        maxPixels: number = 150, minPixels: number = 50
    ) : { meters: number, pixels: number } {

        const value = this.convertDistance( targetMeters, 'metric', units );
        const scales = this.getNiceScales( units );
        const perPixel = this.convertDistance(
            this.getMetersPerPixel( this.map.center.lat, this.map.zoom ),
            'metric', units
        );

        for ( const meters of scales ) {

            const pixels = meters / perPixel;

            if ( pixels >= minPixels && pixels <= maxPixels ) return { meters, pixels };

        }

        return { meters: value, pixels: value / perPixel };

    }

    private degToDMS ( deg: number, isLat: boolean, precision: number = 2 ) : string {

        const abs = Math.abs( deg );
        const d = Math.floor( abs );
        const m = Math.floor( ( abs - d ) * 60 );
        const s = ( ( abs - d - m / 60 ) * 3600 ).toFixed( precision );
        const dir = isLat ? ( deg >= 0 ? 'N' : 'S' ) : ( deg >= 0 ? 'E' : 'W' );

        return `${d}° ${m}′ ${s}″ ${dir}`;

    }

    private dmsToDeg ( dms: string ) : number {

        const match = dms.match( /(\d+)[°]\s*(\d+)[′]\s*([\d.]+)[″]\s*([NSEW])/ );
        if ( ! match ) return 0;

        const [ , d, m, s, dir ] = match;
        let deg = Number( d ) + Number( m ) / 60 + Number( s ) / 3600;
        if ( dir === 'S' || dir === 'W' ) deg *= -1;

        return deg;

    }

    public getScaleRatio () : string {

        const metersPerPixel = this.getMetersPerPixel( this.map.center.lat, this.map.zoom );
        const dpi = ( window.devicePixelRatio ?? 1 ) * 96;
        const scale = 1 / ( metersPerPixel / ( 0.0254 / dpi ) );

        return `1:${ Math.round( scale ).toLocaleString() }`;

    }

    public getScaleBar ( targetPixels: number = 80 ) : {
        label: string, distance: number, units: APMapUnitSystems,
        pixels: number, scale: string
    } {

        const units = this.effectiveUnits;
        const targetMeters = this.getMetersPerPixel( this.map.center.lat, this.map.zoom ) * targetPixels;
        const { meters, pixels } = this.findOptimalScale( targetMeters, units );
        const { value, unit } = this.formatDistanceValue( meters, units );
        const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed( 1 );

        return {
            label: `${formattedValue} ${unit}`,
            distance: meters, units,
            pixels: Math.round( pixels ),
            scale: this.getScaleRatio()
        };

    }

    public formatDistance ( distanceMeters: number, options: {
        precision?: number; forceUnit?: APMapUnitSystems; compact?: boolean; avionics?: boolean;
    } = {} ) : string {

        const units = options.avionics && this.map.opt.units === 'default'
            ? 'avionic' : options.forceUnit ?? this.effectiveUnits;

        const { value, unit } = this.formatDistanceValue( distanceMeters, units );
        const precision = options.precision ?? ( value >= 100 ? 0 : value >= 10 ? 1 : 2 );
        const formattedValue = value.toFixed( precision ).replace( /\.?0+$/, '' );

        return options.compact ? `${formattedValue}${unit}` : `${formattedValue} ${unit}`;

    }

    public getCoordinates () : string {

        const center = this.map.center;
        const lat = this.degToDMS( center.lat, true );
        const lng = this.degToDMS( center.lng, false );

        return `${lat}, ${lng}`;

    }

    public latLngToHuman ( coords: LatLng | { lat: number; lng: number } ) : { lat: string; lng: string } {

        return {
            lat: this.degToDMS( coords.lat, true ),
            lng: this.degToDMS( coords.lng, false )
        };

    }

    public humanToLatLng ( lat: string, lng: string ) : LatLng {

        return new LatLng( this.dmsToDeg( lat ), this.dmsToDeg( lng ) );

    }

    public getHeadingIndicator ( heading: number, options: {
        stepSize?: number; range?: number;
    } = {} ) : {
        angle: number; major: boolean;
        position: number; label: string;
    }[] {

        const { stepSize = 30, range = 3 } = options;
        const centerStep = Math.round( heading / stepSize );
        const indicators = [];

        for ( let i = -range; i <= range; i++ ) {

            const angle = ( ( centerStep + i ) * stepSize + 360 ) % 360;

            indicators.push( {
                angle, major: angle % 90 === 0, position: i,
                label: GeoMeasurement.COMPASS_LABELS[ angle ] ?? `${angle}°`
            } );

        }

        return indicators;

    }

}
