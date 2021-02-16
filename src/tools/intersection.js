function intersection(setA, setB) {
    // * Возвращает Set, хранящий общие значения у setA и setB
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}
function hasIntersections(setA, setB) {
    // * Проверяет есть ли общие значения у setA и setB
    for (const elem of setB) {
        if (setA.has(elem)) return true;
    }
    return false;
}
exports.hasIntersections = hasIntersections;
exports.intersection = intersection;
