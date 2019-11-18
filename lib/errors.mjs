/**
 * defines all errors used in matter
 *
 * @author: blukassen
 */
import { EError } from '/evolux.supervise';

export const ErrNotImplemented          = (msg)         => new EError(`Not implemented: ${msg}`, "MATTER:00001");

