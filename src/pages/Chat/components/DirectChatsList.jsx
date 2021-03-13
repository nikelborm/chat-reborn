import React from "react";
import DirectChat from "./DirectChat";
import { getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps } from "../../../components/AppStateManager"

const UnsubscribedDirectChatsList = ( { appState: { directChats, muted, entities } } ) => (
    Array.from( directChats, id => (
        <DirectChat
            key={ id }
            id={ id }
            isMuted={ muted.has(id) }
            nickName={ entities[id].nickName }
            fullName={ entities[id].fullName }
            onlineStatus={ entities[id].onlineStatus }
        />
    ) )
);

const DirectChatsList = getComponentSubscribedForLinksWhichPassesAppStateAndActionsProps(
    UnsubscribedDirectChatsList,
    [ [ "directChats" ], [ "muted" ], [ "entities" ] ]
);

export default DirectChatsList;
