import React, { PureComponent } from "react";
import { DirectChatItem } from "./ChatListItems";
import { LeftChatIcon } from "./LeftChatIcon";

class DirectChat extends PureComponent {
    render() {
        const { isMuted, nickName, fullName, onlineStatus, id } = this.props;

        return (
            <DirectChatItem
                data-id={ id }
                data-command={ "selectChat" }
            >
                <LeftChatIcon onlineStatus={onlineStatus} className="fa fa-circle-o"/>
                <span title={ nickName }>
                    { fullName }
                </span>
                <LeftChatIcon
                    className="far fa-trash-alt"
                    data-id={ id }
                    data-command={ "deleteChat" }
                    data-is-direct={ true }
                />
                <LeftChatIcon
                    className={"far fa-bell" + (isMuted ? "-slash": "")}
                    data-id={ id }
                    data-command={ "changeChatMuteStatus" }
                    data-is-muted-now={ isMuted }
                />
            </DirectChatItem>
        );
    }
}
export default DirectChat;
