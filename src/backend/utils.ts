import { randomUUID } from 'node:crypto';

export const nodeUuid = () => {
    return randomUUID().split('-')[0]
};
