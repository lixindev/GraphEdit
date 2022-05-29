export class NoSuchCommandError extends Error{
    constructor(message){
        super(message);
        this.name = 'NoSuchCommandError';
    }
}