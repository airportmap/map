import { APMapHdgOptions } from '@airportmap/types';
import deepmerge from 'deepmerge';

export class HeadingIndicator {

    private options: Required< APMapHdgOptions >;
    private container: HTMLElement;
    private scale: HTMLElement;
    private center: HTMLElement;

    private animationId: number | null = null;
    private currentState: { hdg: number, center: number } = { hdg: 0, center: 0 };
    private targetState: { hdg: number, center: number } = { hdg: 0, center: 0 };

    constructor ( el: HTMLElement, options?: APMapHdgOptions ) {

        this.options = deepmerge< Required< APMapHdgOptions > >( {
            labels: 'mixed',
            pxPerDeg: 6,
            majorStep: 15,
            minorStep: 5,
            speed: 0.1
        }, options ?? {} );

        this.container = el;
        this.scale = this.initScale();
        this.center = this.initCenter();

        this.hide();

    }

    private normalize ( angle: number ) : number { return ( ( angle % 360 ) + 360 ) % 360; }

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

        for ( let deg = -360; deg <= 720; deg += minorStep ) {

            const tick = document.createElement( 'div' );
            tick.className = 'tick ' + ( deg % majorStep === 0 ? 'major' : 'minor' );
            tick.style.left = `${ deg * pxPerDeg }px`;

            if ( deg % majorStep === 0 ) {

                const angle = this.normalize( deg );
                const label = ( labels === 'cardinal' || angle % 45 === 0 ) ? this.getCardinal( angle ) : `${angle}°`;

                const lbl = document.createElement( 'span' );
                lbl.textContent = label;
                tick.appendChild( lbl );

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

    private getShortestRotation ( from: number, to: number ) : number {

        const diff = to - from;

        if ( diff > 180 ) return diff - 360;
        else if ( diff < -180 ) return diff + 360;
        return diff;

    }

    private animate () : void {

        const { speed } = this.options;

        const handleAnimate = ( which: 'hdg' | 'center' ) : boolean => {

            const diff = this.getShortestRotation( this.currentState[ which ], this.targetState[ which ] );

            if ( Math.abs( diff ) > 0.01 ) {

                this.currentState[ which ] = this.normalize( this.currentState[ which ] + diff * speed );
                return true;

            }

            this.currentState[ which ] = this.targetState[ which ];
            return false;

        }

        this.updateVisuals();
        this.animationId = null;

        if ( this.container.classList.contains( 'hidden' ) === false && (
            handleAnimate( 'hdg' ) || handleAnimate( 'center' )
        ) ) {

            this.animationId = requestAnimationFrame( this.animate );

        }

    }

    private updateVisuals () : void {

        const { pxPerDeg } = this.options;
        const center = this.container.clientWidth / 2;

        let displayHeading = this.currentState.hdg;

        if ( displayHeading < 0 ) displayHeading += 360;
        if ( displayHeading >= 360 ) displayHeading -= 360;

        const offset = -( displayHeading * pxPerDeg ) + center;

        this.scale.style.transform = `translateX(${offset}px)`;
        this.center.textContent = `${ Math.round( this.currentState.center ) }°`;

    }

    private startAnimation () : void {

        if ( ! this.container.classList.contains( 'hidden' ) && this.animationId === null ) {

            this.animationId = requestAnimationFrame( this.animate );

        }

    }

    private stopAnimation () : void {

        if ( this.animationId !== null ) {

            cancelAnimationFrame( this.animationId );
            this.animationId = null;

        }

    }

    public update ( hdg: number, centerValue?: number, instant: boolean = false ) : void {

        const normalizedHdg = this.normalize( hdg );
        const normalizedCenter = centerValue !== undefined ? this.normalize( centerValue ) : normalizedHdg;
        this.targetState = { hdg: normalizedHdg, center: normalizedCenter };

        if ( instant ) {

            this.currentState = this.targetState;
            this.updateVisuals();
            this.stopAnimation();

        } else {

            this.startAnimation();

        }

        this.show();

    }

    public updateCenter ( centerValue: number, instant: boolean = false ) : void {

        this.targetState.center = this.normalize( centerValue );

        if ( instant ) {

            this.currentState.center = this.targetState.center;
            this.updateVisuals();

        } else {

            this.startAnimation();

        }

    }

    public show () : void { this.container.classList.remove( 'hidden' ), this.startAnimation() }

    public hide () : void { this.container.classList.add( 'hidden' ), this.stopAnimation() }

    public setAnimationSpeed ( speed: number ) : void { this.options.speed = Math.max( 0.01, Math.min( 1, speed ) ) }

}
