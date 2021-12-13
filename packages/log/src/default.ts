import { Namespace } from './namespace';
import { createLogger } from './logger';

const defaultLogger = createLogger(Namespace.LOG);

export const debug = defaultLogger.debug;
export const info = defaultLogger.info;
export const warn = defaultLogger.warn;
export const error = defaultLogger.error;
export const success = defaultLogger.success;
