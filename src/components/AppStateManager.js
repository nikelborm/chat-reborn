import React, { Component } from "react";
import createNewKit from "./StateManagementLibrary";
import SelfHealingWebSocket from "../tools/SelfHealingWebSocket";
const {
    AppContextProvider,
    AppContextRenderer,
    getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps,
    getAppContextRendererSubscribedForLinks
} = createNewKit();


class AppStateManager extends AppContextProvider {
    state = {
        isAuthInProcess: false,
        isLogoutInProcess: false,
        isAuthorized: false,
        fullName: "",
        activeChat: "", // По умолчанию пусто, но иначе id чата
        entities: {
            // это данные о сущностях, с которыми приходилось сталкиваться
            "5e81046b8aaba01b18c3e08c": {
                nickName: "eva_tyan",
                fullName: "Евангелина Рима",
                statusText : "В сети",
                avatarLink : "https://99px.ru/sstorage/1/2020/01/image_12201200001487843711.gif",
                onlineStatus: "online"
                // Возможно тут будет больше каких-либо данных, ведь это всё таки мой профиль и this.myID мы знаем
            },
            "5e826790eeef65222c60cb20": {
                nickName: "kolya_kun",
                fullName: "Коля",
                statusText : "В сети",
                avatarLink : "https://99px.ru/sstorage/1/2020/01/image_12201200001487843711.gif",
                onlineStatus: "online",
                isHistoryDownloaded: true,
                isHistoryDownloadingNow: false
            },
            "5ec042332508d40843da029e": {
                nickName : "global",
                owner : "5e81046b8aaba01b18c3e08c",
                fullName : "Глобальный чат",
                // regDate : new ISODate("2020-03-29T20:26:19.176Z"),
                description : "добро пожаловать в спокойное, мирное и уютное место.",
                avatarLink : "https://99px.ru/sstorage/1/2020/01/image_12201200001487843711.gif",
                isExpanded: false,
                isUsersDownloaded: true,
                isUsersDownloadingNow: false,
                isHistoryDownloaded: true,
                isHistoryDownloadingNow: false
            }
        },
        directChats: new Set([
            "5e826790eeef65222c60cb20"
        ]),
        rooms : new Set([
            "5ec042332508d40843da029e"
        ]),
        chatsHistory: {
            "5e826790eeef65222c60cb20": {
                "5eca7e4337b3cc5b1e34278d" : {
                    authorID : "5e81046b8aaba01b18c3e08c",
                    // text : "qwe1",
                    // time : ISODate("2021-04-23T21:08:56.855Z"),
                    // messageBody должен быть иммутабельным
                    messageBody : ["qwe1"], // Распарсенное сообщение text
                    correctTime : "12 декабря 08:56" // Распарсенное время time
                    // TODO: Проверку был ли парсинг сообщения можно сделать на основе наличия messageBody
                },
                "5ecabef837b3cc5b1e342ef7" : {
                    authorID : "5e826790eeef65222c60cb20",
                    messageBody : ["qwe2"],
                    correctTime : "13 декабря 08:56"
                }
            },
            "5ec042332508d40843da029e": {
                "5e825fe8eeef65222c60cb1f" : {
                    authorID : "5e81046b8aaba01b18c3e08c",
                    messageBody : ["qweasdfsdf1"],
                    correctTime : "14 декабря 08:56"
                },
                "5ecabfb537b3cc5b1e342f19" : {
                    authorID : "5e826790eeef65222c60cb20",
                    messageBody : ["qweasdfsdf2"],
                    correctTime : "15 декабря 08:56"
                }
            }
        },
        usersInRooms: {
            "5ec042332508d40843da029e": new Set([
                "5e826790eeef65222c60cb20",
                "5e81046b8aaba01b18c3e08c"
            ])
        },
        muted: new Set([
            "5e826790eeef65222c60cb20"
        ])
        // TODO: Вынести isExpanded в такой же Set как и muted

    }
    constructor( props ) {
        super( props );
        // TODO: в rapidfarm/server у тебя есть система сохранения пользовательских данных и переподключения в случае ошибки. Либо создай тут такую же либо скопируй
        if ( sessionStorage.getItem( "isAuthorized" ) !== "true" ) {
            sessionStorage.setItem( "isAuthorized", "false" );
            sessionStorage.setItem( "lastEmail", "" );
            sessionStorage.setItem( "lastPassword", "" );
        } else {
            this.state.isAuthorized = true;
            this.state.fullName = sessionStorage.getItem( "fullName" );
        }
        this.ws = null;
        this.processesBackup = null;
    }
    authorize = query => {
        if ( this.state.isLogoutInProcess || this.state.isAuthInProcess ) return;
        this.ws && this.ws.send( query );
        this.setState( ps => ( {
            ...ps,
            isAuthInProcess: true
        } ) );
    };
    register = ( email, password, confirmPassword, fullName ) => this.authorize(
        {
            class: "registerAsUser",
            email,
            password,
            confirmPassword,
            fullName
        }
    );
    logout = () => {
        // запрос на выход чтобы сервер стёр сессию
        if ( this.state.isLogoutInProcess || this.state.isAuthInProcess ) return;
        this.ws && this.ws.send( { class : "logout" } );
        this.setState( ps => ( {
            ...ps,
            isLogoutInProcess: true
        } ) );
    };
    login = ( email, password ) => this.authorize(
        {
            class: "loginAsUser",
            email,
            password,
        }
    );
    upWatcher = () => {
        if( sessionStorage.getItem( "isAuthorized") !== "true" ) return;
        this.login(
            sessionStorage.getItem( "lastEmail" ),
            sessionStorage.getItem( "lastPassword" )
        );
    };
    downWatcher = () => {
        this.setState( ps => ( {
            ...ps,
            isAuthorized: false,
        } ) );
    };
    messageParser = data => {
        switch (data.action.type) {
            case "logs":
                console.log("Пришли ответные логи: ", data.report);
                break;
            case "message":
                // TODO: Подумать о том, а загружен ли этот чат, чтобы в него что-нибудь вставлять?
                // this.setState((prevState) => {
                //     prevState.chatsHistory[data.chatID] = {
                //         ...prevState.chatsHistory[data.chatID],
                //         [data.msgID] : {
                //             authorID : data.authorID,
                //             messageBody : parseMessageBody(data.text),
                //             correctTime : convertMessageTime(data.time)
                //         }
                //     }
                //     return prevState;
                // });
                break;
            case "editMessage":
                // Не забыть про иммутабельность chatsHistory[data.chatID]
                // не бойся использовать её, так как порядок сообщений не собьётся
                // TODO: При изменении сообщения, полностью создавать новый обьект сообщения, чтобы shouldComponentUpdate в MessagesList сработал
                break;
            case "online":
            case "offline":
            case "idle":
                if (this.state.entities[data.userID]) {
                    this.setState((prevState) => {
                        prevState.entities[data.userID].onlineStatus = data.handlerType;
                        return prevState;
                    });
                } else {
                    // загружать инфу о нём не надо так как, если он не известен, то это значит, что мы ни разу не открыли список с ним и не видели ни одного его сообщения
                    console.log("Новый пользователь, которого мы не знаем");
                }
                break;
            case "newUserInRoom":
                this.setState((prevState) => {
                    if (!prevState.entities[data.userID]) {
                        prevState.entities[data.userID] = data.user;
                    }
                    prevState.usersInRooms[data.roomID].add(data.userID);
                    return prevState;
                });
                break;
            default:
                console.log("Неизвестный обработчик");
                break;
        }
    }
    sendRawQuery = JSONString => this.ws && this.ws.sendRaw( JSONString );
    componentDidMount() {
        const loc = document.location;
        const protocol = loc.protocol[ 4 ] === "s" ? "wss://" : "ws://";
        const WSAdress = protocol + ( loc.port === "3001" ? loc.hostname + ":3000" : loc.host );
        this.ws = new SelfHealingWebSocket( this.downWatcher, this.upWatcher, this.messageParser, WSAdress );
        // if (this.state.activeChat) {
        //     this.loader("/loadChatHistory", "chatsHistory", "isActiveChatHistoryLoaded", this.state.activeChat);
        // }
        // for (const room of this.state.myRooms) {
        //     this.loader("/loadListOfUsersInChat", "usersInRooms", "isUsersListInRoomDownloaded", room);
        // } // А надо ли?
        // Код остаток, который ещё пригодится
        // const {reply, report} = data;
        // if (report.isError) {
        //     // TODO: Добавить обработку ошибок (можно с TIPPY)
        // } else {
        //     this[pasteSuccessIn] = true;
        //     this.setState((prevState) => {
        //         prevState[pasteReplyIn][room] = reply;
        //         return prevState;
        //     });
        // }
    }
    onSelectChat = async (event, id) => {
        event.stopPropagation();
        console.log('onSelectChat: ', this.state.entities[id].nickName);
        // TODO: Загрузка сообщений по конкретному чату
        // А после добавление их и новой активной комнаты в state
        if (this.state.entities[id].isHistoryDownloadingNow) {
            // вроде ничего не должны делать
            return;
        }
        if (this.state.entities[id].isHistoryDownloaded) {
            // TODO: Показать историю

        } else {
            // TODO: Скачать историю чата
            // const {reply, report} = await loader("/загрузить историю конкретного чата", { room });
            // if (report.isError) {
            //     // TODO: Добавить обработку ошибок (можно с TIPPY)
            // } else {
            //     this[pasteSuccessIn] = true;
            //     this.setState((prevState) => {
            //         prevState[pasteReplyIn][room] = reply;
            //         return prevState;
            //     });
            // }
        }
        // Устанавливаем активный чат
        this.setState((prevState) => {
            prevState.activeChat = id;
            return prevState;
        });

    };
    onExpandChange = (event, id) => {
        event.stopPropagation();
        console.log('onExpandChange: ', this.state.entities[id].nickName);
        // TODO: В случае, если открывается впервые, загружать пользователей по конкретному чату
        this.setState((prevState) => {
            prevState.entities[id].isExpanded = !prevState.entities[id].isExpanded;
            return prevState;
        });
    };
    onMuteChange = (event, id, isMutedNow)  => {
        event.stopPropagation();
        console.log('onMuteChange: ', this.state.entities[id].nickName);
        // TODO: Менять состояние только после отправки изменений на сервер
        this.setState((prevState) => {
            prevState.muted[isMutedNow ? "delete" : "add"](id);
            return prevState;
        });
    };
    onDeleteChat = (event, id, isDirect) => {
        event.stopPropagation();
        console.log('onDeleteChat: ', this.state.entities[id].nickName);
        // TODO: Уточнять, а точно ли он хочет его удалить
        // TODO: После этого отправлять запрос на сервер
        this.setState((prevState) => {
            prevState.muted.delete(id);
            delete prevState.chatsHistory[id];
            // не удаляй пользователя из entities, так как он может может быть участником чата
            if (prevState.activeChat === id) {
                prevState.activeChat = "";
            }
            if (isDirect) {
                prevState.directChats.delete(id);
            } else {
                prevState.rooms.delete(id);
                delete prevState.usersInRooms[id];
            }
            return prevState;
        });
    };
    sendMessage = text => {
        if (window.isSocketAvailable) {
            const data = {
                handlerType: "message",
                to: this.state.activeChat,
                text
            };
            window.socket.send(JSON.stringify(data));
        } else {
            // TODO: Добавить Tippy с выводом, что соединение потеряно
            console.log("Сокет недоступен");
        }
    };
    actions = {
        register: this.register,
        login: this.login,
        logout: this.logout,
        sendRawQuery: this.sendRawQuery,
        onMuteChange: this.onMuteChange,
        onExpandChange: this.onExpandChange,
        onDeleteChat: this.onDeleteChat,
        onSelectChat: this.onSelectChat,
        sendMessage: this.sendMessage,
    }
}
export {
    AppContextRenderer,
    getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps,
    getAppContextRendererSubscribedForLinks
}

export default AppStateManager;
