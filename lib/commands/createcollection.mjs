/**
 * Creates a persistent collection
 *  - must have a name, name can have namespaces e.g. 'myctx.orders'
 *  - name must be unique
 *  - an id can be passed if known, but be careful because it must be unique (all over the universe!)
 *  - missing may be set to false, error will be thrown if it exists already
 *
 * @author: Bernhard Lukassen
 */

export default class CreateCollection {

    constructor({
                    name,               // the name of the collection
                    description,
                    missing = true      // create only if missing, when set to false will throw an error if it exists
                } = {}) {
        Object.assign(this, { name, description, missing });
    }

}
