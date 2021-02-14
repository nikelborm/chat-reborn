/* eslint-disable no-fallthrough */
/* eslint-disable default-case */
const express = require("express");
const mongodb = require("mongodb");
const favicon = require("express-favicon");
const cookieParser = require("cookie-parser");
const http = require("http");
const WebSocket = require("ws"); // jshint ignore:line
const path = require("path");
const sha256 = require("sha256");

function createEmptyResponseData() {
    // * Создаёт базовый объект ответа на запрос
    const resdata = {
        report: {
            isError: true,
            info: ""
        },
        reply: {}
    };
    return { resdata, rp: resdata.report };
}

const port = parseInt( process.env.PORT, 10 ) || 3000;
const mongoLink = process.env.MONGODB_URI || "mongodb://Admin:0000@localhost:27017/admin";
const isRegistrationAllowed = !!process.env.IS_REGISTRATION_ALLOWED;
const farmSecrets = JSON.parse(process.env.FARM_SECRETS || `{}`);

let dbClient;
let users = {}; // collection

const app = express();
const mongoClient = new mongodb.MongoClient(mongoLink, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const server = http.createServer(app);
const WSServer = new WebSocket.Server({
    server
});

app.use(cookieParser());
app.use(favicon(__dirname + "/build/favicon.ico"));

app.use(function(request, response, next){
    response.cookie("isRegistrationAllowed", isRegistrationAllowed);
    next();
});
app.use(express.static(path.join(__dirname, "build")));
app.get("/*", (request, response) => {
    response.sendFile(path.join(__dirname, "build", "index.html"));
});


async function loginAsFarm(connection, body) {
    const { secret, name } = body;
    let { resdata, rp } = createEmptyResponseData();

    if ( typeof secret !== "string" || secret.length !== 64 ) {
        rp.info = "Некорректный формат ключа";
    } else if ( typeof name !== "string" || !name.length ) {
        rp.info = "У фермы нет имени";
    } else if ( sha256( secret ) in farmSecrets === false ) {
        rp.info = "Ферма не зарегистрирована";
    } else {
        connection.isAuthAsFarm = true;
        connection.name = name;
        farmSecrets[ sha256( secret ) ] = name;
        rp.isError = false;
        rp.info = "Успешная авторизация";
    }
    return resdata;
};

async function loginAsUser(connection, body) {
    const { email, password } = body;
    let { resdata, rp } = createEmptyResponseData();

    rp.errorField = !email ? "email" : !password ? "password" : "";
    rp.info = !email ? "Вы не ввели почту" : !password ? "Вы не ввели пароль" : "";

    if (rp.info) return resdata;
    try {
        const userSearchResult = await users.findOne({ email });
        if (!userSearchResult) {
            rp.errorField = "email";
            rp.info = "Пользователь с указанной почтой не найден";
            return resdata;
        }
        if (userSearchResult.password !== sha256(password)) {
            rp.errorField = "password";
            rp.info = "Неверный пароль";
            return resdata;
        }

        connection.authInfo = userSearchResult;
        connection.isAuthAsUser = true;
        resdata.reply = {
            fullName: userSearchResult.fullName,
            password,
            email,
        };
        rp.isError = false;
        rp.info = "Успешная авторизация";
    } catch (err) {
        console.log(err);
        rp.info = "Ошибка сервера";
    }
    return resdata;
};

async function registerAsUser( connection, body ) {
    return resdata;
}

function sendMessage( connection, message, nolog ) {
    nolog || console.log("send message to connection: ", message);
    connection.send(JSON.stringify(message));
}
function sendToUsers( message ) {
    //* Отправляет сообщение онлайн пользователям
    for (const client of WSServer.clients) {
        if ( !client.isAuthAsFarm ) {
            sendMessage(client, message);
        }
    }
}
function logProfile( event, WSclient ) {
    console.log(
        event + " : isAuthAsFarm, name, isAuthAsUser, authInfo -> ",
        WSclient.isAuthAsFarm,  WSclient.name,  WSclient.isAuthAsUser,  WSclient.authInfo
    );
}
function handlerSwitcher( type ) {
    switch (type) {
        case "loginAsFarm":
            return loginAsFarm;
        case "loginAsUser":
            return loginAsUser;
        case "registerAsUser":
            return registerAsUser;
        case "set":
        case "execute":
            return authError;
        default:
            return targetError;
    }
}
function prepare( input , connection ) {
    let data;
    let isError = true;
    try {
        data = JSON.parse( input.toString() );
        isError = false;
    } catch ( err ) {
        connection.send();
        sendError( connection, "Ошибка при парсинге запроса:" + input.toString() );
        console.log("err: ", err);
    }
    return isError || data;
}
WSServer.on("connection", (connection, request) => {
    connection.isAlive = true;
    connection.on( "pong", () => {
        connection.isAlive = true;
    } );
    const authorizationStep = async input => {
        const data = prepare( input , connection );
        if( !data ) return;
        sendMessage(connection, {
            class: data.class,
            ...(await handlerSwitcher( data.class )( connection, data )),
        });
        if (connection.isAuthed) {
            connection.removeListener("message", authorizationStep);
            connection.addListener("message", userQueriesHandler);
        }
    }
    const userQueriesHandler = (input) => {
        const data = prepare( input , connection );
        if( !data ) return;
        switch ( data.class ) {
            case "sdfsdfd":
                switch ( data.what ) {
                    case "qwerew":
                        break;
                    case "wertyu":
                        break;
                    default:
                        sendError( connection, `Обработчика what (${ data.what }) для class (${ data.class }) не существует` );
                }
                break;
            case "sdfsdf":
                switch ( data.what ) {
                    case "qwerew":
                        break;
                    case "wertyu":
                        break;
                    default:
                        sendError( connection, `Обработчика what (${ data.what }) для class (${ data.class }) не существует` );
                }
                break;
            case "logout":
                sendMessage( connection, { class: "logout" } );
                if ( connection.isAuthed ) {
                    connection.isAuthed = false;
                    connection.authInfo = null;
                    connection.addListener( "message", authorizationStep );
                    connection.removeListener( "message", userQueriesHandler );
                }
                break;
            default:
                break;
        }
    };
    connection.addListener("message", function (input) {
        try {
            console.log( "Пришло в ws: ", JSON.parse( input.toString() ) );
        } catch ( error ) {
            console.log( "Ошибка при парсинге в JSON, ws on message : ", input );
        }
    } );
    connection.addListener( "message", authorizationStep );
    sendFarmState( connection );
} );
const cleaner = setInterval( () => {
    // Проверка на то, оставлять ли соединение активным
    WSServer.clients.forEach( connection => {
        // Если соединение мертво, завершить
        if (!connection.isAlive) {
            logProfile( "connection - cleaner terminate", connection );
            return connection.terminate();
        }
        // обьявить все соединения мертвыми, а тех кто откликнется на ping, сделать живыми
        connection.isAlive = false;
        connection.ping( null, false );
    } );
}, 10000);

mongoClient.connect( (err, client) => {
    if ( err ) {
        console.log(err);
        return shutdown();
    }

    dbClient = client;
    users = client.db().collection("users");
    server.listen(port, function(){
        console.log("Сервер слушает");
    });
});

function shutdown() {
    let haveErrors = false;
    console.log("Exiting...\n\nClosing WebSocket server...");
    clearInterval(cleaner);
    WSServer.close((err) => {
        if (err) {console.log(err);haveErrors = true;}
        console.log("WebSocket server closed.\n\nClosing MongoDb connection...");
        if (dbClient) {
            dbClient.close(false, (err) => {
                if (err) {console.log(err);haveErrors = true;}
                console.log("MongoDb connection closed.\n\nClosing http server...");
                if (server.listening) {
                    server.close((err) => {
                        if (err) {console.log(err);haveErrors = true;}
                        console.log("Http server closed.\n");
                        process.exit(~~haveErrors);
                    });
                } else {
                    console.log("Http server not started.\n");
                    process.exit(1);
                }
            });
        } else {
            console.log("MongoDb not started.\n\nClosing http server...\nHttp server not started.");
            process.exit(1);
        }
    });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
