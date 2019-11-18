/**
 *
 */
import Matter from "./lib/matter.mjs";

const space = () => {
    // this is a cryptic way to get the 'global' object or 'window' in strict mode. direct code references will throw an error
    const space = (1,eval)("this");
    return space.universe ? space.universe : space;
};

//**** now define all standard exports

export { default as Matter }        from './lib/matter.mjs';

export const service = {
    install() {
        console.log('** matter install()');
        space().matter = new Matter();
    },

    uninstall() {
        console.log('** matter uninstall()');
        delete space().matter;
    },

    resolve() {
        console.log('** matter resolve()');
        // nothing to do
    },

    start() {
        console.log('** matter start()');
        space().matter.condense();
    },

    stop() {
        console.log('** matter stop()');
        space().matter.freeze();
    },

    update() {
        console.log('** matter update()');
        this.stop();
        this.uninstall();
        this.install();
    }
};
