import React, { Fragment } from "react";
import { getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps } from "../../../components/AppStateManager"
import RoomHeader from "./RoomHeader";
import ParticipantsList from "./ParticipantsList";
import { RoomParticipantItem } from "./ChatListItems";
import styled from "styled-components";

const RoomsWrapper = styled.ul`
    list-style: none;
    padding: 0;
    ${ props => ( !props.isExpanded
        ? `
            height: 0;
            overflow: hidden;
        `
        : ``
    ) }
`;

const UnsubscribedRoomChatsList = ({ appState: { rooms, entities, usersInRooms, muted } }) => (
    Array.from( rooms, roomId => (
        <Fragment key={ roomId }>
            <RoomHeader
                id={roomId}
                nickName={ entities[roomId].nickName }
                fullName={ entities[roomId].fullName }
                isExpanded={ entities[roomId].isExpanded }
                isMuted={ muted.has(roomId) }
            />
            <RoomsWrapper isExpanded={ entities[roomId].isExpanded }>
                <ParticipantsList
                    users={usersInRooms[roomId]}
                    entities={entities}
                    roomId={roomId}
                    isExpanded={entities[roomId].isExpanded}
                    isUsersDownloaded={entities[roomId].isUsersDownloaded}
                />
                {entities[roomId].isHistoryDownloadingNow && (
                    <RoomParticipantItem>
                        <i className="fa fa-sync"></i>
                        <span>Загрузка...</span>
                    </RoomParticipantItem>
                )}
            </RoomsWrapper>
        </Fragment>
    ) )
);

const RoomChatsList = getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps(
    UnsubscribedRoomChatsList,
    [ [ "rooms" ], [ "entities" ], [ "usersInRooms" ], [ "muted" ], ]
);

export default RoomChatsList;
