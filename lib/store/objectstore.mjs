/**
 * API class for store implementations
 *
 * @author: Bernhard Lukassen
 */

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

export default class ObjectStore extends Reporter(EventEmitter) {

    constructor() {
        super(...arguments);
    }

    /*
     * ObjectStore API
     */

    // store query

    // store manipulation

    // store definition

    async createCollection(name, ifnotexists = true) {

    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'ObjectStore ready',
            exit:           'ObjectStore exit',
        };
    }

    /*
     * lifecycle
     */

    init() {
        this.emit('ready');
    }

    exit() {
        this.emit('exit');
    }

}
