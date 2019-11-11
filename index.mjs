/**
 *
 */
import Matter from "./lib/matter.mjs";

const handle = () => universe || global || window;

export { default as Matter }        from './lib/matter.mjs';

export const service = {
    install() {
        console.log('** matter install()');
        handle().matter = new Matter();
    },

    uninstall() {
        console.log('** matter uninstall()');
        delete handle().matter;
    },

    resolve() {
        console.log('** matter resolve()');
        // nothing to do
    },

    start() {
        console.log('** matter start()');
        handle().matter.condense();
    },

    stop() {
        console.log('** matter stop()');
        handle().matter.freeze();
    },

    update() {
        console.log('** matter update()');
        this.stop();
        this.uninstall();
        this.install();
    }
}
