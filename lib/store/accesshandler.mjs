/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class AccessHandler {

    constructor(target, parent) {
        this.target = target;
        this.parent = parent && parent.$access ? parent.$access.target : parent ;
    }


    static observe(target, parent) {
        // can observe only Objects with a Proxy
        if (target.$access) return target;
        if (typeof target === 'object') {
            let handler = new this(target, parent);
            let revocable = Proxy.revocable(target, handler);
            handler.revoke = revocable.revoke;
            return revocable.proxy;
        }
        return target;
    }

    has(target, key) {
        return Reflect.has(target, key); // key in target;
    }

    get(target, prop, receiver) {
        if (prop === '$access') {
            return this;
        } else {
            // todo: wrap fn's with AccessHandler
            const value = Reflect.get(target, prop, receiver); // target[prop];
            return value;
        }
    }

    set(target, prop, value, receiver) {
        if (!value.$access) {
            value = AccessHandler.observe(value, this);
        }
        // target[prop] = value;
        return Reflect.set(target, prop, value, receiver); // true;
    }

    deleteProperty(target, prop) {
        if (prop in target) {
            Reflect.deleteProperty(target, prop);
        }
    }

    apply(target, thisArg, args) {
        return Reflect.apply(target, thisArg, args);
    }

    /*

    construct(target, args) {
        return Reflect.construct(target, args); // new target(...args);
    }

    defineProperty(target, key, descriptor) {
        target[key] = undefined;
        return true;
    }

    getOwnPropertyDescriptor(target, prop) {
        return { configurable: true, enumerable: true, writable: true, value: target[prop] };
    }

    getPrototypeOf(target) {
        return Object.getPrototypeOf(target);
    }

    isExtensible(target) {
        return Reflect.isExtensible(target);
    }

    preventExtensions(target) {
        target.canEvolve = false;
        return Reflect.preventExtensions(target);
    }

    setPrototypeOf(tagrget, targetProto) {
        return false;
    }

    ownKeys (target) {
        return Reflect.ownKeys(target)
    }
    */
}
