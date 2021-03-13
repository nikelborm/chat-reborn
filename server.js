/* eslint-disable default-case */
const { createEmptyResponseData: createEmptyMessageData } = require("./src/tools/createEmptyResponseData");
const { randomString } = require("./src/tools/randomString");
const { hasIntersections } = require("./src/tools/intersection");
const { validateRegistrationPayload, validateFinishRegistrationPayload, validateLoginPayload, validateNewMessagePayload } = require("./src/tools/validators");

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
        if ( directChats.has(client.authInfo._id) || hasIntersections(client.authInfo.rooms, rooms)) {
            client.send(JSON.stringify(message));
        }
    });
}
function sendItToUsersInRoom(roomID, message) {
    // * Отправляет сообщение всем участникам комнаты
    WSServer.clients.forEach(function (client) {
        if ( client.authInfo.rooms.has(roomID)) {
            client.send(JSON.stringify(message));
        }
    });
}
function sendItToSpecificUser( userID, message ) {
    // * Отправляет сообщение конкретному пользователю
    for ( const client of WSServer.clients ) {
        if ( client.authInfo._id === userID ) {
            client.send( JSON.stringify( message ) );
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
function getSuccessLoginPayload( authInfo ) {
    return {
        nickName: authInfo.nickName,
        fullName: authInfo.fullName,
        statusText: authInfo.statusText,
        avatarLink: authInfo.avatarLink,
        _id: authInfo._id.toString(),
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
app.get("/deleteAccount", function(request, response) {
    // TODO: По такому же принципу построить удаление комнат
    deleteEntityById(request.session.authInfo._id);
    logout(request, response);
});

async function deleteMyAccount( connection, body ) {
    let response = createEmptyMessageData( "respondFor", "deleteMyAccount", { withReport: true } );
    setUserStatusAsOffline( connection.authInfo );
    // leaveAllChatsAndNotifyFriendsAboutThis();
    deleteEntityById( connection.authInfo._id );
    connection.authInfo = null;
    response.report.isOK = true;
    sendMessage( connection, response );
}

// TODO: Добавить шифрование на все поля в базе данных проекта
async function logout( connection, body ) {
    let response = createEmptyMessageData( "respondFor", "logout", { withReport: true } );
    setUserStatusAsOffline( connection.authInfo );
    connection.authInfo = null;
    response.report.isOK = true;
    sendMessage( connection, response );
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
            response.report.pointerForDisplaing = "password";
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
// TODO: Добавить обработчик для того чтобы присоединиться к комнате
async function newMessage( connection, body ) {
    const { to, text } = body.payload;

    let response = createEmptyMessageData( "respondFor", "newMessage", { withReport: true } );
    response.report = {
        ...response.report,
        ...validateNewMessagePayload( body.payload )
    };

    if ( response.report.info ) return response;
    try {
        const result = await entities.findOne({ _id: new ObjectId( to )});
        if ( !result ) {
            response.report.info = "Чат не найден."
            return response;
        }
        let message = {
            to,
            authorID: connection.authInfo._id,
            text,
            time: new Date(),
            isDirect: !result.isRoom
        };
        if ( result.isRoom && !connection.authInfo.rooms.has( to ) ) {
            response.report.info = "У вас нет прав для отправки сообщения в эту комнату.";
            return response;
        }
        if ( !result.isRoom && !connection.authInfo.directChats.has( to ) ) {
            // TODO: Вызвать функцию, которая добавит id-шники обоим собеседникам в свои directChats в БД, в connection и отправит уведомления о добавлении нового чата этим двум пользователям
        }

        const insertedMessage = ( await messages.insertOne( message ) ).ops[ 0 ];
        response.report.info = "Сообщение успешно отправлено";
        response.report.isOK = true;
        const notification = createEmptyMessageData( "notifyAbout", "newMessage", { withPayload: true } );
        notification.payload = insertedMessage;
        if ( result.isRoom ) {
            sendItToUsersInRoom( result._id, notification );
        } else {
            sendItToSpecificUser( result._id, notification );
        }
    } catch ( error ) {
        console.log( "error: ", error );
        response.report.info = "Произошла неизвестная ошибка на сервере. Сообщите администратору и повторите попытку верифицировать аккаунт позже.";
    }
    return response;
}

// function permissionsError( body ) {
//     let response = createEmptyMessageData( "respondFor", body.action.type + body.action.what, { withReport: true } );
//     response.report.info = `Вы не авторизованы в системе,чтобы выполнять эти команды`;
//     return response;
// }

async function unexpectedAction( connection, body ) {
    let response = createEmptyMessageData( "respondFor", body.action.type + body.action.what, { withReport: true } );
    response.report.info = `Вы запросили несуществующий обработчик для ${ body.action.what } типа ${ body.action.type }`;
    return response;
}

async function creatingActionHandlerInProgress( connection, body ) {
    let response = createEmptyMessageData( "respondFor", body.action.type + body.action.what, { withReport: true } );
    response.report.info = `Обработчик для ${ body.action.what } типа ${ body.action.type } уже разрабатывается.`;
    return response;
}

// TODO: Добавить восстановление аккаунта по почте
// TODO: Добавить функцию добавления комнаты или юзера в чёрный список по id-шнику естественно
const server = http.createServer( app );
const WSServer = new WebSocket.Server( {
    server
} );
const beforeAuthHandlers = {
    auth: {
        login,
        register,
        confirmEmail,
        requestPasswordRestoring: creatingActionHandlerInProgress,
        confirmPasswordRestoring: creatingActionHandlerInProgress,
    },
    error: creatingActionHandlerInProgress, // TODO: Сделать чтобы отчёты об ошибках на клиенте летели на сервер
};

const afterAuthHandlers = {
    get : {
        // listofusersmathedtoparams
    },
    new: {},
    delete: {
        myAccount: deleteMyAccount
    },
    set : {},
    start: {},
    // respondFor, // ?
    // notifyAbout,// ?
    // start,      // ?
    // finish,      // ?
    // error, // TODO: Сделать чтобы отчёты об ошибках на клиенте летели на сервер
    // logout,
};

function getHandlerMatchedToAction( action, variants ) {
    if( !( action.type in variants ) ) return unexpectedAction;
    const typebranch = variants[ action.type ];
    const what = typeof typebranch === "function"
        ? ( action.what === ""
            ? typebranch
            : unexpectedAction
        )
        : ( action.what in typebranch
            ? typebranch[ action.what ]
            : unexpectedAction
        )
    return action.type in variants ? variants[ what ] : unexpectedAction;
}

function validateAndPrepareInputData( input ) {
    let body;
    let info = "";
    let isOK = false;
    try {
        // TODO: Подумать над защитой от слишком большого текста
        body = JSON.parse( input.toString() );
        if (
            // TODO: Подумать над улучшением валидатора
            typeof body === "object" &&
            typeof body.action === "object" &&
            typeof body.action.type === "string" && body.action.type.length &&
            typeof body.action.what === "string" &&
            ( typeof body.payload === "undefined" ) !== ( typeof body.payload === "object" ) &&
            ( typeof body.report  === "undefined" ) !== (
                typeof body.report  === "object" &&
                typeof body.report.isOK === "boolean" &&
                typeof body.report.info === "string" &&
                ( typeof body.report.pointerForDisplaing === "undefined" ) !== (
                    typeof body.report.pointerForDisplaing === "string" &&
                    body.report.pointerForDisplaing.length
                ) &&
                ( typeof body.report.errorType === "undefined" ) !== (
                    typeof body.report.errorType === "string" &&
                    body.report.errorType.length
                )
            )
        ) {
            isOK = true;
            console.log( "В сокет пришло: ", body );
        } else {
            info = "Некорректная структура запроса: " + input.toString();
            console.log( "Некорректная структура запроса: ", body );
        }
    } catch ( error ) {
        info = "Ошибка при парсинге JSON запроса: " + input.toString();
        console.log( info );
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
    connection.on( "close", () => {
        connection.authInfo && setUserStatusAsOffline( connection.authInfo );
    } );
    connection.addListener( "message", async function ( input ) {
        const { isOK, info, body } = validateAndPrepareInputData( input );
        if( !isOK ) {
            let response = createEmptyMessageData( "error", "", { withReport: true } );
            response.report.info = info;
            return;
        }
        const { authInfo } = connection;
        sendMessage(
            connection,
            await getHandlerMatchedToAction(
                body,
                authInfo ? afterAuthHandlers : beforeAuthHandlers
            )( connection, body )
        );
    });
});

//     connection.on("message", async (input) => {
//         // TODO: Проверять не слишком ли большие данные, чтобы долго их не обрабатывать
//         const { handlerType, room, text, to } = JSON.parse(input.toString());
//         console.log('Пришло в ws: ', JSON.parse(input.toString()));
//         let { resdata, rp } = validate2lvl(handlerType === "message" ? { to, text } : { room }, authInfo);
//         resdata.handlerType = handlerType;

//         if (rp.info) return connection.send(JSON.stringify(resdata));

//         switch (handlerType) {
//             case "message":
//                 break;
//             case "loadSpecificChatHistory":
//                 messages.find({ room }, { projection: {room: 0} })
//                 .toArray((err, results) => {
//                     if (err) {
//                         rp.info = err.message;
//                         console.log(err);
//                     } else {
//                         resdata.reply = { room, results };
//                         rp.isError = false;
//                         rp.info = "Данные успешно загружены";
//                     }
//                     connection.send(JSON.stringify(resdata));
//                 });
//                 break;
//             case "loadListOfUsersInChat":
//                 let results = {};
//                 entities.find({rooms: room}, {projection: { nickName:1, fullName:1 }})
//                 .forEach(
//                     (doc) => {
//                         const { user, id } = createLiteAuthInfo(doc, activeUsersCounter);
//                         results[id] = user;
//                     },
//                     function (err) {
//                         if (err) {
//                             console.log(err);
//                             rp.info = err;
//                         } else {
//                             resdata.reply = { room, results };
//                             rp.isError = false;
//                             rp.info = "Данные успешно загружены";
//                         }
//                         connection.send(JSON.stringify(resdata));
//                     }
//                 );
//                 break;
//             case "canIjoinTheRoom":
//                 // TODO: Добавить оповещение всех онлайновых, кто в одном чате о присоединении новичка
//                 // TODO: Сделать защиту, чтобы имя комнаты не было каким-нибудь ебанутым типа constructor, __proto__ или this

//                 // notifyAboutNewUserInRoom(authInfo, roomID);
//                 // const { user, id } = createHardAuthInfo(newAuthInfo, activeUsersCounter);
//                 // WSServer.clients.forEach(function (client) {
//                 //     if (client.authInfo.rooms.has(room)) {
//                 //         client.send(JSON.stringify({handlerType: "newUserInRoom", userID: id, user, roomID: }));
//                 //     }
//                 // });
//                 break;
//             case "loadFilteredAuthInfoData":
//                 // TODO: обязательно проверять а знаком ли этот пользователь со вторым (хотя над этим ещё подумать надо)
//                 // Здесь загружается полная инфа о пользователе
//                 resdata.reply = createHardAuthInfo(authInfo, activeUsersCounter);
//                 connection.send(JSON.stringify(resdata));
//                 break;
//             case "loadListOfDirectChats":
//                 // TODO: Загрузить список прямых чатов
//                 // Здесь загружается список всех прямых чатов с друзьями запрашивающего
//                 break;
//             case "loadListOfMyRooms":
//                 // TODO: загружать список именно комнат в которых я состою
//                 break;
//             case "loadStartupData":
//                 // TODO: loadListOfDirectChats, loadListOfMyRooms, loadFilteredAuthInfoDataOfMe
//         }
//     });
// });
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
