import { APMapEventType } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { LatLng, Marker, CircleMarker, Circle } from 'leaflet';

export class LocationTracker {

    private readonly MAXAGE = 10000;
    private readonly TIMEOUT = 5000;

    private trackingActive: boolean = false;
    private followUser: boolean = false;
    private highAccuracy: boolean = true;
    private watchId?: number;

    private currentPosition?: LatLng;

    public get isTracking () : boolean { return this.trackingActive }
    public get isFollowing () : boolean { return this.followUser }
    public get currentPos () : LatLng { return this.currentPosition }

    constructor ( private map: APMap ) {}

    private handlePositionUpdate ( position: GeolocationPosition ) : void {

        const { latitude, longitude, accuracy } = position.coords;

        const latLng = new LatLng( latitude, longitude );

        this.currentPosition = latLng;

        this.updateMarkers( latLng, accuracy );

        if ( this.followUser ) this.map.setCenter( latitude, longitude );

        this.map.dispatchEvent( 'user-position-changed' as APMapEventType, {
            lat: latitude, lng: longitude, accuracy
        } );

    }

    private handlePositionError ( err: GeolocationPositionError ) : void {

        console.error( `Error getting user position:`, err.message );

        this.stopTracking();

    }

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

    public stopTracking () : void {

        if ( this.watchId !== null ) {

            navigator.geolocation.clearWatch( this.watchId );
            this.watchId = null;

        }

        this.trackingActive = false;
        this.followUser = false;

        this.removeMarkers();

    }

    public destroy () : void { this.stopTracking() }

}
