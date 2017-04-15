import {StoreModel} from "../models/StoreModel";
import {IStation} from "../store/store.data";
export class StationModel extends StoreModel implements IStation{

    constructor(data) {
        super(data);
    }

    public get id() {
        return this.getKey('id');
    }

    public get localAddress() {
        return this.getKey('localAddress');
    }

    public get publicIp() {
        return this.getKey('publicIp');
    }

    public get peakMemory() {
        return this.getKey('peakMemory');
    }

    public get appVersion() {
        return this.getKey('appVersion');
    }

    public get caching() {
        return this.getKey('caching');
    }

    public get totalMemory() {
        return this.getKey('totalMemory');
    }

    public get runningTime() {
        return this.getKey('runningTime');
    }

    public get startTime() {
        return this.getKey('startTime');
    }

    public get status() {
        return this.getKey('status');
    }

    public get watchDogConnection() {
        return this.getKey('watchDogConnection');
    }

    public get name() {
        return this.getKey('name');
    }

    public getStationName() {
        return this.getKey('name');
    }

    public get connectionStatusChanged() {
        return this.getKey('connectionStatusChanged');
    }

    public get localPort():number {
        return this.getKey('localPort');
    }

    public get socket() {
        return this.getKey('socket');
    }

    public get connection() {
        return this.getKey('connection');
    }

    public get os() {
        return this.getKey('os');
    }

    public get airVersion() {
        return this.getKey('airVersion');
    }

    public get stationColor() {
        return this.getKey('stationColor');
    }

    public get lastUpdate() {
        return this.getKey('lastUpdate');
    }


}