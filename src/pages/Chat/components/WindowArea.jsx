// @ts-nocheck
import React, { Component } from "react";
import InputForm from "./InputForm";
import MessagesArea from "./MessagesArea";
import MyAccountInfo from "./MyAccountInfo";
import ChatsList from "./ChatsList";

import RightTabs from "./layout/RightTabs";
import convertMessageTime from '../tools/convertMessageTime';
import parseMessageBody from '../tools/parseMessageBody';
import getCookie from "../../../tools/getCookie";
import { AppContextRenderer } from "../../../components/AppStateManager";
import { Controllers } from './controllers';
// import loader from "../tools/loader";
// ! На один запрос одно ответное сообщение - используй это как принцип построения сервера
// const whyDidYouRender = require("@welldone-software/why-did-you-render");
// whyDidYouRender(React, {
//     trackAllPureComponents: true,
// });
// "@welldone-software/why-did-you-render": "^4.0.5",
import styled from "styled-components";

const ChatArea = styled.div`
    border-top: 1px solid #cfdae1;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 176px;
    right:175px;
    box-shadow: inset 0 1px 3px rgba(207, 218, 225, 0.42)
`;

const ChatAreaTitle = styled.div`
    padding: 10px;
    overflow: hidden;
    line-height: 15px;

    & > i {
        font-size: 14px;
        float: right;
        color: #a8bbc6;
        cursor: pointer;
    }
`;

const WindowAreaWrapper = styled.div`
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    padding-left: 176px;
`;

const ConversationList = styled.div`
    width: 176px;
    background: #505d71;
    float: left;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
`;

class WindowArea extends Component {
    render() {
        // TODO: Убрать лишние ререндеры у компонентов
        return (
            <WindowAreaWrapper>
                <ConversationList>
                    {/* TODO: Добавить инпут для добавления нового чата */}
                    <ChatsList/>
                    <MyAccountInfo />
                </ConversationList>
                <ChatArea>
                    <ChatAreaTitle>
                        <b> Переписка </b>
                        <i className="fa fa-search"></i>
                    </ChatAreaTitle>
                    <AppContextRenderer render={
                        ( { chatsHistory, activeChat, entities } ) => (
                            <MessagesArea
                                entities={entities}
                                history={chatsHistory[activeChat]}
                                activeChat={activeChat}
                                isDownloading={entities[activeChat]?.isHistoryDownloadingNow}
                                myID={this.myID}
                            />
                        )
                    } />
                    <AppContextRenderer render={
                        ( _, actions) => <InputForm actions={ actions }/>
                    } />
                </ChatArea>
                <RightTabs />
            </WindowAreaWrapper>
        );
    }
}
export default WindowArea;
