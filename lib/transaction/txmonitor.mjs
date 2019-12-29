/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

export default class TxMonitor extends Reporter(EventEmitter) {

    constructor() {
        super(...arguments);
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'TransactionMonitor ready',
            exit:           'TransactionMonitor exit',
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
