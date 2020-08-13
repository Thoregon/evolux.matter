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

import { forEach }              from "/evolux.util";
import { myuniverse, doAsync }  from "/evolux.universe";
import CollectionMirror         from "./collectionmirror.mjs";

const TSET = 't͛set';
const TDEL = 't͛del';


const exists = async (item) => {
    if (!!item) {
        let val = await item.val;
        return (val) ? !val[TDEL] : true;
    }
    return false;
};

export default class Collection {

    constructor(gunnode, data, proxy) {
        // super();
        this.gunnode    = gunnode;
        this.node       = proxy;
        if (data) {};
    }

    get content() {
        return new Promise(resolve => {
            const gunnode  = this.gunnode;
            const set      = [];

            gunnode.once(async ref => {
                await forEach( Object.keys(ref), async key => {
                    if (key !== '_' && key !== TSET /* older version */ && key !== universe.T) {
                        if (!ref[TDEL]) {
                            let item = MatterAccess.observe(gunnode.get(key), this);
                            if (exists(item)) set.push(item);
                        }
                    }
                });
                resolve(set);
            });
        });
    }

/*
    get val() {
        return this.content;
    }
*/

    get mirror() {
        const gunnode  = this.gunnode;
        const set      = new CollectionMirror(this, () => {
            gunnode.off();
        });
        (new Promise(resolve => {
            const idxmap   = {};

            gunnode.map().on((data, key) => {
                if (key !== '_' && key !== TSET /* older version */ && key !== universe.T) {
                    let idx = idxmap[key];

                    if (!idx) {
                        if (!data[TDEL]) {
                            idxmap[key] = set.length;
                            // todo: first get the full structure
                            data._id = key;
                            set.push(data);
                        }
                    } else {
                        if (!data || data[TDEL]) {
                            // the item got deleted, remove it from the mirror
                            delete idxmap[key];
                            set.splice(idx,1);
                        } else {
                            // update properties of the existing object
                            // todo: remove deleted properties
                            Object.assign(set[idx], data);
                        }
                    }
                }
            });

            resolve(set);
        })).then(() => {}).catch(myuniverse().logger.error);

        return set;
    }

    get ownKeys() {
        return new Promise(async (resolve, reject) => {
            let set = await this.content;
            let idx = [];
            for (let i = 0; i < set.length; i++) idx.push(i);
            resolve(idx);
        })
    }

    async clear() {
        const gunnode = this.gunnode;
        let ctrl = {};
        ctrl[TSET] = true;
        gunnode.put(null);
        await doAsync();
        gunnode.put(ctrl);
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
