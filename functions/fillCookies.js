function fillCookies(response, dataObj, ...params) {
    // * Заполняет куки по ключам из params, значениями из dataObj
    for (const param of params) {
        response.cookie(param, typeof dataObj[param] === "string" ? dataObj[param] : dataObj[param].toString());
    }
}
exports.fillCookies = fillCookies;
