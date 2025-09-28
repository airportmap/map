import { APMapEventType } from '@airportmap/types';
import { APMap } from '@map/core/APMap';
import { LatLng, CircleMarker, Circle } from 'leaflet';

export class LocationTracker {

    private readonly MAXAGE = 10000;
    private readonly TIMEOUT = 5000;

    private trackingActive: boolean = false;
    private followUser: boolean = false;
    private highAccuracy: boolean = true;
    private watchId?: number;

    private currentPosition?: LatLng;
    private positionMarker?: CircleMarker;
    private accuracyCircle?: Circle;

    public get isTracking () : boolean { return this.trackingActive }
    public get isFollowing () : boolean { return this.followUser }
    public get currentPos () : LatLng | undefined { return this.currentPosition }

    constructor ( private map: APMap ) {}

    private handlePositionUpdate ( position: GeolocationPosition ) : void {

        const { latitude, longitude, accuracy } = position.coords;
        const latLng = new LatLng( latitude, longitude );

        this.currentPosition = latLng;
        this.updateMarkers( latLng, accuracy );

        if ( this.followUser ) this.map.setCenter( latitude, longitude );

        this.map.dispatchEvent( APMapEventType.USER_POSITION_CHANGED, {
            lat: latitude, lng: longitude, accuracy
        } );

    }

    private handlePositionError ( err: GeolocationPositionError ) : void {

        console.error( `Error getting user position:`, err.message );

        this.stopTracking();

    }

    private updateMarkers ( position: LatLng, accuracy: number ) : void {

        const leafletMap = this.map.map;

        if ( ! this.positionMarker ) {

            this.positionMarker = new CircleMarker( position, {
                radius: 10,
                weight: 2,
                color: '#ffffff',
                fillColor: '#176db3',
                fillOpacity: 1,
                opacity: 1
            } ).addTo( leafletMap );

        } else {

            this.positionMarker.setLatLng( position );

        }

        if ( ! this.accuracyCircle ) {

            this.accuracyCircle = new Circle( position, {
                radius: accuracy,
                weight: 1,
                color: '#176db3',
                fillColor: '#176db3',
                fillOpacity: 0.15,
                opacity: 0.3
            } ).addTo( leafletMap );

        } else {

            this.accuracyCircle.setLatLng( position );
            this.accuracyCircle.setRadius( accuracy );

        }

    }

    private removeMarkers () : void {

        const leafletMap = this.map.map;

        if ( this.positionMarker ) {

            leafletMap.removeLayer( this.positionMarker );
            this.positionMarker = undefined;

        }

        if ( this.accuracyCircle ) {

            leafletMap.removeLayer( this.accuracyCircle );
            this.accuracyCircle = undefined;

        }

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

        if ( this.watchId ) {

            navigator.geolocation.clearWatch( this.watchId );
            this.watchId = undefined;

        }

        this.trackingActive = false;
        this.followUser = false;

        this.removeMarkers();

    }

    public setFollowUser ( follow: boolean ) : void {

        this.followUser = follow;

        if ( follow && this.currentPosition ) this.map.setCenter(
            this.currentPosition.lat, this.currentPosition.lng
        );

    }

    public centerOnUserPosition ( zoom?: number ) : boolean {

        if ( ! this.currentPosition ) {

            if ( ! this.trackingActive ) {

                navigator.geolocation.getCurrentPosition(
                    ( position ) => {

                        const { latitude, longitude } = position.coords;

                        if ( zoom !== undefined ) this.map.setView( latitude, longitude, zoom );
                        else this.map.setCenter( latitude, longitude );

                    },
                    ( err ) => console.error( `Error getting user position:`, err.message ),
                    {
                        enableHighAccuracy: this.highAccuracy,
                        maximumAge: this.MAXAGE,
                        timeout: this.TIMEOUT
                    }
                );

            }

            return false;

        }

        const { lat, lng } = this.currentPosition;

        if ( zoom !== undefined ) this.map.setView( lat, lng, zoom );
        else this.map.setCenter( lat, lng );

        return true;

    }

    public destroy () : void { this.stopTracking() }

}
