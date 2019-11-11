
/**
 * A facade to the matter in the universe
 *
 * @author: blukassen
 */

export default class Matter {

    constructor({} = {}) {
        Object.assign(this, {});
    }

    /**
     * return the 'id' of the named collection,
     * if it doesn't exist undefined
     * @param name
     * @return {number} id - id of the collection or undefined
     */
    getId(name) {

    }

    /**
     * happens after inflation of the universe
     */
    condense() {

    }

    /**
     * before the universe freezes
     */
    freeze() {

    }

}
