import { APMapHdgOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';

export class HeadingIndicator {

    private static readonly HDG_SYMBOLS = [ 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW' ];

    private container: HTMLElement;
    private options: Required< APMapHdgOptions >;

    constructor ( el: HTMLElement, options?: APMapHdgOptions ) {

        this.container = el;

        this.options = deepmerge< Required< APMapHdgOptions > >( {
            labels: 'mixed',
            pxPerDeg: 6,
            majorStep: 15,
            minorStep: 5
        }, options ?? {} );

    }

    private getCardinal ( angle: number ) : string { return HeadingIndicator.HDG_SYMBOLS[
        Math.round( angle / 45 ) % 8
    ] }

    public update ( hdg: number ) : void {

        // ...

    }

}
