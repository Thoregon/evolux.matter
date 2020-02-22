/**
 *
 *
 * @author: Bernhard Lukassen
 */
import Collection   from "./collection.mjs";
import { forEach }  from "/evolux.util";

// import ObjectAccess from "./objectaccess.mjs";

const TPROP = 't͛';
const TSET  = 't͛set';
const TDEL  = 't͛del';

const tset = {};
tset[TSET] = true;

const extraprops = {
    _       : (gunnode, receiver) => Reflect.get(gunnode, '_', receiver),
    '#'     : (gunnode, receiver) => Reflect.get(gunnode, '#', receiver),
    _id     : (gunnode, receiver) => {
        return new Promise(resolve => {
            gunnode.once(obj => resolve(Gun.node.soul(obj)));
        });
    }
};

export default class MatterAccess {

    constructor(gunnode, parent, prop, scope) {
        this.gunnode    = gunnode;
        this.parent     = parent && parent.$access ? parent.$access.gunnode : parent ;
        this.prop       = prop;
        this.scope      = scope;
        this.stores     = {};
    }


    // proxy a gun handle (
    static observe(gunnode, parent, prop, scope) {
        if (gunnode.$access) return gunnode; // don't proxy a proxy
        if (typeof gunnode === 'object') {
            let handler = new this(gunnode, parent, prop, scope);
            let revocable = Proxy.revocable(gunnode, handler);
            handler.revoke = revocable.revoke;
            return revocable.proxy;
        }
        return gunnode;
    }

    // todo: check reliablility
    has(gunnode, key) {
        return (gunnode && gunnode._ && gunnode._.next) ? Reflect.has(gunnode._.next, key) : false; // key in target;
    }

    // todo: check reliablility
    ownKeys(gunnode) {
        let keys = (gunnode && gunnode._ && gunnode._.next) ? Reflect.ownKeys(gunnode._.next) : [];
        return keys.filter(key => !key.startsWith('$'));
    }

    get(gunnode, prop, receiver) {
        if (prop === '$access') {
            return this;
        }

        // check for extra properties, which are unwrapped or mapped
        if (this.isExtraProperty(prop)) return this.extra(gunnode, prop, receiver);
        // if (prop === '_' || prop === '#') return Reflect.get(gunnode, prop, receiver);

        // check if it is a substore
        const store = this.stores[prop];
        if (!!store) return store;

        // check for decorated methods
        if (this.isDecorated(prop)) return this.decorated(gunnode, prop, receiver);

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
        return MatterAccess.observe(nextnode, this, prop);
    }

    set(gunnode, prop, value, receiver) {
        let nextnode = gunnode.get(prop);
        if (value && value.$access) value = value.$access.gunnode;
        if (Array.isArray(value)) {
            this._setArray(nextnode, value);
            nextnode.put(tset);
        } else {
            nextnode.put(value);
        }
        return this;
    }

    // set property to null if it exists
    deleteProperty(gunnode, prop) {
        gunnode.get(prop).once(() => gunnode.get(prop).put(null));
        return true;
    }

    /*
     * helper methods
     */

    _setArray(gunnode, array, resolve, reject) {
        array.forEach(item => gunnode.set(item));
    }

    pwd() {
        return `${this.parent ? this.parent.pwd()+'.' : ''}${this.prop}`;
    }

    /*
     * extra properties, which will not be wrapped of mapped to a special name
     */

    isExtraProperty(prop) {
        return prop in extraprops;
    }

    extra(gunnode, name, reveiver) {
        return extraprops[name](gunnode, reveiver, this);
    }

    /*
     * virtual methods, extending gun
     */

    isDecorated(prop) {
        return prop in gundecorator;
    }

    decorated(gunnode, name, reveiver) {
        return gundecorator[name](gunnode, reveiver, this);
    }

    /*
     * non global stores
     */

    sub(name, store, ) {
        this.stores[name] = store;
    }
}

/**
 * Implement the Decorator functions for convenient gun access
 */

const root = MatterAccess.observe(universe.gun);

const exists = (obj) => obj && !obj[TDEL];

const isCollection = (obj) => obj && obj[TSET];

const gundecorator = {

    has(gunnode) {
        return accesspath => {
            return new Promise((resolve, reject) => {
                gunnode.path(accesspath)
                    .once(obj => resolve(exists(obj)))
                    .not(() => resolve(false))
            });
        }
    },

    path(gunnode, reveiver) {
        return accesspath => {
            let workpath = Array.isArray(accesspath) ? accesspath : accesspath.split('.');
            let node = reveiver;
            while (workpath.length > 0) {
                let prop = workpath.shift();
                node = node[prop];
            }
            return node;
        }
    },

    parent(gunnode, reveiver) {
        return accesspath => {
            let workpath = Array.isArray(accesspath) ? accesspath : accesspath.split('.');
            let node = reveiver;
            while (workpath.length > 1) node = node[workpath.shift()];
            return node;
        }
    },

    add(gunnode) {
        // todo: metadata { set: true }
        return item => {
            let r = gunnode.set(item);
            let key = r && r._ ? r._.get : undefined;
            gunnode.put(tset);
            return key;
        }
    },

    val(gunnode, proxy) {
        return new Promise(resolve => {
            gunnode.once((data, key) => {
                if (isCollection(data)) {
                    resolve(new Collection(gunnode, data, proxy));   // wrap with a collection
                } else {
                    resolve(exists(data) ? data : undefined);
                }
            }).not(() => resolve());
            // ToDo: decide if a workcopy should be returned, and if it should be frozen.
            //       but this may be better decided by the code using Matter
            // Hint: Just modifying the returned object does not modify the DB. Must be explicitly set
            // Hint: Calling val() multiple times to a node always delivers the same ( === ) object
                // gunnode => gunnode.once(Object.freeze(Object.assign({}, resolve))));
        });
    },

    ownKeys(gunnode, proxy) {
        return new Promise(resolve => {
            gunnode.once((data, key) => {
                if (!data) {
                    resolve([]);
                } else {
                    let props = Reflect.ownKeys(data);
                    props = props.filter(prop => !prop.startsWith(TPROP));
                    if (isCollection(data)) {
                        let idx = [];
                        for (let i = 0; i < props.length; i++) idx.push(i);
                        resolve(idx);
                    } else {
                        resolve(exists(data) ? props : []);
                    }
                }
            }).not(() => resolve([]));
        });
    },

    refids(gunnode, proxy) {
        return new Promise(resolve => {
            gunnode.once((data, key) => {
                let props = Reflect.ownKeys(data);
                props = props.filter(prop => !prop.startsWith(TPROP) && !prop.startsWith('_') && !prop.startsWith('$'));
                resolve(exists(data) ? props : []);
            }).not(() => resolve([]));
        });
    },

    full(gunnode, proxy) {
        return new Promise(resolve => {
            gunnode.load((data, key) => {
                if (isCollection(data)) {
                    resolve(new Collection(gunnode, data, proxy));   // wrap with a collection
                } else {
                    resolve(exists(data) ? data : undefined);
                }
            }).not(() => resolve());
        });
    },

    on(gunnode, proxy, access) {
        return (cb) => {
            gunnode.on((data, key) => cb(data, key, proxy));
        }
    },

    then(gunnode) {
        return (fn) => {
            this.val(gunnode).then(fn).catch(err => universe.logger.error(err));
        }
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

    // get the gun node unwrapped w/o proxy
    node(gunnode) {
        return gunnode;
    },

    /**
     * Get the root of gun to query for ID's
     */
    root() {
        return root;
    }

};
