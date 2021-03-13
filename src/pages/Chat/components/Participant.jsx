import React, { PureComponent } from "react";
import { RoomParticipantItem } from "./ChatListItems";
import { LeftChatIcon } from "./LeftChatIcon";


class Participant extends PureComponent {
    render() {
        const { nickName, fullName, onlineStatus, id } = this.props;
        return (
            <RoomParticipantItem
                data-id={ id }
                data-command={ "selectChat" }
            >
                <LeftChatIcon onlineStatus={ onlineStatus } className="fa fa-circle-o"/>
                <span title={ nickName }>
                    { fullName }
                </span>
            </RoomParticipantItem>
        );
    }
}
export default Participant;
