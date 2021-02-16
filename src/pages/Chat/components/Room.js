import React, { Component, Fragment } from "react";
import RoomHeader from "./RoomHeader";
import ParticipantsList from "./ParticipantsList";
import styled from "styled-components";
import { RoomParticipantItem } from "./ChatListItems";

const RoomsWrapper = styled.ul`
    list-style: none;
    ${ props => ( !props.isExpanded
        ? `
            height: 0;
            overflow: hidden;
        `
        : ``
    ) }
`;
class Room extends Component {
    render() {
        const { id, entities, users, isExpanded, isMuted } = this.props;
        return (
            <Fragment>
                <RoomHeader
                    id={id}
                    nickName={entities[id].nickName}
                    fullName={entities[id].fullName}
                    isExpanded={isExpanded}
                    isMuted={isMuted}
                />
                <RoomsWrapper isExpanded={ isExpanded }>
                    <ParticipantsList
                        users={users}
                        entities={entities}
                        isExpanded={isExpanded}
                        isDownloaded={entities[id].isUsersDownloaded}
                    />
                    {entities[id].isHistoryDownloadingNow && <RoomParticipantItem><i className="fa fa-sync"></i><span>Загрузка...</span></RoomParticipantItem>}
                </RoomsWrapper>
            </Fragment>
        );
    }
}
export default Room;
