function createEmptyResponseData( actiontype = "", actionwhat = "", config = {} ) {
    // * Создаёт базовый объект ответа на запрос
    // {
    //     "action": {
    //         "type": "new" | "get" | "set" | "delete" | "respondFor" | "notifyAbout" | "start" | "finish" | "auth" | "error",
    //         "what": ("user"|"message") | ("roomsList"|"directChats") | ("newPreferences") | ("message") | ("getdirectChats"|"setnewPreferences") | ("onlineStatusChanged"|"message"|"newPersonArrived"|"error")
    //     },
    //     "payload"?: {},
    //     "report"?: {
    //         "isOK": true|false,
    //         "info": "",
    //         "pointerForDisplaing"?: "",
    //         "errorType"?: ""
    //     }
    // }
    const { withReport, withPayload, withPointer, withErrorType } = config;
    return {
        action: {
            type: actiontype,
            what: actionwhat
        },
        ...( withPayload ? { payload: {} } : {} ),
        ...( withReport
            ? {
                report: {
                    isOK: false,
                    info: "",
                    ...( withPointer   ? { pointerForDisplaing: "" } : {} ),
                    ...( withErrorType ? { errorType:           "" } : {} )
                }
            }
            : {}
        )
    };
}
exports.createEmptyResponseData = createEmptyResponseData;
