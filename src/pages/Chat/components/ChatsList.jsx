import React from "react";
import styled from "styled-components";
import { HeaderItem } from "./ChatListItems";
import RoomChatsList from "./RoomChatsList";
import DirectChatsList from "./DirectChatsList";

const ChatListsWrapper = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Header = ({ children }) => (
    <HeaderItem>
        <i className="fa fa-list-alt"></i>
        <span>{ children }</span>
    </HeaderItem>
);

const ChatsList = props => (
    <ChatListsWrapper>
        <Header>
            Прямые чаты
        </Header>
        <DirectChatsList/>
        <Header>
            Комнаты
        </Header>
        <RoomChatsList/>
    </ChatListsWrapper>
);

export default ChatsList;
