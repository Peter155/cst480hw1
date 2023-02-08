import axios from "axios";
let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;
afterEach(async () => {
    await axios.delete(`${baseUrl}/all`);
});
test("GET /foo?bar returns message", async () => {
    let bar = "xyzzy";
    let { data } = await axios.get(`${baseUrl}/foo?bar=${bar}`);
    expect(data).toEqual({ message: `You sent: ${bar} in the query` });
});
test("GET /foo returns error", async () => {
    try {
        await axios.get(`${baseUrl}/foo`);
    }
    catch (error) {
        // casting needed b/c typescript gives errors "unknown" type
        let errorObj = error;
        // if server never responds, error.response will be undefined
        // throw the error so typescript can perform type narrowing
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        // now, after the if-statement, typescript knows
        // that errorObj can't be undefined
        let { response } = errorObj;
        // TODO this test will fail, replace 300 with 400
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "bar is required" });
    }
});
test("POST /bar works good", async () => {
    let bar = "xyzzy";
    let result = await axios.post(`${baseUrl}/foo`, { bar });
    expect(result.data).toEqual({ message: `You sent: ${bar} in the body` });
});
test("GET book that doesn't exist returns message", async () => {
    try {
        await axios.get(`${baseUrl}/books/9999`);
    }
    catch (error) {
        let errorObj = error;
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "No book by that id" });
    }
});
test("GET book by id after setup", async () => {
    await axios.get(`${baseUrl}/setup`);
    let { data } = await axios.get(`${baseUrl}/books/1`);
    expect(data).toEqual({ title: "My Fairest Lady" });
});
test("GET book by id after PUT then edit", async () => {
    await axios.get(`${baseUrl}/setup`);
    let result = await axios.put(`${baseUrl}/book`, { id: "1", title: "New Title", author_id: "1", pub_year: "1866", genre: "romance" });
    let { data } = await axios.get(`${baseUrl}/books/1`);
    expect(data).toEqual({ id: "1", title: "New Title", author_id: "1", pub_year: "1866", genre: "romance" });
});
test("PUT missing id", async () => {
    await axios.get(`${baseUrl}/setup`);
    try {
        let result = await axios.put(`${baseUrl}/book`, { title: "New Title", author_id: "1", pub_year: "1866", genre: "romance" });
    }
    catch (error) {
        let errorObj = error;
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "Body is missing sections" });
    }
});
test("PUT missing title", async () => {
    await axios.get(`${baseUrl}/setup`);
    try {
        let result = await axios.put(`${baseUrl}/book`, { id: "1", author_id: "1", pub_year: "1866", genre: "romance" });
    }
    catch (error) {
        let errorObj = error;
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "Body is missing sections" });
    }
});
test("PUT missing author id", async () => {
    await axios.get(`${baseUrl}/setup`);
    try {
        let result = await axios.put(`${baseUrl}/book`, { id: "1", title: "New Title", pub_year: "1866", genre: "romance" });
    }
    catch (error) {
        let errorObj = error;
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "Body is missing sections" });
    }
});
test("PUT missing author pub year", async () => {
    await axios.get(`${baseUrl}/setup`);
    try {
        let result = await axios.put(`${baseUrl}/book`, { id: "1", title: "New Title", author_id: "1", genre: "romance" });
    }
    catch (error) {
        let errorObj = error;
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "Body is missing sections" });
    }
});
test("PUT missing genre", async () => {
    await axios.get(`${baseUrl}/setup`);
    try {
        let result = await axios.put(`${baseUrl}/book`, { id: "1", title: "New Title", author_id: "1", pub_year: "1866" });
    }
    catch (error) {
        let errorObj = error;
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "Body is missing sections" });
    }
});
test("PUT id too long", async () => {
    await axios.get(`${baseUrl}/setup`);
    try {
        let result = await axios.put(`${baseUrl}/book`, { id: "999999", title: "New Title", author_id: "1", pub_year: "1866", genre: "romance" });
    }
    catch (error) {
        let errorObj = error;
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "Book not sent properly" });
    }
});
test("PUT id empty", async () => {
    await axios.get(`${baseUrl}/setup`);
    try {
        let result = await axios.put(`${baseUrl}/book`, { id: "", title: "New Title", author_id: "1", pub_year: "1866", genre: "romance" });
    }
    catch (error) {
        let errorObj = error;
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        let { response } = errorObj;
        expect(response.status).toEqual(400);
        expect(response.data).toEqual({ error: "Body is missing sections" });
    }
});
