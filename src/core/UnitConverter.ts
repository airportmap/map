import { APMap } from '@map/core/APMap';

export class UnitConverter {

    private readonly DEG_SYMBOL = '°';
    private readonly MIN_SYMBOL = '′';
    private readonly SEC_SYMBOL = '″';

    constructor( private map: APMap ) {}

    private degToDMS ( deg: number, isLat: boolean, precision: number = 2 ) : string {

        const abs = Math.abs( deg );
        const d = Math.floor( abs );
        const m = Math.floor( ( abs - d ) * 60 );
        const s = ( ( abs - d - m / 60 ) * 3600 ).toFixed( precision );

        const dir = isLat ? ( deg >= 0 ? 'N' : 'S' ) : ( deg >= 0 ? 'E' : 'W' );

        return `${d}${ this.DEG_SYMBOL } ${m}${ this.MIN_SYMBOL } ${s}${ this.SEC_SYMBOL } ${dir}`;

    }

    private dmsToDeg ( dms: string ) : number {

        const match = dms.match( /(\d+)[°]\s*(\d+)[′]\s*([\d.]+)[″]\s*([NSEW])/ );

        if ( ! match ) return 0;

        const [, d, m, s, dir] = match;
        let deg = Number( d ) + Number( m ) / 60 + Number( s ) / 3600;

        if ( dir === 'S' || dir === 'W' ) deg *= -1;

        return deg;

    }

}
