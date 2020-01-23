/**
 * Creates a persistent collection
 *  - must have a name, name can have namespaces e.g. 'myctx.orders'
 *  - can have a namespace
 *  - name must be unique
 *  - an id can be passed if known, but be careful because it must be unique (all over the universe!)
 *  - missing may be set to false, error will be thrown if it exists already
 *
 * @author: Bernhard Lukassen
 */

import Action from "./action.mjs";

export default class CreateCollection extends Action {

    constructor({
                    name,               // the name of the collection
                    description,
                    missing = true      // create only if missing, when set to false will throw an error if it exists
                } = {}) {
        super();
        Object.assign(this, { name, description, missing });
    }


    _buildRequest() {
        const req = {};
        req.cmd = 'create';
        req.missing = this.missing;
        req.type = 'collection';
        req.name = this.name;

        return req;
    }
}
