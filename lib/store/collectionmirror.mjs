/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class CollectionMirror extends Array {

    constructor(base, offn) {
        super();
        this.base = base;
        this.offn = offn;   // this fn disconnects the mirror when invoked
    }

    drop() {
        this.offn();    // disconnect events
    }

}
