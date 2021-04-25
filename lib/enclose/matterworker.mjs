/**
 * encapsulates the access to the gun DB
 * does encryption/decryption
 * encapsulates keys and key pairs for identities
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

class MatterWorker {

    constructor(port) {
        this.port = port;
    }

    handleMessage(evt) {
        this.port.postMessage('ACK');
    }

}

onconnect = (connectEvent) => {
    let port = connectEvent.ports[0];
    const worker = new MatterWorker(port);

    port.addEventListener('message', (evt) => worker.handleMessage(evt));

    port.start();
}
