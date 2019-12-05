/**
 * A facade to query and mirror collections of objects
 * provides a query interface
 *
 * @author: Bernhard Lukassen
 */

export default class Collection {

    constructor({
                    id
                } = {}) {
        Object.assign(this, {id});
    }


}
