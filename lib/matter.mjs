
/**
 * A facade to the matter in the universe
 *
 *
 * @author: blukassen
 */

import { myuniverse }               from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";
import AccessHandler from "./store/accesshandler.mjs";

export default class Matter extends Reporter(EventEmitter) {

    constructor() {
        super();
        this._storeProviders = new Map();
        this._queryProviders = new Map();
    }

    /**
     * return the 'id' of the named collection,
     * if it doesn't exist undefined
     * @param name
     * @return {number} id - id of the collection or undefined
     */
    getId(name) {

    }

    /**
     * happens after inflation of the universe
     */
    condense() {
        myuniverse().matter = AccessHandler.observe({}, this);
        this.emit('ready', { matter: this });
    }

    /**
     * before the universe freezes
     */
    freeze() {
        this.emit('exit', { matter: this });
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'Matter ready',
            exit:           'Matter exit',
            observe:        'Matter Observer added',
            unobserve:      'Matter Observer removed'
        };
    }

    /*
     * Query API
     */


}
