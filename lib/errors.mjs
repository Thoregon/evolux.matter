/**
 * defines all errors used in matter
 *
 * @author: blukassen
 */
import { EError } from '/evolux.supervise';

export const ErrNotImplemented          = (msg)         => new EError(`Not implemented: ${msg}`, "MATTER:00001");
export const ErrCollectionExists        = (msg)         => new EError(`Collection exists: ${msg}`, "MATTER:00002");
