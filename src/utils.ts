import { User } from './types';

export function extractUsers(collection: Map<string, User>): User[] {
    let users = [];
    for (let user of collection.values()) {
        if (!user.bot) {
            users.push(user);
        }
    }
    return users;
}
