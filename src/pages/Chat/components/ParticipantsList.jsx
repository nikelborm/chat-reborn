import React from "react";
import Participant from "./Participant";

// import { hasSymmetricDifference } from "../../../tools/symmetricDifference";
// shouldComponentUpdate( nextProps ) {
//     return nextProps.isExpanded && nextProps.isDownloaded && hasSymmetricDifference(nextProps.users, this.props.users);
// }

const SlowParticipantsList = ( { users, entities, isExpanded, isUsersDownloaded } ) => Array.from(
    ( isExpanded && isUsersDownloaded ) ? users : [],
    id => (
        <Participant
            id={ id }
            key={ id }
            nickName={ entities[ id ].nickName }
            fullName={ entities[ id ].fullName }
            onlineStatus={ entities[ id ].onlineStatus }
        />
    )
);
const ParticipantsList = React.memo( SlowParticipantsList );
export default ParticipantsList;
