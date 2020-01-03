/**
 *
 */
import Matter                           from "./lib/matter.mjs";
import { myuniverse, myevolux }         from '/evolux.universe';

//**** now define all standard exports

export { default as Matter }            from './lib/matter.mjs';

export { default as CreateCollection }  from './lib/commands/createcollection.mjs';
export { default as DropCollection }    from './lib/commands/dropcollection.mjs';
export { default as RenameCollection }  from './lib/commands/renamecollection.mjs';

export const service = {
    install() {
        myuniverse().logger.debug('** matter install()');
        myevolux().matter = new Matter();
    },

    uninstall() {
        myuniverse().logger.debug('** matter uninstall()');
        delete myevolux().matter;
    },

    resolve() {
        myuniverse().logger.debug('** matter resolve()');
        // nothing to do
    },

    start() {
        myuniverse().logger.debug('** matter start()');
        myevolux().matter.condense();
    },

    stop() {
        myuniverse().logger.debug('** matter stop()');
        myevolux().matter.freeze();
    },

    update() {
        myuniverse().logger.debug('** matter update()');
    }
};
