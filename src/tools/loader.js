async function loader(path, body) {
    let data;
    try {
        const response = await fetch(document.location.origin + path, {
            method: "post",
            body: JSON.stringify(body),
            headers: new Headers({
                "Content-Type": "application/json"
            })
        });
        data = await response.json();
        console.log(data);
    } catch (error) {
        data = {
            report: {
                isError: true,
                info: "Ошибка при загрузке данных с " + path
            }
        };
        console.error(error);
    }
    return data;
}
export default loader;
