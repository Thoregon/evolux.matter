/**
 *
 */
import Matter                           from './lib/matter.mjs';
import { tservices }                    from '/evolux.universe';

export *                                from './lib/util.mjs';
export *                                from './lib/ubiqutious.mjs';

//**** now define all standard exports

// export { default as Matter }            from './lib/matter.mjs';

/*
export { default as CreateCollection }  from './lib/actions/createcollection.mjs';
export { default as DropCollection }    from './lib/actions/dropcollection.mjs';
export { default as RenameCollection }  from './lib/actions/renamecollection.mjs';
*/

export const service = {
    install() {
        universe.logger.debug('** matter install()');
        tservices().matter = new Matter();
    },

    uninstall() {
        universe.logger.debug('** matter uninstall()');
        delete tservices().matter;
    },

    resolve() {
        universe.logger.debug('** matter resolve()');
        // nothing to do
    },

    async start() {
        universe.logger.debug('** matter start()');
        await tservices().matter.condense();
    },

    async stop() {
        universe.logger.debug('** matter stop()');
        await tservices().matter.freeze();
    },

    update() {
        universe.logger.debug('** matter update()');
    }
};
