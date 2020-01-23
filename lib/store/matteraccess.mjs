/**
 *
 *
 * @author: Bernhard Lukassen
 */
// import {resolve} from "../../../evolux.universe/bootloader.mjs";

const TKEY = 't͛';

export default class MatterAccess {

    constructor(gunnode, parent) {
        this.gunnode = gunnode;
        this.parent = parent && parent.$access ? parent.$access.gunnode : parent ;
    }


    // proxy a gun handle (
    static observe(gunnode, parent) {
        if (gunnode.$access) return gunnode; // don't proxy a proxy
        if (typeof gunnode === 'object') {
            universe.logger.debug(`MatterAccess: observe`);
            let handler = new this(gunnode, parent);
            let revocable = Proxy.revocable(gunnode, handler);
            handler.revoke = revocable.revoke;
            return revocable.proxy;
        }
        return gunnode;
    }

    has(gunnode, key) {
        universe.logger.debug(`MatterAccess: has '${key.toString()}'`);
        return Reflect.has(gunnode, key); // key in target;
    }

    get(gunnode, prop, receiver) {
        if (prop === '$access') {
            return this;
        }
        universe.logger.debug(`MatterAccess: get '${prop.toString()}'`);

        // check for decorated methods
        if (this.isDecorated(prop)) return this.decorated(gunnode, prop);

        let value = Reflect.get(gunnode, prop, receiver);

        // all methods of gun must be applied directly on Gun, it does not work with a proxy between
        if (typeof value === 'function') {
            //gunnode[prop] = value.bind(gunnode);
            Reflect.set(gunnode, prop, value.bind(gunnode), receiver);
            return Reflect.get(gunnode, prop, receiver);
        }
        if(typeof prop === 'symbol') {
            return value;
        }

        const nextnode = gunnode.get(prop);
        return MatterAccess.observe(nextnode, this);
    }

    set(gunnode, prop, value, receiver) {
        universe.logger.debug(`MatterAccess: set '${prop.toString()}' -> ${value ? value.toString() : 'null'}`);
        let nextnode = gunnode.get(prop);
        if (Array.isArray(value)) {
            this._setArray(nextnode, value);
            gunnode.get(TKEY).put({ set: true});
        } else {
            nextnode.put(value);
        }
        return this;
    }

    _setArray(gunnode, array, resolve, reject) {
        array.forEach(item => gunnode.set(item));
    }

    /*
     * virtual methods, extending gun
     */

    isDecorated(prop) {
        return prop in gundecorator;
    }

    decorated(gunnode, name) {
        return gundecorator[name](gunnode, this);
    }
}

/**
 * Implement the Decorator functions for convenient gun access
 */

const root = MatterAccess.observe(universe.gun);

const gundecorator = {

    has(gunnode) {
        return accesspath => {
            return new Promise((resolve, reject) => {
                gunnode.path(accesspath)
                    .once(obj => resolve(true))
                    .not(() => resolve(false));
            });
        }
    },

    add(gunnode) {
        // todo: metadata { set: true }
        return item => {
            gunnode.get(tkey).put({ set: true});
            gunnode.set(item);
            return gunnode;
        }
    },

    val(gunnode, parent) {
        return new Promise(resolve => {
            gunnode.get('t͛')
                .once((item, key) => {
                    if (item && item.set) {
                        let set = [];
                        gunnode.map().once((item, key) => {
                            if (key !== TKEY){
                                set.push(MatterAccess.observe(gunnode.get(key), parent));
                            }
                        });
                        resolve(set);
                    }
                    gunnode.once(resolve);
                })
                .not(() => {
                    gunnode.once(resolve);
                })
        });
    },

    is(gunnode) {
        return new Promise(resolve => {
            gunnode.once(() => resolve(true)).not(() => resolve(false));
        });
    },

    soul(gunnode) {
        return new Promise(resolve => {
            gunnode.once(item => resolve(universe.Gun.node.soul(item))).not(() => resolve(undefined));
        });
    },

    /**
     * Get the root of gun to query for ID's
     */
    node() {
        return root;
    }

};
