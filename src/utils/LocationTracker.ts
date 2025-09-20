import { type APMap } from '@map/core/APMap';

export class LocationTracker {

    private readonly MAXAGE = 10000;
    private readonly TIMEOUT = 5000;

    private trackingActive: boolean = false;
    private followUser: boolean = false;
    private highAccuracy: boolean = true;
    private watchId?: number;

    public get isTracking () : boolean { return this.trackingActive }
    public get isFollowing () : boolean { return this.followUser }
    public get currentPos () : LatLng { return this.currentPosition }

    constructor ( private map: APMap ) {}

    public startTracking ( options: { 
        follow?: boolean, 
        highAccuracy?: boolean 
    } = {} ) : void {

        this.followUser = options.follow ?? false;
        this.highAccuracy = options.highAccuracy ?? true;

        if ( ! navigator.geolocation ) {

            console.error( `Geolocation is not supported by this browser` );
            return;

        }

        this.watchId = navigator.geolocation.watchPosition(
            this.handlePositionUpdate.bind( this ),
            this.handlePositionError.bind( this ),
            {
                enableHighAccuracy: this.highAccuracy,
                maximumAge: this.MAXAGE,
                timeout: this.TIMEOUT
            }
        );

        this.trackingActive = true;

    }

}
