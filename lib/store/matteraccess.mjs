/**
 *
 *
 * @author: Bernhard Lukassen
 */
import Collection   from "./collection.mjs";

// import {resolve} from "../../../evolux.universe/bootloader.mjs";

const TKEY = 't͛';

export default class MatterAccess {

    constructor(gunnode, parent) {
        this.gunnode = gunnode;
        this.parent = parent && parent.$access ? parent.$access.gunnode : parent ;
        this.stores = {};
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
        return MatterAccess.observe(nextnode, this);
    }

    set(gunnode, prop, value, receiver) {
        universe.logger.debug(`MatterAccess: set '${prop.toString()}' -> ${value ? value.toString() : 'null'}`);
        let nextnode = gunnode.get(prop);
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

    sub(name, store) {
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
                    .once(obj => resolve(true))
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
            gunnode.set(item);
            gunnode.get(TKEY).put({ set: true});
            return gunnode;
        }
    },

    val(gunnode) {
        return new Promise(resolve => {
            checkCollection(gunnode,
                gunnode => resolve(new Collection(gunnode)),                    // Wrap with a collection
                gunnode => gunnode.once(resolve));
            // ToDo: decide if a workcopy should be returned, and if it should be frozen.
            //       but this may be better decided by the code using Matter
            // Hint: Just modifying the returned object does not modify the DB. Must be explicitly set
            // Hint: Calling val() multiple times to a node always delivers the same ( === ) object
                // gunnode => gunnode.once(Object.freeze(Object.assign({}, resolve))));
        });
    },

    then(gunnode) {
        return (fn) => {
            this.val(gunnode).then(fn).catch(universe.logger.error);
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
