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

import { forEach }      from "/evolux.util";

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

            gunnode.once(async ref => {
                await forEach( Object.keys(ref), async key => {
                    if (key !== '_' && key !== TKEY) {
                        let item = MatterAccess.observe(gunnode.get(key), this);
                        let ctrl = await item[TKEY].val;
                        if (!ctrl || !ctrl.deleted ) {
                            set.push(item);
                        }
                    }
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
