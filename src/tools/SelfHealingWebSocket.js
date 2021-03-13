class SelfHealingWebSocket {
    constructor( downCallback, upCallback, allMessagesHandler, ...initializationArgs ) {
        this.initializationArgs = initializationArgs;
        this.connection = null;
        this.downCallback = downCallback;
        this.upCallback = upCallback;
        this.allMessagesHandler = function ( event ) {
            const data = JSON.parse( event.data );
            allMessagesHandler( data );
        };
        this.respawnWebSocket();
    }
    closeEL = event => {
        console.log( "[close] Соединение закрыто. Отчёт: ", event );
        this.downCallback();
        setTimeout( this.respawnWebSocket, 3000 );
        // TODO: Добавить нарастающую задержку перед следующим переподключением
    };
    errorEL = function ( error ) {
        console.error( "[error] Ошибка! Отчёт: " );
        console.log( error );
    };
    messageEL = event => {
        console.log( "[message] Сервер отправил сообщение. Отчёт: ", event );
        try {
            const data = JSON.parse( event.data );
            console.log( "[message] Данные: ", data );
        } catch ( error ) {
            this.errorEL( error );
        }
    };
    openEL = event => {
        console.log( "[open] Соединение установлено" );
        this.upCallback();
    };
    respawnWebSocket = () => {
        this.connection = null;
        // @ts-ignore
        this.connection = new WebSocket( ...this.initializationArgs );
        this.connection.addEventListener( "error", this.errorEL );
        this.connection.addEventListener( "open", this.openEL );
        this.connection.addEventListener( "message", this.messageEL );
        this.connection.addEventListener( "message", this.allMessagesHandler );
        this.connection.addEventListener( "close", this.closeEL );
    };
    isAvailable = () => this.connection?.readyState === 1;
    sendRaw = data => {
        console.log( "[sendRaw] Данные: ", data );
        if( this.isAvailable() ) {
            this.connection.send( data );
        } else {
            alert( "Соединение с сервером не установлено." );
        }
    };
    send = data => this.sendRaw( JSON.stringify( data ) );
}

export default SelfHealingWebSocket;
