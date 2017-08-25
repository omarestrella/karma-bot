import { join } from 'path';
import { Client } from 'yamdbf';
import { User, Message, MessageMentions } from './types';
import config from './config';
import { extractUsers } from './utils';

const EMPTY_BANK = 'EMPTY_BANK';

const client = new Client({
    commandsDir: join(__dirname, 'commands'),
    token: config.token,
    owner: config.owner
});

client.on('clientReady', function () {
    console.log('Ready!');
});

function increaseKarma(sender: User, receiver: User, amount: number): Promise<any> {
    console.debug('Trying to add karma from:', sender.username,
        ', to:', receiver.username);

    const storage = client.storage;
    return storage.get(sender.username).then(data => {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.debug('Could not parse sender stored data:', data);
        }

        if (!data) {
            data = {
                karmaBank: 10
            };
        } else if (data.karmaBank === null || data.karmaBank === undefined) {
            data.karmaBank = 0;
        }

        if (data.karmaBank <= 0) {
            throw Error(EMPTY_BANK);
        }

        const sub = Math.min(data.karmaBank, amount);
        data.karmaBank -= sub;
        storage.set(sender.username, JSON.stringify(data));

        return storage.get(receiver.username);
    }).then(function (data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.debug('Could not parse receiver stored data:', data);
        }

        if (!data) {
            data = {
                karma: 0,
                karmaBank: 10
            };
        }
        if (data.karma === null || data.karma === undefined) {
            data.karma = 0;
        }
        if (data.karmaBank === null || data.karmaBank === undefined) {
            data.karmaBank = 10;
        }

        data.karma += amount;
        data.karmaBank += amount + 1;
        return storage.set(receiver.username, JSON.stringify(data))
            .then(() => data);
    });
}

client.on('message', function (message: Message) {
    const author = message.author;
    const text = message.content;
    const users = extractUsers(message.mentions.users);

    if (users.length === 0) {
        return;
    }

    if (users.length > 1) {
        console.debug('Cannot add karma more than 1 user at a time');
        return;
    }

    const mentionedUser = users[0];
    if (mentionedUser.id === author.id) {
        console.debug('Cannot add karma to yourself:', mentionedUser.username);
        return;
    }

    const matcher = /\+([0-5]{1})/;
    const match = text.match(matcher);
    if (match && match.length > 1) {
        const amount = parseInt(match[1], 10);
        if (isNaN(amount)) {
            console.debug('Cannot parse karma number:', match[1]);
            return;
        }
        increaseKarma(author, mentionedUser, amount).then(data => {
            message.channel.send(`${mentionedUser.username} now has ${data.karma} karma.`);
        }).catch(function (error) {
            if (error.message === EMPTY_BANK) {
                message.channel.send(`${author.username} has no karma in their bank.`);
            }
        });
    }
});

export default client;

