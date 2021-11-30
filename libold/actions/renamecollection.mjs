/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Action from "./action.mjs";

export default class RenameCollection extends Action {

    constructor({
                    name,           // optional, use oldname if id is unknown
                    to              // mandatory: new name of the collection
                } = {}) {
        super();
        Object.assign(this, { name, to });
    }

}
