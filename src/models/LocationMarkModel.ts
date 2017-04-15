import {StoreModel} from "../models/StoreModel";
export class LocationMarkModel extends StoreModel {

    constructor(data) {
        super(data);
    }

    public get lng() {
        return this.getKey('lng');
    }

    public get lat() {
        return this.getKey('lat');
    }

    public get radius() {
        return this.getKey('radius');
    }

    public get draggable() {
        return this.getKey('draggable');
    }

    public setLng(value) {
        return this.setKey<LocationMarkModel>(LocationMarkModel, 'lng', value);
    }

    public setLat(value) {
        return this.setKey<LocationMarkModel>(LocationMarkModel, 'lat', value);
    }

    public seRadius(value) {
        return this.setKey<LocationMarkModel>(LocationMarkModel, 'radius', value);
    }

    public getRadius() {
        return this.getKey('radius');
    }

}