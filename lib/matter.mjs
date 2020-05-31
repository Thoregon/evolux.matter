/**
 * A facade to the matter in the universe
 *
 *
 * @author: blukassen
 */

import { REF }                      from "./ubiqutious.mjs";
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
/*
        if (!u.scope) {
            this.logger.warn(`no scope defined, can't condense matter`);
            return;
        }
*/
        gunroot = u.gun; // u.gun.get(u.scope);
        this.matter = MatterAccess.observe(gunroot, this);;
        u.matter = this.matter;

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
     * value and db
     */

    dbobj(obj) {
        if (obj.$access) return obj;
        if (obj instanceof this.Gun) return MatterAccess.observe(gunnode);
        if (obj._) return this.matter.root[this.soul(obj)];
        if (obj['#'])  return this.matter.root[obj['#']];
    }

    async valobj(obj) {
        if (obj._) return obj;
        if (obj['#']) return await this.matter.root[obj['#']].val;
        if (obj.$access) return await obj.val;
        if (obj instanceof this.Gun) return await MatterAccess.observe(gunnode).val;
    }

    async collectionFrom(parent, property) {

    }

    get REF() {
        return REF;
    }

    /*
     * forward to Gun.node
     */

    isdb(obj) {
        return this.Gun.node.is(obj);
    }

    isval(obj) {
        return !!obj._;
    }

    soul(obj) {
        return this.Gun.node.soul(obj);
    }

    key(obj) {
        return obj['#'] ? obj['#'] : (obj._ && obj._.get) ? obj._.get : this.soul(obj);
    }

    async resolve(obj) {
        if (this.is(obj)) return obj;

        let key = (typeof obj === 'object') ? this.key(obj) : obj;
        return key
            ? await this.matter.root[key].val
            : undefined;
    }

    $access(name, gunnode) {
        return MatterAccess.observe(gunnode, gunroot, name);
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
