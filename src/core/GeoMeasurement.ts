import { APMap } from '@map/core/APMap';
import { LatLng } from 'leaflet';

export class GeoMeasurement {

    constructor ( private map: APMap ) {}

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
