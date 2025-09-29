import { APMapUnits, APMapUnitSystems } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { LatLng } from 'leaflet';

export class GeoMeasurement {

    private static readonly EARTH_CIRCUMFERENCE = 40075016.686;
    private static readonly METERS_TO_FEET = 3.28084;
    private static readonly METERS_TO_NM = 0.000539957;
    private static readonly METERS_TO_MILES = 0.000621371;
    
    private static readonly UNIT_SYSTEMS: Record< APMapUnitSystems, {
        distance: string, speed: string, altitude: string,
        toMeters: number, fromMeters: number
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
                2000, 5000, 10000, 20000, 50000
            ];

            case 'imperial': return [
                1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
                2640, 5280, 10560, 26400, 52800
            ];

            case 'avionic': return [
                1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
                6076, 12152, 30380, 60760
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
        maxPixels: number = 120, minPixels: number = 60
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

}
