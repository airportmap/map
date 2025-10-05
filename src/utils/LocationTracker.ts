import { APMap } from '@map/core/APMap';
import { LatLng, LatLngBounds, CircleMarker, Circle } from 'leaflet';

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

    private zoomToMarkerOnStart: boolean = false;
    private hasZoomedToMarker: boolean = false;

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

        if ( this.zoomToMarkerOnStart && ! this.hasZoomedToMarker ) {

            this.zoomToUserWithAccuracy( latLng, accuracy );
            this.hasZoomedToMarker = true;

        }

        this.map.dispatchEvent( 'user-position-changed', {
            lat: latitude, lng: longitude, accuracy
        } );

    }

    private handlePositionError ( err: GeolocationPositionError ) : void {

        console.error( `Error getting user position:`, err.message );
        this.stopTracking();

    }

    private updateMarkers ( position: LatLng, accuracy: number ) : void {

        const leafletMap = this.map.map;

        if ( ! this.accuracyCircle ) {

            this.accuracyCircle = new Circle( position, {
                radius: accuracy,
                className: '__apm_map__mypos_accuracy',
                interactive: false
            } ).addTo( leafletMap );

        } else {

            this.accuracyCircle.setLatLng( position );
            this.accuracyCircle.setRadius( accuracy );

        }

        if ( ! this.positionMarker ) {

            this.positionMarker = new CircleMarker( position, {
                radius: 10,
                className: '__apm_map__mypos_marker',
                interactive: false
            } ).addTo( leafletMap );

        } else {

            this.positionMarker.setLatLng( position );

        }

    }

    private removeMarkers () : void {

        const leafletMap = this.map.map;

        if ( this.accuracyCircle ) {

            leafletMap.removeLayer( this.accuracyCircle );
            this.accuracyCircle = undefined;

        }

        if ( this.positionMarker ) {

            leafletMap.removeLayer( this.positionMarker );
            this.positionMarker = undefined;

        }

    }

    private zoomToUserWithAccuracy ( position: LatLng, accuracy: number, minBuffer: number = 200 ) : void {

        const { metersToLat, metersToLng } = this.map.geo;
        const { lat, lng } = position;
        const buffer = Math.max( accuracy, minBuffer );

        this.map.map.fitBounds( new LatLngBounds(
            [ lat - metersToLat( buffer ), lng - metersToLng( buffer, lat ) ],
            [ lat + metersToLat( buffer ), lng + metersToLng( buffer, lat ) ]
        ), { animate: true } );

    }

    public startTracking ( options: {
        follow?: boolean,
        highAccuracy?: boolean,
        zoomToMarker?: boolean
    } = {} ) : void {

        this.followUser = options.follow ?? false;
        this.highAccuracy = options.highAccuracy ?? true;
        this.zoomToMarkerOnStart = options.zoomToMarker ?? false;
        this.hasZoomedToMarker = false;

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
        this.zoomToMarkerOnStart = false;
        this.hasZoomedToMarker = false;

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
