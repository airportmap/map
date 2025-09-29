import { APMapEventType, APMapOptions, APMapTheme } from '@airportmap/types';
import { LayerManager } from '@map/core/LayerManager';
import { DayNightLayer } from '@map/layers/DayNightLayer';
import { UIManager } from '@map/ui/UIManager';
import { LocationTracker } from '@map/utils/LocationTracker';
import { OrientationHandler } from '@map/utils/OrientationHandler';
import { StateStorage } from '@map/utils/StateStorage';
import { URLHandler } from '@map/utils/URLHandler';
import deepmerge from 'deepmerge';
import { Map as LeafletMap, LeafletEvent, LatLng, LatLngBounds } from 'leaflet';

export class APMap {

    private readonly LATLNG_PRECISION: number = 7;
    private readonly ZOOM_PRECISION: number = 0;

    private element: HTMLElement;
    private options: Required< APMapOptions >;
    private leafletMap: LeafletMap;
    private layerManager: LayerManager;
    private uiManager: UIManager;
    private eventListeners: Map< string, Function[] > = new Map();

    private utils: {
        locationTracker?: LocationTracker,
        orientationHandler?: OrientationHandler,
        stateStorage?: StateStorage,
        urlHandler?: URLHandler
    } = {};

    private components: {
        dayNightLayer?: DayNightLayer
    } = {};

    public get el () : HTMLElement { return this.element }
    public get opt () : Required< APMapOptions > { return this.options }
    public get map () : LeafletMap { return this.leafletMap }
    public get layer () : LayerManager { return this.layerManager }
    public get ui () : UIManager { return this.uiManager }

    public get bounds () : LatLngBounds { return this.leafletMap.getBounds() }
    public get zoom () : number { return Number ( this.leafletMap.getZoom().toFixed( this.ZOOM_PRECISION ) ) }
    public get center () : { lat: number, lng: number } {

        const { lat, lng } = this.leafletMap.getCenter();

        return {
            lat: Number ( lat.toFixed( this.LATLNG_PRECISION ) ),
            lng: Number ( lng.toFixed( this.LATLNG_PRECISION ) )
        };

    }

    public get locationTracker () : LocationTracker | undefined { return this.utils.locationTracker }
    public get orientationHandler () : OrientationHandler | undefined { return this.utils.orientationHandler }
    public get stateStorage () : StateStorage | undefined { return this.utils.stateStorage }
    public get urlHandler () : URLHandler | undefined { return this.utils.urlHandler }

    public get dayNightLayer () : DayNightLayer | undefined { return this.components.dayNightLayer }

    constructor ( element: HTMLElement, options?: APMapOptions ) {

        if ( ! element || ! ( element instanceof HTMLElement ) ) throw new Error (
            `Given element is not a valid HTML element or does not exists`
        );

        this.element = element;
        this.options = this.mergeDefaultOptions( options ?? {} );
        this.leafletMap = this.createMap();

        this.layerManager = new LayerManager( this );
        this.uiManager = new UIManager( this );

        this.initUtils();
        this.initLayer();
        this.setStyles();

    }

    private mergeDefaultOptions ( options: APMapOptions ) : Required< APMapOptions > {

        return deepmerge< Required< APMapOptions > >( {
            mapOptions: {
                attributionControl: false,
                zoomControl: false,
                minZoom: 4,
                maxZoom: 16,
                maxBoundsViscosity: 1
            },
            mode: 'normal',
            theme: 'light',
            uiControl: {
                attributionControl: {
                    enabled: true
                },
                fullscreenControl: {
                    enabled: options.allowFullscreen || true
                },
                headingControl: {
                    enabled: options.enableDeviceOrientation || false
                },
                settingsControl: {
                    enabled: true
                },
                stateControl: {
                    enabled: true
                },
                theaterControl: {
                    enabled: options.mode === 'theater'
                },
                trackingControl: {
                    enabled: options.trackUserPosition || false
                },
                zoomControl: {
                    enabled: true
                }
            },
            allowFullscreen: true,
            urlManipulation: false,
            stateStorage: {
                enabled: false,
                restoreOnLoad: true,
                mapId: undefined
            },
            trackUserPosition: false,
            enableDeviceOrientation: false,
            dayNight: {
                enabled: false
            }
        }, options );

    }

    private createMap () : LeafletMap {

        const map = new LeafletMap ( this.element, this.options.mapOptions );

        map.setMaxBounds( new LatLngBounds(
            new LatLng( -90, -180 ),
            new LatLng(  90,  180 )
        ) );

        map.on( 'moveend', this.handlePositionChanged.bind( this ) );
        map.on( 'zoomend', this.handleZoomChanged.bind( this ) );

        return map;

    }

    private initUtils () : void {

        if ( this.options.stateStorage.enabled )
            this.utils.stateStorage = new StateStorage( this );

        if ( this.options.urlManipulation )
            this.utils.urlHandler = new URLHandler( this );

        if ( this.options.trackUserPosition )
            this.utils.locationTracker = new LocationTracker( this );

        if ( this.options.enableDeviceOrientation )
            this.utils.orientationHandler = new OrientationHandler( this );

    }

    private initLayer () : void {

        if ( this.options.dayNight.enabled ) {

            this.components.dayNightLayer = new DayNightLayer( this, this.options.dayNight );
            this.layer.addLayer( this.components.dayNightLayer );

        }

    }

    private handlePositionChanged ( event: LeafletEvent ) : void {

        this.dispatchEvent( 'position-changed', { event, center: this.center } );

    }

    private handleZoomChanged ( event: LeafletEvent ) : void {

        this.dispatchEvent( 'zoom-changed', { event, zoom: this.zoom } );

    }

    private setStyles () : void {

        this.element.classList.add(
            '__apm_map',
            '__apm_map_' + this.opt.mode,
            '__apm_map_' + this.opt.theme
        );

    }

    public addEventListener ( event: APMapEventType, callback: Function ) : void {

        if ( ! this.eventListeners.has( event ) ) this.eventListeners.set( event, [] );

        this.eventListeners.get( event )!.push( callback );

    }

    public removeEventListener ( event: APMapEventType, callback: Function ) : void {

        if ( ! this.eventListeners.has( event ) ) return;

        const listeners = this.eventListeners.get( event ) || [];
        const index = listeners.indexOf( callback );

        if ( index !== -1 ) listeners.splice( index, 1 );

    }

    public dispatchEvent ( event: APMapEventType, data: any ) : void {

        if ( ! this.eventListeners.has( event ) ) return;

        const listeners = this.eventListeners.get( event ) || [];
        listeners.forEach( callback => callback( data ) );

    }

    public setCenter ( lat: number, lng: number ) : void {

        this.leafletMap.setView( [ lat, lng ], this.leafletMap.getZoom() );

    }

    public setZoom ( zoom: number ) : void {

        this.leafletMap.setZoom( zoom );

    }

    public setView ( lat: number, lng: number, zoom: number ) : void {

        this.leafletMap.setView( [ lat, lng ], zoom );

    }

    public setTheme ( theme: APMapTheme ) : void {

        this.opt.theme = theme;

        this.element.classList.remove( '__apm_map_light __apm_map_dark' );
        this.element.classList.add( '__apm_map_' + theme );

        this.dispatchEvent( 'theme-changed', { theme } );

    }

    public destroy () : void {

        this.utils.locationTracker?.destroy();
        this.utils.orientationHandler?.destroy();
        this.components.dayNightLayer?.destroy();

        this.leafletMap.remove();
        this.eventListeners.clear();

    }

}
