/**
 *
 *
 * @author: Bernhard Lukassen
 */


import Action from "./action.mjs";

export default class Put extends Action {

    constructor({
                    path,
                    content
                } = {}) {
        super();
        Object.assign(this, { path, content });
    }

}
