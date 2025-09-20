import { APMapEventType } from '@airportmap/types';
import { APMap } from '@map/core/APMap';

export class OrientationHandler {

    private supported: boolean = false;
    private active: boolean = false;
    private currentOrientation: number = 0;
    private autoRotate: boolean = false;

    constructor ( private map: APMap ) {

        this.supported = window.DeviceOrientationEvent !== undefined;

        if ( this.supported ) this.init();
        else console.warn( `Device orientation is not supported by this browser` );

    }

    private init () : void {

        window.addEventListener(
            'deviceorientation',
            this.handleOrientationChange.bind( this )
        );

        screen.orientation?.addEventListener(
            'change',
            this.handleScreenOrientationChange.bind( this )
        );

        this.active = true;

    }

    private handleOrientationChange ( event: DeviceOrientationEvent ) : void {

        let heading = event.alpha || 0;
        this.currentOrientation = heading;

        if ( this.autoRotate ) this.rotateMap( heading );

        this.map.dispatchEvent( '' as APMapEventType, {
            heading, beta: event.beta, gamma: event.gamma
        } );

    }

    private handleScreenOrientationChange () : void {

        const orientation = screen.orientation?.type || '';

        if ( this.autoRotate ) this.rotateMap( this.currentOrientation );

    }

}
