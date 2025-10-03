import { APMapHdgOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';

export class HeadingIndicator {

    private container: HTMLElement;
    private options: Required< APMapHdgOptions >;

    constructor ( el: HTMLElement, options?: APMapHdgOptions ) {

        this.container = el;

        this.options = deepmerge< Required< APMapHdgOptions > >( {
            labels: 'mixed',
            pxPerDeg: 6,
            majorStep: 15,
            minorStep: 5
        }, options );

    }

}
