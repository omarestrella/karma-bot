import logger from './logger';
import client from './client';
import { User, Message, MessageMentions } from './types';
import { extractUsers } from './utils';

const EMPTY_BANK = 'EMPTY_BANK';

function getUserData(username: string): Promise<any> {
    return client.storage.get(username).then(data => {
        try {
            data = JSON.parse(data);
        } catch (e) {
            logger.debug('Could not parse sender stored data:', data);
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

        return data;
    });
}

function setUserData(username: string, data: object): Promise<any> {
    return client.storage.set(username, JSON.stringify(data));
}

function increaseKarma(sender: User, receiver: User, amount: number): Promise<any> {
    logger.debug('Trying to add karma from:', sender.username,
        ', to:', receiver.username);

    const storage = client.storage;
    return getUserData(sender.username).then(data => {
        if (data.karmaBank <= 0) {
            throw Error(EMPTY_BANK);
        }

        const sub = Math.min(data.karmaBank, amount);
        data.karmaBank -= sub;
        setUserData(sender.username, data);

        return getUserData(receiver.username);
    }).then(function (data) {
        data.karma += amount;
        data.karmaBank += amount + 1;
        return storage.set(receiver.username, JSON.stringify(data))
            .then(() => data);
    });
}

export function checkForKarma(message) {
    const author = message.author;
    const text = message.content;

    const matcher = /\+([0-5]{1})/;
    const match = text.match(matcher);
    if (!match || match.length <= 1) {
        return;
    }

    const users = extractUsers(message.mentions.users);

    if (users.length === 0) {
        return;
    }

    if (users.length > 1) {
        logger.debug('Cannot add karma more than 1 user at a time');
        return;
    }

    const mentionedUser = users[0];
    if (mentionedUser.id === author.id) {
        logger.debug('Cannot add karma to yourself:', mentionedUser.username);
        return;
    }

    const amount = parseInt(match[1], 10);
    if (isNaN(amount)) {
        logger.debug('Cannot parse karma number:', match[1]);
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
