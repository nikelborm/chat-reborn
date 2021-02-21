import serverError from './serverError'

async function loader(body, address) {
    try {
        const data = await (await fetch(document.location.origin + address, {
            method: "post",
            body: JSON.stringify(body),
            headers: new Headers({
                "Content-Type": "application/json"
            })
        })).json();
        console.log(data);
        const { isError, info } = data.report;
        const { errorField } = data.reply;
        if (isError) {
            throw new serverError(info, errorField);
        }
        return data;
    } catch (error) {
        console.log('error: ', error);
        if (error instanceof serverError) {
            console.log("error instanceof serverError");
        }
        return { report: { isError:true } }
        // setNewTippy(errorField, info);
    }
}
export default loader;
