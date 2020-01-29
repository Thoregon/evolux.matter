
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

let gunroot;

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
    async condense() {
        if (!!gunroot) return;      // done, just resume

        let u = myuniverse();
        this.Gun = u.Gun;
        // get the scope
        u.Matter = this;
        if (!u.scope) {
            this.logger.warn(`no scope defined, can't condense matter`);
            return;
        }
        gunroot = u.gun.get(u.scope);
        u.matter = MatterAccess.observe(gunroot, this);

        let root = await u.matter.val;  // looks senseless but don't remove! asks other peers for the defined scope content and inits the local DB if necessary

        this.emit('ready', { matter: this });
    }

    /**
     * before the universe freezes
     */
    async freeze() {
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

    asNode(obj) {
        return this.Gun.node.ify(obj);
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
     * non global stores
     */

    async addStore(name, scope) {
        let store = MatterAccess.observe(gunroot.get(scope), this);
        let root = await store.val;  // looks senseless but don't remove! asks other peers for the defined scope content and inits the local DB if necessary
        let access = myuniverse().matter.$access;
        access.sub(name, store);
    }

    /*
     * config API
     * todo: implement layers
     */

/*
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
*/

    /*
     * Query API
     */


}
