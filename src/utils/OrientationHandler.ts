import { APMap } from '@map/core/APMap';

export class OrientationHandler {

    private supported: boolean = false;
    private active: boolean = false;
    private autoRotate: boolean = false;
    private currentOrientation: number = 0;

    public get isSupported () : boolean { return this.supported }
    public get isActive () : boolean { return this.active }
    public get isAutoRotateEnabled () : boolean { return this.autoRotate }
    public get currentHeading () : number { return this.currentOrientation }

    constructor ( private map: APMap ) {

        this.supported = window.DeviceOrientationEvent !== undefined;

        if ( this.supported ) this.init();
        else console.warn( `Device orientation is not supported by this browser` );

    }

    private init () : void {

        window.addEventListener( 'deviceorientation', this.handleOrientationChange.bind( this ) );
        screen.orientation?.addEventListener( 'change', this.handleScreenOrientationChange.bind( this ) );

        this.active = true;

    }

    private handleOrientationChange ( event: DeviceOrientationEvent ) : void {

        let heading = event.alpha || 0;
        this.currentOrientation = heading;

        if ( this.autoRotate ) this.rotateMap( heading );

        this.map.dispatchEvent( 'device-orientation-changed', {
            heading, beta: event.beta, gamma: event.gamma
        } );

    }

    private handleScreenOrientationChange () : void {

        if ( this.autoRotate ) this.rotateMap( this.currentOrientation );

    }

    private rotateMap ( heading: number ) : void {

        const container = this.map.map.getContainer();

        container.style.transform = `rotate(${-heading}deg)`;

        this.map.map.invalidateSize();

    }

    public resetRotation(): void {

        const container = this.map.map.getContainer();

        container.style.transform = '';

        this.map.map.invalidateSize();

    }

    public enableAutoRotate () : void {

        if ( ! this.supported ) return;

        this.autoRotate = true;

        if ( this.currentOrientation !== 0 ) this.rotateMap( this.currentOrientation );

    }

    public disableAutoRotate () : void {

        this.autoRotate = false;
        this.resetRotation();

    }

    public toggleAutoRotate () : boolean {

        if ( this.autoRotate ) this.disableAutoRotate();
        else this.enableAutoRotate();

        return this.autoRotate;

    }

    public destroy () : void {

        if ( this.supported ) {

            window.removeEventListener( 'deviceorientation', this.handleOrientationChange.bind( this ) );
            screen.orientation?.removeEventListener( 'change', this.handleScreenOrientationChange.bind( this ) );

            this.resetRotation();

        }

    }

}
