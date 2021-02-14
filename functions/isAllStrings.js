function isAllStrings(body) {
    // * Проверяет все ли значения в body являются строками
    let result = 1;
    for (let key in body) {
        result &= +(typeof body[key] === "string");
    }
    return result;
}
exports.isAllStrings = isAllStrings;
