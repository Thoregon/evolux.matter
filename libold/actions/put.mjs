/**
 *
 *
 * @author: Bernhard Lukassen
 */


import Action from "./action.mjs";

export default class Set extends Action {

    constructor({
                    path,
                    value
                } = {}) {
        super();
        Object.assign(this, { path, value });
    }

    _buildRequest() {
        const req = {};
        req.cmd = 'put';
        req.type = 'map';
        req.path = this.path;
        req.value = this.value;

        return req;
    }
}
