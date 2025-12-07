declare namespace ymaps {
  class Map {
    constructor(element: HTMLElement | string, state: MapState, options?: MapOptions);
    destroy(): void;
    geoObjects: GeoObjectCollection;
    setCenter(center: number[], zoom?: number): void;
  }

  interface MapState {
    center: number[];
    zoom: number;
    controls?: string[];
  }

  interface MapOptions {
    suppressMapOpenBlock?: boolean;
  }

  class Placemark {
    constructor(
      geometry: number[],
      properties?: PlacemarkProperties,
      options?: PlacemarkOptions
    );
    events: EventManager;
  }

  interface PlacemarkProperties {
    balloonContentHeader?: string;
    balloonContentBody?: string;
    hintContent?: string;
  }

  interface PlacemarkOptions {
    preset?: string;
    iconColor?: string;
  }

  interface GeoObjectCollection {
    add(object: Placemark): void;
    remove(object: Placemark): void;
    removeAll(): void;
  }

  interface EventManager {
    add(type: string, callback: () => void): void;
  }

  function ready(callback: () => void): void;
}
