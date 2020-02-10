import MatterAccess from "./matteraccess.mjs";

/**
 * A facade to query and mirror collections of objects
 * provides a query interface
 *
 * @author: Bernhard Lukassen
 *
 * todo:
 *  - make iterable
 *  -
 */

const TKEY = 't͛';

export default class Collection {

    constructor(gunnode, proxy) {
        // super();
        this.gunnode    = gunnode;
        this.node       = proxy;
    }

    get content() {
        return new Promise(resolve => {
            const gunnode  = this.gunnode;
            const set      = [];

            gunnode.once(ref => {
                Object.keys(ref).forEach(key => {
                    if (key !== '_' && key !== TKEY) set.push(MatterAccess.observe(gunnode.get(key), this));
                });
                resolve(set);
            });
        });
    }

    get mirror() {

    }

    on(cb) {
        this.gunnode.on((data, key) => {
            cb(data, key, this, this.node);
        })
    }


/*
    [Symbol.iterator]() {

    }

    [Symbol.asyncIterator]() {

    }
*/
}
