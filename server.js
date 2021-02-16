/* eslint-disable default-case */
const { validate1lvl, validate2lvl } = require("./src/tools/validate");
const { createHardAuthInfo, createLiteAuthInfo } = require("./src/tools/compressAuthInfo");
const { createEmptyResponseData: createEmptyMessageData } = require("./src/tools/createEmptyResponseData");
const { randomString } = require("./src/tools/randomString");
const { isAllStrings } = require("./src/tools/isAllStrings");
const { fillCookies } = require("./src/tools/fillCookies");
const { logout } = require("./src/tools/logout");
const { hasIntersections } = require("./src/tools/intersection");
const { validateRegistrationPayload, validateFinishRegistrationPayload, validateLoginPayload } = require("./src/tools/validators");

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


function sendItToUsersWhoKnowMe({ rooms, directChats }, message) {
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
function onCloseWSconnection(myAuthInfo) {
    const userID = myAuthInfo._id;
    if (activeUsersCounter[userID] === 1) {
        delete activeUsersCounter[userID];
        sendItToUsersWhoKnowMe(myAuthInfo, {handlerType: "offline", userID});
    } else {
        activeUsersCounter[userID]--;
    }
}
function onAccessWSconnection(myAuthInfo) {
    const userID = myAuthInfo._id;
    if (!activeUsersCounter[userID]) {
        activeUsersCounter[userID] = 1;
        sendItToUsersWhoKnowMe(myAuthInfo, {handlerType: "online", userID});
        // TODO: Отправить новичку инфу о том кто он?
    } else {
        activeUsersCounter[userID]++;
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
// TODO: Добавить шифрование на все поля в базе данных проекта
app.get("/logout", logout);


async function canIlogin( connection, body ) {
    const { nickNameOrEmail, password } = body.payload;

    let response = createEmptyMessageData( "respondFor", "setMeAsLoggedIn", { withReport: true, withPayload: true } );
    response.report = {
        ...response.report,
        ...validateLoginPayload( body.payload )
    };

    if ( response.report.info ) return sendMessage( connection, response );
    try {
        const foundUser = await entities.findOne({ isRoom: false, $or: [{ nickName: nickNameOrEmail }, { email: nickNameOrEmail }]});
        if ( !foundUser ) {
            response.report.pointerForDisplaing = "nickNameOrEmail";
            response.report.info = "Пользователь с указанными логином или почтой не найден";
        } else if (foundUser.password !== sha256( password )) {
            response.report.pointerForDisplaing = "passwordLogin";
            response.report.info = "Неверный пароль";
        } else if (!foundUser.emailConfirmed) {
            response.report.pointerForDisplaing = "nickNameOrEmail";
            response.report.info = "Этот аккаунт не верифицирован. Перейдите по ссылке из нашего письма. Если письма нет даже в папке спам, обратитесь к администратору.";
        }
        if ( response.report.info ) return sendMessage( connection, response );

        connection.authInfo = foundUser;
        response.payload = {
            nickName: foundUser.nickName,
            fullName: foundUser.fullName,
            statusText: foundUser.statusText,
            avatarLink: foundUser.avatarLink,
            _id: foundUser._id.toString(),
        };
        response.report.isOK = true;
    } catch ( error ) {
        console.log( "error: ", error );
        response.report.info = "Произошла неизвестная ошибка на сервере. Сообщите администратору и повторите попытку войти в аккаунт позже.";
    }
    sendMessage( connection, response );
}

// TODO: В самом начале добавить валидатор на соответствие сообщения общепринятому в проекте формату
async function finishRegistration( connection, body ) {
    const { secureToken, id } = body.payload;

    let response = createEmptyMessageData( "respondFor", "setRegistrationAsFinished", { withReport: true, withPayload: true } );
    response.report = {
        ...response.report,
        ...validateFinishRegistrationPayload( body.payload )
    };

    if ( response.report.info ) return sendMessage( connection, response );

    try {
        const _id = new ObjectId( id );
        const updatingResult = entities.findOneAndUpdate(
            { isRoom: false, _id, secureToken },
            {
                // $addToSet: { rooms: тут можно добавить что-нибудь к любому массиву },
                $set: {
                    secureToken : randomString( 32 ),
                    emailConfirmed: true
                }
            },
            { returnOriginal: false }
        );
        if ( !updatingResult ) {
            response.report.info = "Данное сочетание ключа и айди больше не работает."
            return sendMessage( connection, response );
        }
        connection.authInfo = updatingResult;
        response.payload = {
            nickName: updatingResult.nickName,
            fullName: updatingResult.fullName,
            statusText: updatingResult.statusText,
            avatarLink: updatingResult.avatarLink,
            _id: updatingResult._id.toString(),
        };
    } catch ( error ) {
        console.log( "error: ", error );
        response.report.info = "Произошла неизвестная ошибка на сервере. Сообщите администратору и повторите попытку верифицировать аккаунт позже.";
    }
    sendMessage( connection, response );
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

// TODO: Поправить всё, что связано с аватаром пользователя, так как обновилось в базе данных
async function canIregister( connection, body ) {
    const { nickName, password, fullName, email } = body.payload;

    let response = createEmptyMessageData( "respondFor", "newUser", { withReport: true, withPointer: true } );
    response.report = { ...response.report, ...validateRegistrationPayload( body.payload ) };

    if ( response.report.info ) return sendMessage( connection, response );
    const userProfile = {
        isRoom: false,
        nickName,
        password: sha256(password),
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
    sendMessage( connection, response );
};

// TODO: Добавить восстановление аккаунта по почте
// TODO: Добавить функцию добавления комнаты или юзера в чёрный список по id-шнику естественно
const server = http.createServer(app);
const WSServer = new WebSocket.Server({
    server
});



async function canIregister
WSServer.on("connection", (connection, request) => {
    connection.on("close", () => {
        onCloseWSconnection(connection.authInfo);
    });
    connection.isAlive = true;
    const cookies = cookie.parse(request.headers.cookie);
    const sid = "" + cookieParser.signedCookie(cookies["connect.sid"], secretKey);
    // TODO: Подумать над тем, что сообщение может начать обрабатываться до то того как редис вернёт запись для валидации
    store.get(sid, (err, session) => {
        if (err) console.log(err);

        if (!session || !session.authInfo || err) {
            let { resdata, rp } = createEmptyMessageData();
            rp.info = "Вы не авторизованы!";
            connection.send(JSON.stringify(resdata));
            connection.terminate();
        } else {
            const { rooms, directChats, ...rest } = session.authInfo;
            connection.authInfo = {
                ...rest,
                rooms: new Set(rooms),
                directChats: new Set(directChats)
            };
            onAccessWSconnection(connection.authInfo);
        }
    });
    connection.on("pong", () => {
        connection.isAlive = true;
    });
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
            onCloseWSconnection(connection.authInfo);
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
