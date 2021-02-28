/**
 * An error that indicates that a certain {@link User} could not be found. 
 * For instance, there is no such user with the given {@link User.id} or {@link User.email}.
 */
export class UserNotFound extends Error {};
export default UserNotFound;