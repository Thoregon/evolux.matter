/**
 * Drops a collection by name or id
 * Because of the nature of the system this can be undone
 * If both, an id an a name is passed, the id will be used, name will not be searched even if the id doesn't exist
 *
 * @author: Bernhard Lukassen
 */

import Action from "./action.mjs";

export default class DropCollection extends Action {

    constructor({
                    id,
                    name
                } = {}) {
        super();
        Object.assign(this, { id, name });
    }

}
