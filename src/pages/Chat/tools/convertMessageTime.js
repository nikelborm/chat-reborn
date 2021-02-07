function convertMessageTime(time) {
    // TODO: Прокачать так, чтобы в зависимости от текущего времени показывался разный набор данных, чем старее, тем подробнее дата
    return new Intl.DateTimeFormat("ru", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "Europe/Moscow"
    }).format(Date.parse(time));
}
export default convertMessageTime;
