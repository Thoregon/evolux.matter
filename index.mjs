/**
 *
 */

export { default as Matter }        from './lib/matter.mjs';

export default {
    install() {
        console.log('** matter install()');
    },

    uninstall() {
        console.log('** matter uninstall()');
    },

    resolve() {
        console.log('** matter resolve()');
    },

    start() {
        console.log('** matter start()');
    },

    stop() {
        console.log('** matter stop()');
    },

    update() {
        console.log('** matter update()');
    }
}
