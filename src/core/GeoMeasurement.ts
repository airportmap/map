export class GeoMeasurement {

    private static readonly EARTH_CIRCUMFERENCE = 40075016.686;
    private static readonly METERS_TO_FEET = 3.28084;
    private static readonly METERS_TO_NM = 0.000539957;
    private static readonly METERS_TO_MILES = 0.000621371;

    private static readonly UNIT_SYSTEMS: Record< string, {
        dist: string, speed: string, alt: string, factor: number
    } > = {
        metric:   { dist:  'm', speed: 'km/h', alt:  'm', factor: 1 },
        imperial: { dist: 'ft', speed:  'mph', alt: 'ft', factor: GeoMeasurement.METERS_TO_FEET },
        avionics: { dist: 'nm', speed:   'kn', alt: 'ft', factor: GeoMeasurement.METERS_TO_NM }
    };

}
