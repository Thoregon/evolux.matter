/**
 * collects underlying transactions
 *
 * @author: Bernhard Lukassen
 */

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

export default class Transaction extends Reporter(EventEmitter) {

    constructor() {
        super(...arguments);
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            start:          'Transaction start',
            commit:         'Transaction commit',
            rollback:       'Transaction rollback',
        };
    }

}
