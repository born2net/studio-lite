import {StoreModel} from "../models/StoreModel";
export class FasterqLineModel extends StoreModel {

    constructor(data) {
        super(data);
    }

    public get lineId() {
        return this.getKey('line_id');
    }

    public get businessId() {
        return this.getKey('business_id');
    }

    public get lineName() {
        return this.getKey('name') ? this.getKey('name') : this.getKey('line_name');
    }

    public get serviceId() {
        return this.getKey('service_id');
    }

    public get reminder() {
        return this.getKey('reminder');
    }

    public get callType():'EMAIL' | 'SMS' | 'QR' {
        return this.getKey('call_type');
    }

    public get verification() {
        return this.getKey('verification');
    }

    public get sms() {
        return this.getKey('sms');
    }

    public get email() {
        return this.getKey('email');
    }

    public get date() {
        return this.getKey('date');
    }
}
