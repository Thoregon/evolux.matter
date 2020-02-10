/**
 *
 *
 * @author: Bernhard Lukassen
 */
import Collection   from "./collection.mjs";

const TKEY = 't͛';

export default class ObjectAccess {

    constructor(object, gunnode, parent) {
        this.object     = object;
        this.gunnode    = gunnode;
        this.parent     = parent && parent.$access ? parent.$access.gunnode : parent ;
    }


    // proxy a gun handle (
    static observe(object, gunnode, parent) {
        if (gunnode.$access) return gunnode; // don't proxy a proxy
        if (typeof gunnode === 'object') {
            universe.logger.debug(`ObjectAccess: observe`);
            let handler = new this(object, gunnode, parent);
            let revocable = Proxy.revocable(gunnode, handler);
            handler.revoke = revocable.revoke;
            return revocable.proxy;
        }
        return gunnode;
    }

    has(gunnode, key) {
        return Reflect.has(gunnode, key); // key in target;
    }

    get(gunnode, prop, receiver) {
        if (prop === '$access') {
            return this;
        }
        universe.logger.debug(`MatterAccess: get '${prop.toString()}'`);

        // check for decorated methods
        if (this.isDecorated(prop)) return this.decorated(gunnode, this.object, prop, receiver);

        let value = Reflect.get(gunnode, prop, receiver);

        if(typeof prop !== 'object') {
            return value;
        }

        return ObjectAccess.observe(value, gunnode, this);
    }

    set(gunnode, prop, value, receiver) {
        universe.logger.debug(`MatterAccess: set '${prop.toString()}' -> ${value ? value.toString() : 'null'}`);
        // todo: Objects are immutable, throw error
        return this;
    }

    // set property to null if it exists
    deleteProperty(gunnode, prop) {
        universe.logger.debug(`MatterAccess: delete '${prop.toString()}'`);
        // todo: Objects are immutable, throw error
        return true;
    }

    /*
     * helper methods
     */

    /*
     * virtual methods, extending gun
     */

    isDecorated(prop) {
        return prop in gundecorator;
    }

    decorated(gunnode, object, name, proxy) {
        return gundecorator[name](gunnode, object, proxy, this);
    }
}

/**
 * Implement the Decorator functions for convenient gun access
 */

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

    path(gunnode, object, reveiver) {
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

    parent(gunnode, object, reveiver) {
        return accesspath => {
            let workpath = Array.isArray(accesspath) ? accesspath : accesspath.split('.');
            let node = reveiver;
            while (workpath.length > 1) node = node[workpath.shift()];
            return node;
        }
    },

    val(gunnode, object, proxy) {
        return new Promise(resolve => {
            checkCollection(gunnode,
                gunnode => resolve(new Collection(gunnode)),                    // Wrap with a collection
                gunnode => {
                gunnode.once((data, key) => resolve(ObjectAccess.observe(data, gunnode, proxy, key)))
                });
            // ToDo: decide if a workcopy should be returned, and if it should be frozen.
            //       but this may be better decided by the code using Matter
            // Hint: Just modifying the returned object does not modify the DB. Must be explicitly set
            // Hint: Calling val() multiple times to a node always delivers the same ( === ) object
                // gunnode => gunnode.once(Object.freeze(Object.assign({}, resolve))));
        });
    },

    full(gunnode, object) {

    },

    on(gunnode, object, proxy, access) {
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
};
