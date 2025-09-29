import { APMapUnitSystems, APMapUnitSystemType, APMapUnitSystem } from '@airportmap/types';
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

    private unitConverter (
        value: number, type: APMapUnitSystemType,
        from: APMapUnitSystems, to: APMapUnitSystems,
        unit: string | boolean = true, precision: number = 2
    ) : number {

        //

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

}
