/**
 *
 *
 * @author: Bernhard Lukassen
 */

// import matter                   from '/universe/services/matter';
// import layers                   from '/universe/services/layers';
import { ErrNotImplemented }    from '../errors.mjs';

export default class Action {

    constructor({
                    id
                } = {}) {
        Object.assign(this, {id});
    }

    async exec() {
        const ps =      this.matter.persistence;
        const payload = this._buildRequest();
        const meta =    {};

        const res = await this.layers.processSend(ps, payload);
    }

    _buildRequest() {
        throw ErrNotImplemented('Action._buildRequest()');
    }

    get matter() {
        return universe.services.matter;
    }

    get layers() {
        return universe.services.layers;
    }
}
