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

    private getMetersPerPixel ( lat: number, zoom: number ) : number {

        return 40075016.686 * Math.cos( lat * Math.PI / 180 ) / Math.pow( 2, zoom + 8 );

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

    public latLngToHuman ( coords: LatLng | { lat: number, lng: number } ) : { lat: string, lng: string } {

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

    public formatDistance ( dist: number, options: {
        precision?: number,
        nice?: boolean,
        avionic?: boolean,
        force?: APMapUnits
    } = {} ) : string {

        let unit = 'km';

        if ( options.avionic ) { dist *= 0.539957, unit = 'nm' }
        if ( options.force ?? this.map.opt.units === 'imperial' ) { dist *= 0.621371, unit = 'mi' }

        return `${ options.nice ? this.roundNice( dist ) : dist.toFixed( options.precision ?? 2 ) } ${unit}`;

    }

    public coords () : string {

        const { lat, lng } = this.latLngToHuman( this.map.center );

        return `${lat}, ${lng}`;

    }

    public getScaleRatio () : string {

        const metersPerPixel = this.getMetersPerPixel( this.map.center.lat, this.map.zoom );
        const dpi = window.devicePixelRatio ?? 1 * 96;

        const scale = 1 / ( metersPerPixel / ( 0.0254 / dpi ) );

        return `1:${ Math.round( scale ) }`;

    }

    public getScaleBar ( px: number = 120 ) : { label: string, meters: number, pixels: number } {

        const metersPerPixel = this.getMetersPerPixel( this.map.center.lat, this.map.zoom );
        const nice = this.niceScale( metersPerPixel * px );
        const pixels = nice / metersPerPixel;

        return {
            label: this.formatDistance( nice / 1000 ),
            meters: nice, pixels: Math.round( pixels )
        };

    }

}
