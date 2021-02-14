function createLiteAuthInfo(authInfo, counter) {
    // * Облегчает authInfo до самого необходимого
    const id = authInfo._id.toString();
    return {
        user: {
            nickName: authInfo.nickName,
            fullName: authInfo.fullName,
            onlineStatus: counter[id] ? "online" : "offline"
        },
        id
    };
}
function createHardAuthInfo(authInfo, counter) {
    // * Немного расширяет lite версию
    const { user: lite, id } = createLiteAuthInfo(authInfo, counter);
    return {
        user: {
            ...lite,
            statusText: authInfo.statusText,
            avatarLink: authInfo.avatarLink
        },
        id
    };
}
exports.createLiteAuthInfo = createLiteAuthInfo;
exports.createHardAuthInfo = createHardAuthInfo;
