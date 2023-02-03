import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
let app = express();
app.use(express.json());
app.use(express.static("public"));
// create database "connection"
// use absolute path to avoid this issue
// https://github.com/TryGhost/node-sqlite3/issues/441
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");
// res's type limits what responses this request handler can send
// it must send either an object with a message or an error
app.get("/foo", (req, res) => {
    if (!req.query.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({ message: `You sent: ${req.query.bar} in the query` });
});
app.post("/foo", (req, res) => {
    if (!req.body.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({ message: `You sent: ${req.body.bar} in the body` });
});
app.delete("/foo", (req, res) => {
    // etc.
    res.sendStatus(200);
});
app.get("/setup", async (req, res) => {
    console.log("Setting up");
    await db.all("INSERT INTO authors(id, name, bio) VALUES('1', 'Figginsworth III', 'A traveling gentleman.')");
    await db.all("INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('1', '1', 'My Fairest Lady', '1866', 'romance')");
    let statement = await db.prepare("INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)");
    await statement.bind(["2", "1", "A Travelogue of Tales", "1867", "adventure"]);
    await statement.run();
    return res.sendStatus(200);
});
//
//
// GET REQUESTS
//
//
app.get("/all", async (req, res) => {
    console.log("Waiting...");
    await sleep(1);
    let authors = await db.all("SELECT * FROM authors");
    console.log("Authors", authors);
    let books = await db.all("SELECT * FROM books WHERE author_id = '1'");
    console.log("Books", books);
    //res.send("$1", [books]);
    return res.sendStatus(200);
});
app.get("/authors/all", async (req, res) => {
    console.log("Waiting...");
    await sleep(1);
    let author = await db.all("SELECT * FROM authors");
    console.log("Authors", author);
    return res.json(author);
    //return res.sendStatus(200);
});
app.get("/books/all", async (req, res) => {
    console.log("Waiting...");
    await sleep(1);
    let books = await db.all("SELECT * FROM books");
    console.log("Books", books[1]);
    console.log("Books size: ", books.length);
    return res.json(books);
    //return res.sendStatus(200);
});
app.get("/book/id", async (req, res) => {
    if (!req.query.id) {
        return res.status(400).json({ error: "Body is missing sections" });
    }
    let id = req.query.id;
    console.log(id);
    let book = await db.all("SELECT * FROM books WHERE id = ?", id);
    //await book.bind([id]);
    //await book.run();
    console.log("Sent a book");
    console.log(book);
    return res.json(book);
    //return res.sendStatus(200);
});
app.get("/books/genre", async (req, res) => {
    if (!req.query.genre) {
        return res.status(400).json({ error: "Body is missing sections" });
    }
    let genre = req.query.genre;
    console.log(genre);
    let book = await db.all("SELECT * FROM books WHERE genre = ?", genre).catch(error => {
        console.log(error.errno);
        //let send = {"message": error.response.data.message};
        res.status(400);
    });
    console.log("Sent a book");
    console.log(book);
    return res.json(book);
    //return res.sendStatus(200);
});
//
//
// POST REQUESTS
//
//
//This is just checking the value are there at the moment, make more advanced next
app.post("/add/book", async (req, res) => {
    if (!req.body.id || !req.body.author_id || !req.body.title || !req.body.pub_year || !req.body.genre) {
        return res.status(400).json({ error: "Body is missing sections" });
    }
    let id = req.body.id;
    let author_id = req.body.author_id;
    let title = req.body.title;
    let pub_year = req.body.pub_year;
    let genre = req.body.genre;
    console.log(req.body);
    let statement = await db.prepare("INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)");
    await statement.bind([id, author_id, title, pub_year, genre]);
    await statement.run().catch(error => {
        console.log(error.errno);
        //let send = {"message": error.response.data.message};
        res.status(400);
    });
    //console.log(title);
    console.log("Added a book");
    return res.sendStatus(200);
});
app.post("/add/author", async (req, res) => {
    if (!req.body.id || !req.body.name || !req.body.bio) {
        return res.status(400).json({ error: "Body is missing sections" });
    }
    let id = req.body.id;
    let name = req.body.name;
    let bio = req.body.bio;
    console.log(req.body);
    let statement = await db.prepare("INSERT INTO authors(id, name, bio) VALUES (?, ?, ?)");
    await statement.bind([id, name, bio]);
    await statement.run();
    console.log("Added an author");
    return res.sendStatus(200);
});
//
//
// DELETE REQUESTS
//
//
app.delete("/del/book", async (req, res) => {
    if (req.body.id) {
        let id = req.body.id;
        let statement = await db.prepare("DELETE FROM books WHERE id = (?)");
        await statement.bind([id]);
        await statement.run();
        console.log("Deleted a book");
        return res.sendStatus(200);
    }
    return res.status(400).json({ error: "Body is missing sections" });
});
//Possibly also delete all books by the author
app.delete("/del/author", async (req, res) => {
    if (req.body.id) {
        let id = req.body.id;
        let getAuth = await db.prepare("DELETE FROM books WHERE author_id = (?)");
        await getAuth.bind([id]);
        await getAuth.run();
        let statement = await db.prepare("DELETE FROM authors WHERE id = (?)");
        await statement.bind([id]);
        await statement.run();
        console.log("Deleted an author");
        return res.sendStatus(200);
    } /*else if (req.body.name) {
        let name = req.body.name;
        let statement = await db.prepare(
            "DELETE FROM authors WHERE name = (?)"
        );
        await statement.bind([name]);
        await statement.run();
        console.log("Deleted an author");
        return res.sendStatus(200);
    } else if (req.body.bio) {
        let bio = req.body.bio;
        let statement = await db.prepare(
            "DELETE FROM authors WHERE bio = (?)"
        );
        await statement.bind([bio]);
        await statement.run();
        console.log("Deleted an author");
        return res.sendStatus(200);
    }*/
    return res.status(400).json({ error: "Body is missing sections" });
});
//
// ASYNC/AWAIT EXAMPLE
//
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// need async keyword on request handler to use await inside it
app.get("/bar", async (req, res) => {
    console.log("Waiting...");
    // await is equivalent to calling sleep.then(() => { ... })
    // and putting all the code after this in that func body ^
    await sleep(3000);
    // if we omitted the await, all of this code would execute
    // immediately without waiting for the sleep to finish
    console.log("Done!");
    return res.sendStatus(200);
});
// test it out! while server is running:
// curl http://localhost:3000/bar
// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
