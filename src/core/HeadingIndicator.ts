import { APMapHdgOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';

export class HeadingIndicator {

    private options: Required< APMapHdgOptions >;
    private container: HTMLElement;
    private scale: HTMLElement;
    private center: HTMLElement;

    constructor ( el: HTMLElement, options?: APMapHdgOptions ) {

        this.options = deepmerge< Required< APMapHdgOptions > >( {
            labels: 'mixed',
            pxPerDeg: 6,
            majorStep: 15,
            minorStep: 5
        }, options ?? {} );

        this.container = el;
        this.scale = this.initScale();
        this.center = this.initCenter();

        this.hide();

    }

    private getCardinal ( angle: number ) : string {

        return [ 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW' ][ Math.round( angle / 45 ) % 8 ];

    }

    private initScale () : HTMLElement {

        const { labels, pxPerDeg, majorStep, minorStep } = this.options;

        const width = 720 * pxPerDeg;
        const scale = document.createElement( 'div' );
        scale.classList.add( '__apm_map__ui_hdg_scale' );
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

    private initCenter () : HTMLElement {

        const center = document.createElement( 'div' );
        center.classList.add( '__apm_map__ui_txtBox', '__apm_map__ui_hdg_center' );
        center.textContent = '—';
        this.container.appendChild( center );

        return center;

    }

    public update ( hdg: number ) : void {

        const { pxPerDeg } = this.options;

        const norm = ( ( hdg % 360 ) + 360 ) % 360;

        const center = this.container.clientWidth / 2;
        const offset = -( norm * pxPerDeg % ( 360 * pxPerDeg ) ) + center;
        this.scale.style.transform = `translateX(${offset}px)`;

        this.center.textContent = `${norm}°`;

        this.show();

    }

    public show () : void { this.container.classList.add( 'hidden' ) }

    public hide () : void { this.container.classList.remove( 'hidden' ) }

}
