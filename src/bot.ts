import client from './client';
import { Message } from './types';
import { checkForKarma } from './karma';

client.on('message', function (message: Message) {
    checkForKarma(message);
});

export default client;

