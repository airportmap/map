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

    private get effectiveUnitSystem () : APMapUnits {

        const units = this.map.opt.units;
        return this.map.opt.units === 'default' ? 'metric' : units;

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

            case 'avionic': [
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

}
