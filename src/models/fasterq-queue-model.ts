import {StoreModel} from "../models/StoreModel";
import {Lib} from "../Lib";
export class FasterqQueueModel extends StoreModel {

    constructor(data) {
        super(data);
    }

    public get queued() {
        return this.getKey('queue_id');
    }

    public get serviceId() {
        var serviceId = this.getKey('service_id');
        return Lib.PadZeros(serviceId, 3, 0);
    }

    public get lineId() {
        return this.getKey('line_id');
    }

    public get verification() {
        return this.getKey('verification');
    }

    public get queueId() {
        return this.getKey('queue_id');
    }

    public get steppedOut() {
        return this.getKey('steppedout');
    }

    public get name() {
        return this.getKey('name');
    }

    public get analyticId() {
        return this.getKey('analytic_id');
    }

    public get serviced() {
        return this.getKey('serviced');
    }

    public get entered() {
        return this.getKey('entered');
    }

    public get businessId() {
        return this.getKey('business_id');
    }

    public get calledBy() {
        return this.getKey('called_by');
    }

    public get called() {
        return this.getKey('called');
    }
}