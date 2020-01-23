/**
 *
 */
import Matter                           from "./lib/matter.mjs";
import { myuniverse, tservices }        from '/evolux.universe';

//**** now define all standard exports

// export { default as Matter }            from './lib/matter.mjs';

/*
export { default as CreateCollection }  from './lib/actions/createcollection.mjs';
export { default as DropCollection }    from './lib/actions/dropcollection.mjs';
export { default as RenameCollection }  from './lib/actions/renamecollection.mjs';
*/

export const service = {
    install() {
        myuniverse().logger.debug('** matter install()');
        tservices().matter = new Matter();
    },

    uninstall() {
        myuniverse().logger.debug('** matter uninstall()');
        delete tservices().matter;
    },

    resolve() {
        myuniverse().logger.debug('** matter resolve()');
        // nothing to do
    },

    start() {
        myuniverse().logger.debug('** matter start()');
        tservices().matter.condense();
    },

    stop() {
        myuniverse().logger.debug('** matter stop()');
        tservices().matter.freeze();
    },

    update() {
        myuniverse().logger.debug('** matter update()');
    }
};
