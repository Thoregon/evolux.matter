/**
 *
 *
 * @author: Bernhard Lukassen
 */
import Collection   from "./collection.mjs";
import { forEach }  from "/evolux.util";

// import ObjectAccess from "./objectaccess.mjs";

const TKEY = 't͛';


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
            universe.logger.debug(`MatterAccess: observe`);
            let handler = new this(gunnode, parent, prop, scope);
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
        universe.logger.debug(`MatterAccess: set '${prop.toString()}' -> ${value ? value.toString() : 'null'}`);
        let nextnode = gunnode.get(prop);
        if (value.$access) value = value.$access.gunnode;
        if (Array.isArray(value)) {
            this._setArray(nextnode, value);
            nextnode.get(TKEY).put({ set: true});
        } else {
            nextnode.put(value);
        }
        return this;
    }

    // set property to null if it exists
    deleteProperty(gunnode, prop) {
        universe.logger.debug(`MatterAccess: delete '${prop.toString()}'`);
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

const checkCollection = (gunnode, iscollectionfn, noncollectionfn) => {
    gunnode.get('t͛')
        .once((item, key) => {
            if (item && item.set) {
                iscollectionfn(gunnode);
            } else {
                noncollectionfn(gunnode);
            }
        })
        .not(() => noncollectionfn(gunnode));
};

const gundecorator = {

    has(gunnode) {
        return accesspath => {
            return new Promise((resolve, reject) => {
                gunnode.path(accesspath)
                    .once(obj => resolve(!!obj))
                    .not(() => resolve(false));
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
            gunnode.get(TKEY).put({ set: true});
            return key;
        }
    },

    val(gunnode, proxy) {
        return new Promise(resolve => {
            checkCollection(gunnode,
                gunnode => resolve(new Collection(gunnode)),                    // Wrap with a collection
                gunnode => {
                    // todo: for convenience wrap with object access
                    // gunnode.once((data, key) => resolve(ObjectAccess.observe(data, gunnode, proxy, key)))
                    gunnode.once((data, key) => resolve(data))
                });
            // ToDo: decide if a workcopy should be returned, and if it should be frozen.
            //       but this may be better decided by the code using Matter
            // Hint: Just modifying the returned object does not modify the DB. Must be explicitly set
            // Hint: Calling val() multiple times to a node always delivers the same ( === ) object
                // gunnode => gunnode.once(Object.freeze(Object.assign({}, resolve))));
        });
    },

    full(gunnode, proxy) {
        return new Promise(resolve => {
            checkCollection(gunnode,
                async gunnode => {
                    let col = new Collection(gunnode);    // Wrap with a collection
                    let refs = await col.content;
                    let items = [];
                    if (!refs || !refs.length) resolve(items);
                    await forEach(refs, async ref => {
                        let item = await ref.full;
                        items.push(item);
                    });
                    resolve(items);
                }, gunnode => {
                    // todo: for convenience wrap with object access
                    // gunnode.once((data, key) => resolve(ObjectAccess.observe(data, gunnode, proxy, key)))
                    gunnode.load((data, key) => resolve(data)).not(() => resolve());
                });
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
