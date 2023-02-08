import express, { query, Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import { z } from "zod";
import { stat } from "fs";


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

//The book and author items
let bookSchema = z.object({
    id: z.string().min(1).max(3),
    title: z.string().min(1).max(20),
    author_id: z.string().min(1).max(3),
    pub_year: z.string().min(1).max(4),
    genre: z.string().min(1).max(10),
});
let authorSchema = z.object({
    id: z.string().min(1).max(3),
    name: z.string().min(1).max(20),
    bio: z.string().min(1).max(100),
});

//
// SQLITE EXAMPLES
// comment these out or they'll keep inserting every time you run your server
// if you get 'UNIQUE constraint failed' errors it's because
// this will keep inserting a row with the same primary key
// but the primary key should be unique
//

//insert example
/*await db.run(
    "INSERT INTO authors(id, name, bio) VALUES('1', 'Figginsworth III', 'A traveling gentleman.')"
);
await db.run(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('1', '1', 'My Fairest Lady', '1866', 'romance')"
);

// insert example with parameterized queries
// important to use parameterized queries to prevent SQL injection
// when inserting untrusted data
let statement = await db.prepare(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)"
);
await statement.bind(["2", "1", "A Travelogue of Tales", "1867", "adventure"]);
await statement.run();*/


// select examples
/*let authors = await db.all("SELECT * FROM authors");
console.log("Authors", authors);
let books = await db.all("SELECT * FROM books WHERE author_id = '1'");
console.log("Books", books);
let filteredBooks = await db.all("SELECT * FROM books WHERE pub_year = '1867'");

console.log("Some books", filteredBooks);*/

//
// EXPRESS EXAMPLES
//

// GET/POST/DELETE example
interface Foo {
    message: string;
}
interface Book {
    id: string;
    author_id: string;
    title: string;
    pub_year: string;
    genre: string;
}
interface Author {
    id: string;
    name: string;
    bio: string;
}
interface Error {
    error: string;
}

type BookResponse = Response<Book | Error>;
type AuthorResponse = Response<Author | Error>;
type FooResponse = Response<Foo | Error>;
// res's type limits what responses this request handler can send
// it must send either an object with a message or an error
app.get("/foo", (req, res: FooResponse) => {
    if (!req.query.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({ message: `You sent: ${req.query.bar} in the query` });
});
app.post("/foo", (req, res: FooResponse) => {
    if (!req.body.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({ message: `You sent: ${req.body.bar} in the body` });
});
app.delete("/foo", (req, res) => {
    // etc.
    res.sendStatus(200);
});

app.get("/setup", async (req, res) =>{
    console.log("Setting up");
    await db.all(
        "INSERT INTO authors(id, name, bio) VALUES('1', 'Figginsworth III', 'A traveling gentleman.')"
    );
    await db.all(
        "INSERT INTO authors(id, name, bio) VALUES('2', 'Peter Wainwright', 'A student who is trying.')"
    );
    await db.all(
        "INSERT INTO authors(id, name, bio) VALUES('3', 'Galen Long', 'An amazing professor.')"
    );
    await db.all(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('1', '1', 'My Fairest Lady', '1866', 'romance')"
    );
    let statement = await db.prepare(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)"
    );
    await statement.bind(["2", "1", "A Travelogue of Tales", "1867", "adventure"]);
    await statement.run();
    await db.all(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('3', '1', 'An Old Book', '1860', 'mystery')"
    );
    await db.all(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('4', '2', 'The Start of Peter', '1999', 'romance')"
    );
    await db.all(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('5', '2', 'The Life of Peter', '2023', 'adventure')"
    );
    await db.all(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('6', '2', 'The Death of Peter', '1999', 'horror')"
    );
    await db.all(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('7', '3', 'Coding for Beginers', '2013', 'education')"
    );
    await db.all(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('8', '3', 'How to Spell Beginners', '2014', 'horror')"
    );
    await db.all(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('9', '3', 'What Could Go Wrong?', '2020', 'horror')"
    );

    return res.sendStatus(200);

})

//
//
// GET REQUESTS
//
//

app.get("/all", async (req, res) => {
    let authors = await db.all("SELECT * FROM authors");
    console.log("Authors", authors);
    let books = await db.all("SELECT * FROM books");
    console.log("Books", books);

    //res.send("$1", [books]);
    return res.sendStatus(200);

});

app.get("/authors/all", async (req, res) => {
    let author = await db.all("SELECT * FROM authors");
    console.log("Authors", author);

    return res.json(author);
    //return res.sendStatus(200);

});

app.get("/books/all", async (req, res) => {
    let books = await db.all("SELECT * FROM books");
    console.log("Books", books);
    console.log("Books size: ", books.length)

    return res.json(books);
    //return res.sendStatus(200);

});



app.get("/books/genre", async (req, res) => {
    if (!req.query.genre){
        return res.status(400).json({ error: "Body is missing sections" });
    }

    let genre = req.query.genre;
    console.log(genre);

    try {
        let book = await db.all(
            "SELECT * FROM books WHERE genre = ?", genre
        )
        console.log("Sent a book");
        console.log(book);

        let parseResult = bookSchema.safeParse(book[0]);
        if(!parseResult.success) {
            return res.status(400).json({ message: "No books in that genre" });
        }

        return res.json(book)
    }
    catch (error) {
        console.log(error);
        //let send = {"message": error.response.data.message};
        res.status(400);
    }
    
    //return res.sendStatus(200);

});

app.get("/books/:id", async (req, res) => {
    if (!req.params.id){
        console.log("No body");
        return res.status(400).json({ error: "Body is missing sections" });
    }

    let id = req.params.id;
    console.log(id);

    let book = await db.all(
        "SELECT * FROM books WHERE id = ?", id
    );
    console.log("Sent a book");
    console.log(book)

    let parseResult = bookSchema.safeParse(book[0]);
    if(!parseResult.success) {
        return res.status(400).json({ message: "No book by that id" });
    }

    return res.json(book)
    //return res.sendStatus(200);

});


//
//
// POST REQUESTS
//
//


//This is just checking the value are there at the moment, make more advanced next
app.post("/book",async (req, res) => {
    if (!req.body.id || !req.body.author_id || !req.body.title || !req.body.pub_year || !req.body.genre){
        return res.status(400).json({ error: "Body is missing sections" });
    }

    let id = req.body.id;
    let author_id = req.body.author_id;
    let title = req.body.title;
    let pub_year = req.body.pub_year;
    let genre = req.body.genre;

    let parseResult = bookSchema.safeParse(req.body);
    if (!parseResult.success){
        return res.status(400).json({ error: "Book not sent properly"});
    }
    
    console.log(req.body);

    let statement = await db.prepare(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)"
    );
    await statement.bind([id, author_id, title, pub_year, genre]);
    try {
        await statement.run();
    }
    catch(error) {
        console.log(error);
        //let send = {"message": error.response.data.message};
        return res.status(400).json({ error: "Something went wrong" });
    };
    

    //console.log(title);
    console.log("Added a book");
    return res.sendStatus(200);
    
});

app.post("/author", async (req, res) => {
    if (!req.body.id || !req.body.name || !req.body.bio) {
        return res.status(400).json({ error: "Body is missing sections"});
    }

    let id = req.body.id;
    let name = req.body.name;
    let bio = req.body.bio;

    console.log(req.body);


    let statement = await db.prepare(
        "INSERT INTO authors(id, name, bio) VALUES (?, ?, ?)"
    );
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

app.delete("/all", async (req, res) => {
    let delBooks = await db.all(
        "DELETE FROM books"
    );
    let delAuths = await db.all(
        "DELETE FROM authors"
    );
    return res.sendStatus(200);
})

app.delete("/books/:id", async (req, res) => {
    let id = req.params.id;

    let book = await db.all(
        "SELECT * FROM books WHERE id = ?", id
    );
    console.log("Checking to see if book exsists");
    console.log(book)

    let checkBook = bookSchema.safeParse(book[0]);
    if(!checkBook.success) {
        return res.status(400).json({ message: "No book by that id" });
    }

    try {
    let statement = await db.all(
         "DELETE FROM books WHERE id = ?", id
    );
    }
    catch(error) {
        console.log(error);
    };
    
    console.log("Deleted a book");
    return res.sendStatus(200);
    return res.status(400).json({ error: "Body is missing sections"});
});

//Possibly also delete all books by the author
//Change so you can only delete if all the books are deleted
app.delete("/authors/:id", async (req, res) => {
    if (req.params.id) {
        let id = req.params.id;

        let getAuth = await db.prepare(
            "DELETE FROM books WHERE author_id = ?"
        );
        await getAuth.bind([id]);
        await getAuth.run();

        let statement = await db.prepare(
            "DELETE FROM authors WHERE id = (?)"
        );
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
    
    return res.status(400).json({ error: "Body is missing sections"});
});


//
//
// PUT REQUESTS
//
//

app.put("/book",async (req, res) => {
    if (!req.body.id || !req.body.author_id || !req.body.title || !req.body.pub_year || !req.body.genre){
        return res.status(400).json({ error: "Body is missing sections" });
    }

    let id = req.body.id;
    let author_id = req.body.author_id;
    let title = req.body.title;
    let pub_year = req.body.pub_year;
    let genre = req.body.genre;

    let parseResult = bookSchema.safeParse(req.body);
    if (!parseResult.success){
        return res.status(400).json({ message: "Book not sent properly"});
    }
    
    console.log(req.body);

    let book = await db.all(
        "SELECT * FROM books WHERE id = ?", id
    );
    console.log("Checking to see if book exsists");
    console.log(book)

    let checkBook = bookSchema.safeParse(book[0]);
    if(!checkBook.success) {
        return res.status(400).json({ message: "No book by that id" });
    }

    console.log(genre);

    try {
        //If the book does exsist then edit it
        let statement = await db.all(
            "UPDATE books SET id = ?, title = ?, author_id = ?, pub_year = ?, genre = ? WHERE id = ?", id, title, author_id, pub_year, genre, id
        );
    }
    catch(error) {
        console.log(error);
        //let send = {"message": error.response.data.message};
        return res.status(400).json(error);
    };
    

    //console.log(title);
    console.log("Edited a book");
    return res.sendStatus(200);
    
});



//
// ASYNC/AWAIT EXAMPLE
//

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// need async keyword on request handler to use await inside it
app.get("/bar", async (req, res: FooResponse) => {
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
