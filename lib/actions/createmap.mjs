/**
 * Creates a persistent map
 *  - must have a name, name can have namespaces e.g. 'myctx.orders'
 *  - can have a namespace
 *  - name must be unique
 *  - items can be
 *  - missing may be set to false, error will be thrown if it exists already
 *
 * @author: Bernhard Lukassen
 */

import Action from "./action.mjs";

export default class CreateMap extends Action {

    constructor({
                    name,               // the name of the collection
                    description,
                    missing = true      // create only if missing, when set to false will throw an error if it exists
                } = {}) {
        super();
        Object.assign(this, { name, description, missing });
    }

}
