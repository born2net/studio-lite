import {Map, List} from 'immutable';
import { UUID } from 'angular2-uuid';

/**
 * StoreModel is a thin wrapper of Immutable data around for a Class
 * uses the internal immutable map to hold all values.
 * This allows us a base class on which we can extend and inject
 * into any Redux store as we follow Immutability
 *
 * Also ships with a helper static method to create unique IDs
 **/
export abstract class StoreModel<T> {


    protected abstract readonly _baseType: typeof StoreModel;

    private _data: Map<string, any>;

    static UniqueId(){
        return UUID.UUID();
    }

    constructor(data: any = {}) {
        this._data = Map<string, any>(data);
    }



    public setKey(key: string, value: any): T {
        return this.setData(this._data.set(key, value)) as T;
    }

    public getKey(key: string) {
        return this._data.get(key);
    }

    public setData<T>(data: any): T {
        const baseType: any = this._baseType;
        return new baseType(data) as T;
    }

    public getData(): Map<string, any> {
        return this._data;
    }

    /**
     * Create a List or update a list if one exists, with the Map key provided and the value to push to the new/updated list
     * @param ClassName
     * @param i_key
     * @param i_value
     * @returns {T}
     */
    public listPush<K>(i_key: string, i_value: K): T {
        const value = this.getKey(i_key);
        let model: StoreModel<T> = this;
        if (!value) {
            model = this.setKey(i_key, List<any>()) as any;
        }
        let list: List<any> = model.getKey(i_key);
        list = list.push(i_value);
        return model.setKey(i_key, list);
    }
}