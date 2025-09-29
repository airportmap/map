import { APMapUnits } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { LatLng } from 'leaflet';

export class UnitConverter {

    constructor( private map: APMap ) {}

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

        const [, d, m, s, dir] = match;
        let deg = Number( d ) + Number( m ) / 60 + Number( s ) / 3600;

        if ( dir === 'S' || dir === 'W' ) deg *= -1;

        return deg;

    }

    private roundNice ( val: number ) : number {

        if ( val >= 100 ) return Math.round( val / 10 ) * 10;
        if ( val >=  10 ) return Math.round( val );
        if ( val >=   1 ) return Math.round( val * 10 ) / 10;

        return Math.round( val * 100 ) / 100;

    }

    private niceScale ( meters: number ) : number {

        const scales = [ 1, 2, 5 ];
        let exp = Math.floor( Math.log10( meters ) );
        let base = Math.pow( 10, exp );

        for ( let s of scales ) if ( meters <= s * base ) return s * base;
        return 10 * base;

    }

    public latLngToHuman ( coords: LatLng ) : { lat: string, lng: string } {

        return {
            lat: this.degToDMS( coords.lat, true ),
            lng: this.degToDMS( coords.lng, false )
        };

    }

    public humanToLatLng ( lat: string, lng: string ) : LatLng {

        return new LatLng(
            this.dmsToDeg( lat ),
            this.dmsToDeg( lng )
        );

    }

    public formatDistance ( distance: number, options: {
        precision?: number,
        nice?: boolean,
        avionic?: boolean,
        force?: APMapUnits
    } = {} ) : string {

        let unit = 'km';

        if ( options.avionic ) {

            distance *= 0.539957;
            unit = 'nm';

        }

        if ( ( options.force ?? this.map.opt.units ) === 'imperial' ) {

            distance *= 0.621371;
            unit = 'mi';

        }

        return `${ options.nice
            ? this.roundNice( distance )
            : distance.toFixed( options.precision ?? 2 )
        } ${unit}`;

    }

}
