/**
 *
 */
import Matter           from "./lib/matter.mjs";
import { myevolux }     from '/evolux.universe';

//**** now define all standard exports

export { default as Matter }        from './lib/matter.mjs';

export { default as CreateCollection }  from './lib/commands/createcollection.mjs';
export { default as DropCollection }    from './lib/commands/dropcollection.mjs';
export { default as RenameCollection }  from './lib/commands/renamecollection.mjs';

export const service = {
    install() {
        console.log('** matter install()');
        myevolux().matter = new Matter();
    },

    uninstall() {
        console.log('** matter uninstall()');
        delete myevolux().matter;
    },

    resolve() {
        console.log('** matter resolve()');
        // nothing to do
    },

    start() {
        console.log('** matter start()');
        myevolux().matter.condense();
    },

    stop() {
        console.log('** matter stop()');
        myevolux().matter.freeze();
    },

    update() {
        console.log('** matter update()');
    }
};
