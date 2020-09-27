import { Store } from './node-dep';

const schema = {
    lastOpenedRepo: {
        type: 'string' as const,
    },
};
export const store = new Store({ schema });
