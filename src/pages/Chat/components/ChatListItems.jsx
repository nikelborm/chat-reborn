import styled from "styled-components";

const activeItemStyles = `
    background: #445166;
    color: #fff;
`;

export const ChatListItem = styled.li`
    padding: 10px 0 10px 7px;
	color: #d2d7e1;
	text-decoration: none;
	display: block;
	position: relative;
	border-bottom: 2px solid #586476;
	cursor: pointer;

    &:hover {
        ${ activeItemStyles }
    }
    & span {
        display: inline-block;
        margin-left: 7px;
    }
`;

export const HeaderItem = styled( ChatListItem )`
    cursor: initial;
    ${ activeItemStyles }
`;

export const DirectChatItem = styled( ChatListItem )`
    & i.fa-trash-alt {
        position: absolute;
        top: 12px;
        right: 7px;
        font-size: 10px;
    }
    & i.fa-bell,
    & i.fa-bell-slash {
        position: absolute;
        top: 11px;
    }
    & i.fa-bell {
        right: 24.6px;
        font-size: 14px;
    }
    & i.fa-bell-slash {
        right: 20px;
        font-size: 14px;
    }
`;

export const RoomItem = styled( DirectChatItem )`
    & i.fa-angle-down, & i.fa-angle-up {
        position: absolute;
        top: 11px;
        right: 41px;
        font-size: 16px;
        font-weight: bold;
    }
    ${ props => ( props.isExpanded
        ? activeItemStyles
        : ""
    ) }

`;

export const RoomParticipantItem =  styled( ChatListItem )`
    padding-left: 20px;
`;
