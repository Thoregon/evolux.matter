/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class CollectionMirror extends Array {

    constructor(source, offn) {
        super();
        this.source = source;
        this.offn   = offn;     // this fn disconnects the mirror when invoked
    }

    drop() {
        this.offn();    // disconnect events, keep current content
    }

}
