/**
 *
 *
 * @author: Bernhard Lukassen
 */


import Action from "./action.mjs";

export default class Get extends Action {

    constructor({
                    path
                } = {}) {
        super();
        Object.assign(this, { path });
    }


    _buildRequest() {
        const req = {};
        req.cmd = 'get';
        req.type = 'map';
        req.path = this.path;

        return req;
    }

}
