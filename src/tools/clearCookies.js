function clearCookies(response, ...params) {
    // * Удаляет все куки с именами из params
    for (const param of params) {
        response.clearCookie(param);
    }
}
exports.clearCookies = clearCookies;
