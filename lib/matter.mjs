
/**
 * A facade to the matter in the universe
 *
 *
 * @author: blukassen
 */

import { myuniverse }               from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";
import MatterAccess                 from "./store/matteraccess.mjs";
import { ErrNoPersistenceProvider } from "./errors.mjs";

export default class Matter extends Reporter(EventEmitter) {

    constructor() {
        super();
        // this._refs = new WeakMap(); // should not be neccessary
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
        let u = myuniverse();
        this.Gun = u.Gun;
        // get the scope
        u.Matter = this;
        if (!u.scope) {
            this.logger.warn(`no scope defined, can't condense matter`);
            return;
        }
        const gunroot = u.gun.get(u.scope);
        u.matter = MatterAccess.observe(gunroot, this);

        this.emit('ready', { matter: this });
    }

    /**
     * before the universe freezes
     */
    freeze() {
        this.emit('exit', { matter: this });
    }

    /*
     * matter processing
     */

    changed(payload, res) {
        this.logger.debug('Persistence changed', payload, res);
    }

    /*
     * forward to Gun.node
     */

    is(obj) {
        return this.Gun.node.is(obj);
    }

    soul(obj) {
        return this.Gun.node.soul(obj);
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
     * config API
     */

    get persistence() {
        return this._persistence;
    }

    set persistence(id) {
        this._persistence = id;
    }

    get persistenceProvider() {
        try {
            const layers = myuniverse().services.layers;
            return layers.stack(this._persistence)
        } catch (e) {
            throw ErrNoPersistenceProvider(e);
        }
    }

    /*
     * Query API
     */


}
