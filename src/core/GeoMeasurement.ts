import { APMapUnitSystems, APMapUnitSystemType, APMapUnitSystem, APMapScaleBar } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { LatLng } from 'leaflet';

export class GeoMeasurement {

    private static readonly UNIT_SYSTEMS: Record< APMapUnitSystems, APMapUnitSystem > = {
        metric: {
            distance: {
                base: 'm',
                convert: { imperial: 3.2808399, avionic: 3.2808399 },
                units: { m: 1, km: 0.001 }
            },
            speed: {
                base: 'km/h',
                convert: { imperial: 0.62137119, avionic: 0.539957 },
                units: { 'km/h': 1 }
            },
            altitude: {
                base: 'm',
                convert: { imperial: 3.2808399, avionic: 3.2808399 },
                units: { 'm': 1 }
            }
        },
        imperial: {
            distance: {
                base: 'ft',
                convert: { metric: 0.3048, avionic: 1 },
                units: { ft: 1, mi: 0.00018939 }
            },
            speed: {
                base: 'mph',
                convert: { metric: 1.609344, avionic: 0.86897624 },
                units: { mph: 1 }
            },
            altitude: {
                base: 'ft',
                convert: { metric: 0.3048, avionic: 1 },
                units: { ft: 1 }
            }
        },
        avionic: {
            distance: {
                base: 'ft',
                convert: { metric: 0.3048, imperial: 1 },
                units: { ft: 1, nm: 0.00016458 }
            },
            speed: {
                base: 'kn',
                convert: { metric: 1.852, imperial: 1.15077945 },
                units: { kn: 1 }
            },
            altitude: {
                base: 'ft',
                convert: { metric: 0.3048, imperial: 1 },
                units: { ft: 1 }
            }
        }
    };

    constructor ( private map: APMap ) {}

    private get effectiveUnits () : APMapUnitSystems {

        const units = this.map.opt.units;
        return this.map.opt.units === 'default' ? 'metric' : units as APMapUnitSystems;

    }

    //private getDPI () : number { return ( window.devicePixelRatio ?? 1 ) * 96 }

    private getMetersPerPixel ( lat: number, zoom: number ) : number {

        return 40075016.686 * Math.cos( lat * Math.PI / 180 ) / Math.pow( 2, zoom + 8 );

    }

    private roundNice ( value: number ) : number {

        if ( value === 0 ) return 0;

        const magnitude = Math.pow( 10, Math.floor( Math.log10( Math.abs( value ) ) ) );
        return Number ( ( Math.round( value / magnitude ) * magnitude ).toFixed( 8 ) );

    }

    private unitConverter (
        target: number, type: APMapUnitSystemType, from: APMapUnitSystems, to: APMapUnitSystems,
        unit: string | boolean = true, precision: number = 2, nice: boolean = false
    ) : { value: number; unit: string, factor: number } {

        const fromEntry = GeoMeasurement.UNIT_SYSTEMS[ from ][ type ];
        const toEntry = GeoMeasurement.UNIT_SYSTEMS[ to ][ type ];

        if ( from !== to ) {

            const factor = ( fromEntry.convert as any )[ to ];

            if ( ! factor ) throw new Error (
                `No conversion from ${from} to ${to} for ${type}`
            );

            target *= factor;

        }

        let chosenUnit = toEntry.base;
        let chosenValue = target;
        let factor = 1;

        if ( typeof unit === 'string' ) {

            const f = toEntry.units[ unit ];
            if ( f ) { chosenUnit = unit, chosenValue = target * f, factor = f }

        }

        if ( unit === true ) {

            for ( const [ u, f ] of Object.entries( toEntry.units ) ) {

                const v = target * f;
                if ( v >= 1 && v < 1000 ) { chosenUnit = u, chosenValue = v, factor = f; break }

            }

        }

        return {
            value: nice ? this.roundNice( chosenValue ) : Number ( +chosenValue.toFixed( precision ) ),
            unit: chosenUnit, factor: 1 / factor
        };

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

    public convert (
        target: number, type: APMapUnitSystemType, raw: boolean = false,
        precision: number = 2, nice: boolean = false
    ) : string | { value: number; unit: string, factor: number } {

        const c = this.unitConverter( target, type, 'metric', this.effectiveUnits, true, precision, nice );
        return raw ? c : `${c.value} ${c.unit}`;

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

    public getCoordinates () : string {

        const center = this.map.center;
        const lat = this.degToDMS( center.lat, true );
        const lng = this.degToDMS( center.lng, false );

        return `${lat}, ${lng}`;

    }

    public getScaleBar ( targetPixels: number = 80, by: 'meters' | 'scale' = 'meters' ) : APMapScaleBar {

        const system = this.effectiveUnits;
        const metersPerPixel = this.getMetersPerPixel( this.map.center.lat, this.map.zoom );

        let targetMeters: number;
        if ( by === 'meters' ) targetMeters = metersPerPixel * targetPixels;
        else targetMeters = 0;

        const { value, unit, factor } = this.unitConverter( targetMeters, 'distance', 'metric', system, true, 1, true );
        const pixels = this.unitConverter( value * factor, 'distance', system, 'metric', 'm' ).value / metersPerPixel;

        return { ratio: 0, scale: '', distance: value, unit, pixels, label: `${value} ${unit}` };

    }

}
