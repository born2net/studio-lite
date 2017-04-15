import {StoreModel} from "../models/StoreModel";
export class FasterqAnalyticsModel extends StoreModel {

    constructor(data) {
        super(data);
    }

    public get lineId() {
        return this.getKey('line_id');
    }

    public get serviceId() {
        return this.getKey('service_id');
    }

    public get queueId() {
        return this.getKey('queue_id');
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

    public get verification() {
        return this.getKey('verification');
    }

    public get called() {
        return this.getKey('called');
    }

    public get businessId() {
        return this.getKey('business_id');
    }
}
1491283369