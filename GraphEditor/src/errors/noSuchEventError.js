export class NoSuchEventError extends Error{
    constructor(message){
        super(message);
        this.name = 'NoSuchEventError';
    }
}