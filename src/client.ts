import { join } from 'path';
import logger from './logger';
import { Client } from 'yamdbf';
import config from './config';

const client = new Client({
    commandsDir: join(__dirname, 'commands'),
    token: config.token,
    owner: config.owner
});

client.on('clientReady', function () {
    logger.debug('Ready!')
});

export default client;
