/* eslint-disable default-case */
const { validate2lvl } = require("./src/tools/validate");
const { createHardAuthInfo, createLiteAuthInfo } = require("./src/tools/compressAuthInfo");
const { createEmptyResponseData: createEmptyMessageData } = require("./src/tools/createEmptyResponseData");
const { randomString } = require("./src/tools/randomString");
const { hasIntersections } = require("./src/tools/intersection");
const { validateRegistrationPayload, validateFinishRegistrationPayload, validateLoginPayload, isCorrect } = require("./src/tools/validators");

const express = require("express");
const favicon = require("express-favicon");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const path = require("path");
const session = require("express-session");
const sha256 = require("sha256");
const bodyParser = require("body-parser");
const cookie = require("cookie");
const cookieParser = require("cookie-parser");
const RedisStorage = require("connect-redis")(session);
const redis = require("redis");
const http = require("http");
const WebSocket = require("ws"); // jshint ignore:line
const sendmail = require("sendmail")({ silent: true });
const querystring = require("querystring");


function sendItToUsersWhoKnowsMe({ rooms, directChats }, message) {
    // * Отправляет сообщение всем пользователям, кто сейчас подключён к вебсокету и кому это сообщение играет хоть какое либо значение,
    // * например онлайн статусы идут тем кто в моих прямых чатах или состоит в одной из моих групп, ведь я потенциально могу его увидеть
    WSServer.clients.forEach(function (client) {
        if ( directChats.has(client.authInfo.id) || hasIntersections(client.authInfo.rooms, rooms)) {
            client.send(JSON.stringify(message));
        }
    });
}
function sendItToUsersInRoom(roomID, message) {
    // * Отправляет сообщение всем участникам комнаты
    WSServer.clients.forEach(function (client) {
        if ( client.authInfo.rooms.has(roomID)) {
            client.send(JSON.stringify(message));
            return;
        }
    });
}
function sendItToSpecificUser(userID, message) {
    // * Отправляет сообщение конкретному пользователю
    for (const client of WSServer.clients) {
        if ( client.authInfo.id === userID ) {
            client.send(JSON.stringify(message));
            return;
        }
    }
}
function notifyFamiliarUsersAboutStatusChangingOfTargetUser( authInfo, newstatus ) {
    sendItToUsersWhoKnowsMe(authInfo, {handlerType: newstatus,  userID: authInfo._id });
}

function setUserStatusAsOffline( authInfo ) {
    const userID = authInfo._id;
    if ( activeUsersCounter[ userID ] === 1 ) {
        delete activeUsersCounter[ userID ];
        notifyFamiliarUsersAboutStatusChangingOfTargetUser( authInfo, "offline" );
    } else {
        activeUsersCounter[ userID ]--;
    }
}

function setUserStatusAsOnline( authInfo ) {
    const userID = authInfo._id;
    if ( !activeUsersCounter[ userID ] ) {
        activeUsersCounter[ userID ] = 1;
        notifyFamiliarUsersAboutStatusChangingOfTargetUser( authInfo, "online" );
    } else {
        activeUsersCounter[ userID ]++;
    }
}

function shutdown() {
    let haveErrors = false;
    console.log("Exiting...\n\nClosing WebSocket server...");
    clearInterval(cleaner);
    WSServer.close((err) => {
        if (err) {console.log(err);haveErrors = true;}
        console.log("WebSocket server closed.\n\nClosing Redis connection...");
        redisClient.quit((err) => {
            if (err) {console.log(err);haveErrors = true;}
            console.log('Redis connection closed.\n\nClosing MongoDb connection...');
            if (dbClient) {
                dbClient.close(false, (err) => {
                    if (err) {console.log(err);haveErrors = true;}
                    console.log('MongoDb connection closed.\n\nClosing http server...');
                    if (server.listening) {
                        server.close((err) => {
                            if (err) {console.log(err);haveErrors = true;}
                            console.log('Http server closed.\n');
                            process.exit(~~haveErrors);
                        });
                    } else {
                        console.log('Http server not started.\n');
                        process.exit(1);
                    }
                });
            } else {
                console.log('MongoDb not started.\n\nClosing http server...\nHttp server not started.');
                process.exit(1);
            }
        });
    });
}
function deleteEntityById(id) {
    entities.deleteOne({ _id : new ObjectId(id)})
    .catch((err) => {
        console.log(err);
    }).then((result) => {
        console.log(result);
    });
}
const sendConfirmationLetter = ( { email, _id, secureToken } ) => new Promise( ( resolve, reject ) => {
    // TODO: Настроить почтовый сервер, DNS, MX записи, а также SPF, DKIM, DMARC
    // И всё ради того, чтобы гугл блять не ругался и принимал почту
    // Тут иногда появляется фантомный баг и какой-нибудь символ (зачастую точка) исчезает из адреса в html
    sendmail(
        {
            from: "robot <noreply@nikel.herokuapp.com>",
            to: email,
            subject: "Завершение регистрации",
            html: `<h2><a href="https://nikel.herokuapp.com/finishRegistration?${ querystring.stringify({id : _id.toString(), secureToken})}">Чтобы завершить регистрацию, перейдите по ссылке</a></h2> `
        },
        err => err ? reject( err ) : resolve()
    );
} );

const port = process.env.PORT || 3000;
const mongoLink = process.env.MONGODB_URI || "mongodb://myUserAdmin:0000@localhost:27017/admin";
const redisLink = process.env.REDIS_URL || "redis://admin:foobared@127.0.0.1:6379";
const secretKey = process.env.SECRET || "wHaTeVeR123";
// const mailLogin = process.env.GMAIL_LOGIN || "wHaTeVeR123";
// const mailPassword = process.env.GMAIL_PASS || "wHaTeVeR123";

let dbClient;
let entities;
let messages;
let activeUsersCounter = {};

const app = express();
const redisClient = redis.createClient(redisLink);
const store = new RedisStorage({
    client: redisClient
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// TODO: Проверять не слишком ли большие данные, чтобы долго их не обрабатывать
app.use(bodyParser.text());
app.use(session({
    store,
    secret: secretKey,
    resave: false,
    rolling: true,
    unset: "destroy",
    saveUninitialized: false
}));
app.use(cookieParser(secretKey));
app.use(favicon(__dirname + "/build/favicon.ico"));

// TODO: Сделать проверку есть ли пользователь (хранящийся в сессии) в базе в этих пунктах (на случай если была авторизация на нескольких устройствах, а акк удалён из базы):
//   /
//   /chat
//   /loadChatHistory
//   /loadListOfUsersInChat
function sendMessage( connection, message, nolog ) {
    nolog || console.log("send message to connection: ", message);
    connection.send(JSON.stringify(message));
}
app.use(express.static(path.join(__dirname, "build")));
app.get("/*", (request, response) => {
    response.sendFile(path.join(__dirname, "build", "index.html"));
});
// function deleteAccount( connection, body ) {
//     deleteEntityById( request.session.authInfo._id );
// }
// app.get("/deleteAccount", function(request, response) {
//     // TODO: По такому же принципу построить удаление комнат
//     deleteEntityById(request.session.authInfo._id);
//     logout(request, response);
// });
// TODO: Добавить шифрование на все поля в базе данных проекта
// function logoutUser( connection ) {
//     setUserStatusAsOffline( connection.authInfo );
//     connection.authInfo = null;
//     connection.addListener( "message", authorizationStep );
//     connection.removeListener( "message", userQueriesHandler );
// }
// async function setMeAsLoggedOut( connection, body ) {
//     let response = createEmptyMessageData( "respondFor", "setMeAsLoggedOut" );
//     logoutUser( connection );
//     response.report.isOK = true;
//     sendMessage( connection, response );
// }

function getSuccessLoginPayload( authInfo ) {
    return {
        nickName: authInfo.nickName,
        fullName: authInfo.fullName,
        statusText: authInfo.statusText,
        avatarLink: authInfo.avatarLink,
        _id: authInfo._id.toString(),
    }
}

async function login( connection, body ) {
    const { nickNameOrEmail, password } = body.payload;

    let response = createEmptyMessageData( "respondFor", "authlogin", { withReport: true, withPayload: true, withPointer: true } );
    response.report = {
        ...response.report,
        ...validateLoginPayload( body.payload )
    };

    if ( response.report.info ) return response;
    try {
        const foundUser = await entities.findOne({ isRoom: false, $or: [{ nickName: nickNameOrEmail }, { email: nickNameOrEmail }]});
        if ( !foundUser ) {
            response.report.pointerForDisplaing = "nickNameOrEmail";
            response.report.info = "Пользователь с указанными логином или почтой не найден";
        } else if ( foundUser.password !== sha256( password ) ) {
            response.report.pointerForDisplaing = "passwordLogin";
            response.report.info = "Неверный пароль";
        } else if ( !foundUser.emailConfirmed ) {
            response.report.pointerForDisplaing = "nickNameOrEmail";
            response.report.info = "Этот аккаунт не верифицирован. Перейдите по ссылке из нашего письма. Если письма нет даже в папке спам, обратитесь к администратору.";
        }
        if ( response.report.info ) return response;

        connection.authInfo = foundUser;
        // TODO: Проверить надо ли у _id вызывать .toString() или и без него все прекрасно работает, просто раньше при помещении в сессию этого значения, оно автоматически превращалось в строку, но нут возможно это не прокатит, ведь всё в js крутится
        response.payload = getSuccessLoginPayload( foundUser );
        response.report.isOK = true;
    } catch ( error ) {
        console.log( "error: ", error );
        response.report.info = "Произошла неизвестная ошибка на сервере. Сообщите администратору и повторите попытку войти в аккаунт позже.";
    }
    return response;
}

// TODO: Поправить всё, что связано с аватаром пользователя, так как обновилось в базе данных
async function register( connection, body ) {
    const { nickName, password, fullName, email } = body.payload;

    let response = createEmptyMessageData( "respondFor", "authregister", { withReport: true, withPointer: true } );
    response.report = { ...response.report, ...validateRegistrationPayload( body.payload ) };

    if ( response.report.info ) return response;
    const userProfile = {
        isRoom: false,
        nickName,
        password: sha256( password ),
        email,
        fullName,
        regDate: new Date(),
        statusText: "В сети", // TODO: Подумать над этим
        avatarStyle: { // TODO: Добавить возможность выбора аватара
            avatarLink: "",
            backgroundSize: "",
            backgroundPosition: ""
        },
        rooms: [],
        directChats: [],
        muted: [],
        // TODO: Использовать более безопасный вариант генерации случайности
        secureToken: randomString(32),
        emailConfirmed: false
    };
    try {
        const userWithSameNickOrEmail = await entities.findOne({ isRoom: false, $or: [{ nickName }, { email }] });
        if ( !userWithSameNickOrEmail ) {
            const insertationResult = await entities.insertOne( userProfile );
            await sendConfirmationLetter( insertationResult.ops[ 0 ] );
            response.report.isOK = true;
        }
        else if ( userWithSameNickOrEmail.nickName === nickName ) {
            response.report.pointerForDisplaing = "nickName";
            response.report.info = "Данный никнейм занят. Если вы владелец аккаунта, попробуйте восстановить пароль или связаться с администратором.";
        }
        else if ( userWithSameNickOrEmail.emailConfirmed ) { // userWithSameNickOrEmail.email === email, потому что иначе ничего не остаётся
            response.report.pointerForDisplaing = "email";
            response.report.info = "На эту почту уже создан аккаунт. Если вы владелец, попробуйте восстановить пароль или связаться с администратором.";
        }
        else { // userWithSameNickOrEmail.email === email && !userWithSameNickOrEmail.emailConfirmed, потому что иначе ничего не остаётся
            response.report.pointerForDisplaing = "email";
            const replaceResult = await entities.findOneAndReplace(
                { _id: userWithSameNickOrEmail._id },
                userProfile,
                { returnOriginal: false }
            );
            await sendConfirmationLetter( replaceResult.value );
            response.report.info = "Аккаунт с указанной почтой уже создан, но не был верифицирован. Мы отправили письмо повторно и установили отправленные сейчас данные как наиболее актуальные. Если вы не получите письмо, проверьте спам или укажите почту другого сервиса.";
        }
        // TODO: подумать как сделать, чтобы сообщение об ошибке отправки не затирало сообщения о неподтверждённом аккаунте
    } catch ( error ) {
        console.log( "error: ", error );
        response.report.info = "Произошла неизвестная ошибка на сервере. Сообщите администратору и повторите попытку создать аккаунт позже.";
    }
    return response;
}

async function confirmEmail( connection, body ) {
    const { secureToken, id } = body.payload;

    let response = createEmptyMessageData( "respondFor", "authconfirmEmail", { withReport: true, withPayload: true } );
    response.report = {
        ...response.report,
        ...validateFinishRegistrationPayload( body.payload )
    };

    if ( response.report.info ) return response;

    try {
        const _id = new ObjectId( id );
        const updatingResult = entities.findOneAndUpdate(
            { isRoom: false, _id, secureToken },
            {
                // $addToSet: { rooms: тут можно добавить что-нибудь к любому массиву },
                $set: {
                    // TODO: Использовать более безопасный вариант генерации случайности
                    secureToken : randomString( 32 ),
                    emailConfirmed: true
                }
            },
            { returnOriginal: false }
        );
        if ( !updatingResult ) { // TODO: Эта фигня расчитана на то, что если документ не найден то ничего обновляться не будет и вернётся что-то типа null, но это утверждение не проверялось и надо проверить так ли это, а то мало ли, вдруг оно ошибку кинет
            response.report.info = "Данное сочетание ключа и айди больше не работает."
            return response;
        }
        connection.authInfo = updatingResult;
        // TODO: Проверить надо ли у _id вызывать .toString() или и без него все прекрасно работает, просто раньше при помещении в сессию этого значения, оно автоматически превращалось в строку, но нут возможно это не прокатит, ведь всё в js крутится
        response.payload = getSuccessLoginPayload( updatingResult );
    } catch ( error ) {
        console.log( "error: ", error );
        response.report.info = "Произошла неизвестная ошибка на сервере. Сообщите администратору и повторите попытку верифицировать аккаунт позже.";
    }
    return response;
}

async function unexpectedActionHandler( connection, body ) {
    let response = createEmptyMessageData( "respondFor", body.action.type + body.action.what, { withReport: true } );
    response.report.info = `Вы запросили несуществующий обработчик для ${ body.action.what } типа ${ body.action.type }`;
    return response;
}
// TODO: Добавить восстановление аккаунта по почте
// TODO: Добавить функцию добавления комнаты или юзера в чёрный список по id-шнику естественно
const server = http.createServer(app);
const WSServer = new WebSocket.Server( {
    server
} );
function beforeAuthorizationHandlersSwitcher( what ) {
    // type: auth
    const variants = {
        login,
        register,
        confirmEmail,
        // requestPasswordRestoring,
        // confirmPasswordRestoring,
    };
    return what in variants ? variants[ what ] : unexpectedActionHandler;
}
function afterAuthorizationHandlersSwitcher( type ) {
    // TODO: Такая же хуйня как и выше
}
function prepare( input ) {
    let body;
    let info;
    let isOK;
    try {
        body = JSON.parse( input.toString() );
        if (
            typeof body === "object" &&
            "action" in body &&
            typeof body.action === "object" &&
            "type" in body.action &&
            isCorrect( body.action.type ) &&
            "what" in body.action &&
            isCorrect( body.action.what )
        ) {
            isOK = true;
        } else {
            info = "Некорректная структура запроса: " + input.toString();
        }
    } catch ( error ) {
        info = "Ошибка при парсинге JSON запроса: " + input.toString();
        console.log( "error: ", error );
    }
    return { isOK, info, body };
}
// TODO: В самом начале добавить валидатор на соответствие сообщения общепринятому в проекте формату
WSServer.on("connection", (connection, request) => {
    connection.isAlive = true;
    connection.on( "pong", () => {
        connection.isAlive = true;
    } );
    const authorizationStep = async (input) => {
        const data = prepare( input , connection );
        if( !data ) return;
        if ( data.class === "logout" ) return;
        if(!["loginAsFarm","loginAsUser","registerAsUser","set","execute"].includes( data.class )) return;
        sendMessage(connection, {
            class: data.class,
            ...(await handlerSwitcher( data.class )( connection, data )),
        });
        if (connection.isAuthAsFarm) {
            // if ( !farmConnection ) farmConnection = connection;
            // Потому что если новое соединение с фермой установилось до того, как старое порвалось, надо установить новое
            farmConnection = connection;
            // TODO: connection.addEventListener("close")
            // Потому что cleaner обрабатывает только случайные обрывы связи
            newFarmStateNotifier();
            connection.removeListener("message", authorizationStep);
            connection.addListener("message", farmQueriesHandler);
            connection.addListener("message", logout);
        }
        if (connection.isAuthAsUser) {
            connection.removeListener("message", authorizationStep);
            connection.addListener("message", userQueriesHandler);
            connection.addListener("message", logout);
        }
    }
    const publicQueriesHandler = (input) => {
        // TODO: Подумать над обработкой и защитой от ошибок в JSON.parse
        const data = prepare( input , connection );
        if( !data ) return;
        //* Пользовательские запросы которые можно обработать и без авторизации
        if ( data.class !== "get" ) return;
        switch ( data.what ) {
            case "activitySyncPackage":
                sendActivityPackage( connection );
                break;
            case "configPackage":
                sendConfigPackage( connection );
                break;
            case "recordsPackage":
                sendRecordsPackage( connection );
                break;
            case "exactSensorRecordsPackage":
                sendExactSensorRecordsPackage( connection, data.sensor );
                break;
            case "newestRecordsPackage":
                sendNewestRecordsPackage( connection );
                break;
            default:
                sendError(connection, `Обработчика what (${data.what}) для class (${data.class}) не существует`);
        }
    };
    const farmQueriesHandler = (input) => {
        const data = prepare( input , connection );
        if( !data ) return;
        switch ( data.class ) {
            case "event":
                // просто переслать всем онлайн пользователям
                sendToUsers( data );
                cachedProcessStates[ data.process ] = data.isActive;
                break;
            case "warning":
                // переслать всем онлайн пользователям и уведомить их ещё как-то
                // по почте, через пуш уведомления, в слак, в вк, в телегу, в дискорд
                break; // records по действиям похожи
            case "records":
                // переслать всем онлайн пользователям и сохранить в бд с датой
                const log = {
                    sensor: data.sensor,
                    value: data.value,
                    date: new Date()
                };
                sendToUsers( { ...log, class: "records" } );
                sensorsLogs.insertOne( log );
                break;
            case "activitySyncPackage":
                cachedProcessStates = data.package;
                sendToUsers({ class: "activitySyncPackage", package: cachedProcessStates });
                break;
            case "configPackage":
                cachedConfig = data.package;
                sendToUsers({ class: "configPackage", package: cachedConfig });
                break;
            default:
                break;
        }
    };
    const userQueriesHandler = (input) => {
        const data = prepare( input , connection );
        if( !data ) return;
        switch ( data.class ) {
            case "set":
                switch ( data.what ) {
                    case "timings":
                        // А, если нет соединения, то добавить в очередь отложенных запросов к ферме
                        sendToUsers( {
                            class : "timings",
                            process: data.process,
                            timings: data.timings
                        } );
                        !!farmConnection && sendMessage( farmConnection, data );
                        for ( const proc of cachedConfig.processes ) {
                            if ( proc.long === data.process ) {
                                proc.timings = data.timings;
                                break;
                            }
                        }
                        break;
                    case "criticalBorders":
                        sendToUsers( {
                            class : "criticalBorders",
                            sensor: data.sensor,
                            criticalBorders: data.criticalBorders
                        } );
                        !!farmConnection && sendMessage( farmConnection, data );
                        for ( const sensor of cachedConfig.sensors ) {
                            if ( sensor.long === data.sensor ) {
                                sensor.criticalBorders = data.criticalBorders;
                                break;
                            }
                        }
                        break;
                    case "config":
                        sendToUsers( data );
                        !!farmConnection && sendMessage( farmConnection, data );
                        cachedConfig = data.config;
                        break;
                    default:
                        sendError(connection, `Обработчика what (${data.what}) для class (${data.class}) не существует`);
                }
                break;
            case "execute":
                switch ( data.what ) {
                    case "bashCommand":
                        sendMessage( farmConnection, {
                            class: "execute",
                            what: "bashCommand",
                            bashCommand: data.command,
                            replyTo: connection.authInfo.email
                        } );
                        break;
                    case "update":
                    case "shutDownFarm":
                    case "updateArduino":
                        farmConnection.send( input );
                        break;
                    default:
                        sendError(connection, `Обработчика what (${data.what}) для class (${data.class}) не существует`);
                }
                break;
            default:
                break;
        }
    };
    const logout = (input) => {
        const data = prepare( input , connection );
        if( !data ) return;
        if ( data.class !== "logout" ) return;
        if ( connection.isAuthAsFarm ) {
            farmConnection = null;
            newFarmStateNotifier();
            connection.isAuthAsFarm = false;
            connection.name = "";
            connection.addListener( "message", authorizationStep );
            connection.removeListener( "message", farmQueriesHandler );
        }
        if ( connection.isAuthAsUser ) {
            connection.isAuthAsUser = false;
            connection.authInfo = null;
            connection.addListener( "message", authorizationStep );
            connection.removeListener( "message", userQueriesHandler );
        }
        sendMessage( connection, { class: "logout" } );
    };
    connection.addListener("message", function (input) {
        try {
            console.log("Пришло в ws: ", JSON.parse( input.toString() ));
        } catch (error) {
            console.log("Ошибка при парсинге в JSON, ws on message : ", input);
        }
    });
    connection.addListener("message", authorizationStep);
    connection.addListener("message", publicQueriesHandler);
    sendFarmState( connection );
});

WSServer.on("connection", (connection, request) => {
    connection.isAlive = true;
    connection.on("pong", () => {
        connection.isAlive = true;
    });
    connection.on( "close", () => {
        connection.authInfo && setUserStatusAsOffline( connection.authInfo );
    } );
    connection.on("message", async (input) => {
        const { authInfo } = connection;
        // TODO: Проверять не слишком ли большие данные, чтобы долго их не обрабатывать
        const { handlerType, room, text, to } = JSON.parse(input.toString());
        console.log('Пришло в ws: ', JSON.parse(input.toString()));
        let { resdata, rp } = validate2lvl(handlerType === "message" ? { to, text } : { room }, authInfo);
        resdata.handlerType = handlerType;

        if (rp.info) return connection.send(JSON.stringify(resdata));

        switch (handlerType) {
            case "message":
                let message = {
                    to,
                    authorID: authInfo.nickName,
                    text,
                    time: new Date()
                };
                try {
                    const result = await entities.findOne({ _id: new ObjectId(to)});
                    if (!result) {
                        throw new Error("Чат не найден.");
                    }
                    message.isDirect = !result.isRoom;
                    if (result.isRoom && !authInfo.rooms.has(to)) {
                        throw new Error("У вас нет прав для отправки сообщения в эту комнату.");
                    }
                    if (!result.isRoom && !authInfo.directChats.has(to)) {
                        // TODO: Вызвать функцию, которая добавит id-шники обоим собеседникам в свои directChats в БД, в cессию, в connection и отправит уведомления этим двум пользователям
                    }

                    const msgID = (await messages.insertOne(message)).ops[0]._id;
                    rp.info = "Сообщение успешно отправлено";
                    rp.isError = false;
                    resdata.reply = { msgID };

                    WSServer.clients.forEach(function (client) {
                        if (client.authInfo.rooms.has(room)) {
                            client.send(JSON.stringify({handlerType: "message", msgID, ...message}));
                        }
                    });
                } catch (err) {
                    console.log(err);
                    rp.info = err.message;
                }
                connection.send(JSON.stringify(resdata));
                break;
            case "loadSpecificChatHistory":
                messages.find({ room }, { projection: {room: 0} })
                .toArray((err, results) => {
                    if (err) {
                        rp.info = err.message;
                        console.log(err);
                    } else {
                        resdata.reply = { room, results };
                        rp.isError = false;
                        rp.info = "Данные успешно загружены";
                    }
                    connection.send(JSON.stringify(resdata));
                });
                break;
            case "loadListOfUsersInChat":
                let results = {};
                entities.find({rooms: room}, {projection: { nickName:1, fullName:1 }})
                .forEach(
                    (doc) => {
                        const { user, id } = createLiteAuthInfo(doc, activeUsersCounter);
                        results[id] = user;
                    },
                    function (err) {
                        if (err) {
                            console.log(err);
                            rp.info = err;
                        } else {
                            resdata.reply = { room, results };
                            rp.isError = false;
                            rp.info = "Данные успешно загружены";
                        }
                        connection.send(JSON.stringify(resdata));
                    }
                );
                break;
            case "canIjoinTheRoom":
                // TODO: Добавить оповещение всех онлайновых, кто в одном чате о присоединении новичка
                // TODO: Сделать защиту, чтобы имя комнаты не было каким-нибудь ебанутым типа constructor, __proto__ или this

                // notifyAboutNewUserInRoom(authInfo, roomID);
                // const { user, id } = createHardAuthInfo(newAuthInfo, activeUsersCounter);
                // WSServer.clients.forEach(function (client) {
                //     if (client.authInfo.rooms.has(room)) {
                //         client.send(JSON.stringify({handlerType: "newUserInRoom", userID: id, user, roomID: }));
                //     }
                // });
                break;
            case "loadFilteredAuthInfoData":
                // TODO: обязательно проверять а знаком ли этот пользователь со вторым (хотя над этим ещё подумать надо)
                // Здесь загружается полная инфа о пользователе
                resdata.reply = createHardAuthInfo(authInfo, activeUsersCounter);
                connection.send(JSON.stringify(resdata));
                break;
            case "loadListOfDirectChats":
                // TODO: Загрузить список прямых чатов
                // Здесь загружается список всех прямых чатов с друзьями запрашивающего
                break;
            case "loadListOfMyRooms":
                // TODO: загружать список именно комнат в которых я состою
                break;
            case "loadStartupData":
                // TODO: loadListOfDirectChats, loadListOfMyRooms, loadFilteredAuthInfoDataOfMe
        }
    });
});
const cleaner = setInterval(() => {
    // Проверка на то, оставлять ли соединение активным
    WSServer.clients.forEach((connection) => {
        // Если соединение мертво, завершить
        if (!connection.isAlive) {
            setUserStatusAsOffline(connection.authInfo);
            return connection.terminate();
        }
        // обьявить все соединения мертвыми, а тех кто откликнется на ping, сделать живыми
        connection.isAlive = false;
        connection.ping(null, false);
    });
}, 10000);

const mongoClient = new mongodb.MongoClient(mongoLink, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoClient.connect((err, client) => {
    if (err) {
        console.log(err);
        return shutdown();
    }

    dbClient = client;
    entities = client.db().collection("entities");
    messages = client.db().collection("messages");
    server.listen(port, function(){
        console.log("Сервер слушает");
    });
});
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
