import { APMapHdgOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';

export class HeadingIndicator {

    private static readonly HDG_SYMBOLS = [ 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW' ];

    private options: Required< APMapHdgOptions >;
    private container: HTMLElement;
    private scale: HTMLElement;

    constructor ( el: HTMLElement, options?: APMapHdgOptions ) {

        this.options = deepmerge< Required< APMapHdgOptions > >( {
            labels: 'mixed',
            pxPerDeg: 6,
            majorStep: 15,
            minorStep: 5
        }, options ?? {} );

        this.container = el;
        this.scale = this.initScale();

    }

    private getCardinal ( angle: number ) : string { return HeadingIndicator.HDG_SYMBOLS[
        Math.round( angle / 45 ) % 8
    ] }

    private initScale () : HTMLElement {

        const { labels, pxPerDeg, majorStep, minorStep } = this.options;

        const width = 720 * pxPerDeg;
        const scale = document.createElement( 'div' );
        scale.className = '__apm_map__ui_hdg_scale';
        scale.style.width = `${width}px`;
        this.container.appendChild( scale );

        for ( let deg = 0; deg <= 720; deg += minorStep ) {

            const tick = document.createElement( 'div' );
            tick.className = 'tick ' + ( deg % majorStep === 0 ? 'major' : 'minor' );
            tick.style.left = `${ deg * pxPerDeg }px`;

            if ( deg % majorStep === 0 ) {

                const angle = deg % 360;
                let label: string | undefined;

                if ( labels === 'degrees' ) label = `${angle}°`;
                else if ( labels === 'cardinal' ) label = this.getCardinal( angle );
                else label = ( angle % 45 === 0 ) ? this.getCardinal( angle ) : `${angle}°`;

                if ( label ) {

                    const lbl = document.createElement( 'span' );
                    lbl.textContent = label;
                    tick.appendChild( lbl );

                }

            }

            scale.appendChild( tick );

        }

        return scale;

    }

    public update ( hdg: number ) : void {

        // ...

    }

}
