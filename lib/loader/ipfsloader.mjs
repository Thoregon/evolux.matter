/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import IPFS from '/terra.ipfs/cache/ipfs.min.js';

let ipfs;

const IPFSURL = /^\/ipfs\/.*/;
const IPFSPATH  = /^\/ipfs\/(.+)/;

export default class IPFSLoader {

    async init() {
        // todo [OPEN]: introduce a wait Q to process requests later when IPFS is ready
        console.log("** IPFS Loader: before IPFS start");
        ipfs = await IPFS.create();
        self.ipfs = ipfs;
        console.log("** IPFS Loader: IPFS started");
    }

    connection(evt) {
        var port = evt.ports[0];  // get the port
        port.addEventListener('message', (evt) => this.handleRequest(port, evt));
        port.start();
    }

    handleRequest(port, evt) {
        let data = evt.data;
        let cmd  = data.cmd;
        let url  = data.url;
        console.log("** IPFS Loader: received", cmd);
        switch (cmd) {
            case 'ping':
                port.postMessage({ cmd: 'ping', res: 'pong' });
                break;
            case 'responsibility':
                port.postMessage({ cmd: 'responsibility', url, match: IPFSURL });
                break;
            case 'fetch':
                if (!ipfs) {
                    // 503 Service Unavailable: https://developer.mozilla.org/de/docs/Web/HTTP/Status/503
                    port.postMessage({ cmd: 'fetch', url, error: 503, msg: `not ready` });
                } else {
                    this.fetch(data, port);
                }
                break;
        }
    }

    async fetch(data, port) {
        let url = data.url;
        if (!this.isResponsible(url)) {
            port.postMessage({ cmd: 'fetch', error: 421, msg: `not responsible for '${url}'` });
            return;
        }
        let cid = this.getIpfsPath(url);
        if (!cid) {
            // respond not found
            port.postMessage({ cmd: 'fetch', error: 404, msg: `not found '${url}'` });
            return;
        }
        console.log(`** IPFS Loader: CID '${cid}' -> '${url}'`);
        // intentionally JS-IPFS has no timeouts. if the requestet URL/CID does not exist, this waits forever
        setTimeout(() => {
            port.postMessage({ cmd: 'fetch', error: 404, msg: `not found '${url}'` });
        }, 2000);
        try {
            let source = await ipfs.cat(cid); // returns an AsyncGenerator
            let body   = this.toReadableStream(source); // browser can't handle AsyncGenerator, wrap with ReadableStream
            port.postMessage({ cmd: 'fetch', url, body }, [body]);
        } catch (e) {
            port.postMessage({ cmd: 'fetch', error: 404, msg: `not found '${url}'` });
        }
        /*
                const stat = await ipfs.files.stat(cid);   // todo [OPEN]: support directories and other object types?
                if (stat.type !== 'file') {
                    port.postMessage({ cmd: 'fetch', error: 404, msg: `not found '${url}'` });
                } else {
                    let source = await ipfs.cat(cid); // returns an AsyncGenerator
                    let body = this.toReadableStream(source); // browser can't handle AsyncGenerator, wrap with ReadableStream
                    port.postMessage({ cmd: 'fetch', url, body }, [body]);
                }
        */
    }

    isResponsible(url) {
        return url.match(IPFSURL);
    }

    getIpfsPath(url) {
        let match = url.match(IPFSPATH);
        if (!match || match.length < 2) throw Error('Unrechable url ' + url);
        return match[1];
/*
        if (url.endsWith('/')) url = url.slice(0,-1);   // remove trailing '/'
        let parts = url.split('/');
        if (parts.length === 0) return;
        return parts.pop();
*/
    }

    toReadableStream(source) {
        const iterator = source[Symbol.asyncIterator]()
        return new ReadableStream({
          /**
           * @param {ReadableStreamDefaultController} controller
           */
          async pull(controller) {
              try {
                  const chunk = await iterator.next()
                  if (chunk.done) {
                      controller.close()
                  } else {
                      controller.enqueue(chunk.value)
                  }
              } catch (error) {
                  controller.error(error)
              }
          },
          /**
           * @param {any} reason
           */
          cancel(reason) {
              if (source.return) {
                  source.return(reason)
              }
          }
      });
    }

}

const loader = new IPFSLoader();
// 'onconnect' is a global available handler in SharedWorkerGlobalScope. this can also be written as 'self.onconnect'
onconnect = (evt) => loader.connection(evt);

(async () => {
    // now init IPFS
    await loader.init()
})();

