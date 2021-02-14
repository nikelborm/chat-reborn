function createEmptyResponseData() {
    // * Создаёт базовый объект ответа на запрос
    const resdata = {
        handlerType: "logs",
        report: {
            isError: true,
            info: ""
        },
        reply: {}
    };
    return { resdata, rp: resdata.report };
}
exports.createEmptyResponseData = createEmptyResponseData;
