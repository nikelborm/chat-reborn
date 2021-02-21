class serverError extends Error {
    constructor(message, errorField) {
        super(message);
        this.name = 'serverError';
        this.errorField = errorField;
    }
}

export default serverError;
