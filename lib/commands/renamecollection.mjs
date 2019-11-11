/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { Command }          from '/evolux.tru4D';

export default class RenameCollection extends Command {

    constructor({
                    id,             // reference the collection with its id, its the safest way
                    oldname,        // optional, use oldname if id is unknown
                    newname         // mandatory: new name of the collection
                } = {}) {
        super();
        Object.assign(this, { id, oldname, newname });
    }

}
