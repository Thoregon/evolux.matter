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

export default class Collection extends Array {

    constructor(gunnode) {
        super();
        this.gunnode    = gunnode;
    }

    get val() {
        return new Promise(resolve => {
            const gunnode  = this.gunnode;
            const set       = this.set;

            gunnode.once(ref => {
                Object.keys(ref).forEach(key => {
                    if (key !== '_' && key !== TKEY) this.push(MatterAccess.observe(gunnode.get(key), this));
                });
                resolve(set);
            });
        });
    }

    on(cb) {

    }
/*
    [Symbol.iterator]() {

    }

    [Symbol.asyncIterator]() {

    }
*/
}
