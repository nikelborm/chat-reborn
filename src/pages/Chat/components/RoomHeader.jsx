import React, { PureComponent } from "react";
import { LeftChatIcon } from "./LeftChatIcon";
import { RoomItem } from "./ChatListItems";

const RoomHeader = ( { nickName, fullName, isExpanded, isMuted, id } ) => (
    <RoomItem
        data-id={ id }
        data-command={ "selectChat" }
        isExpanded={ isExpanded }
    >
        <LeftChatIcon className="fas fa-user-alt"/>
        <span title={ nickName }>
            { fullName }
        </span>
        <LeftChatIcon
            className={ "fa fa-angle-" + ( isExpanded ? "up" : "down" ) }
            data-id={ id }
            data-command={ "changeExpandStatus" }
        />
        <LeftChatIcon
            className="far fa-trash-alt"
            data-id={ id }
            data-command={ "deleteChat" }
            data-is-direct={ false }
        />
        <LeftChatIcon
            className={ "far fa-bell" + ( isMuted ? "-slash": "" ) }
            data-id={ id }
            data-command={ "changeChatMuteStatus" }
            data-is-muted-now={ isMuted }
        />
    </RoomItem>
);


export default RoomHeader;
