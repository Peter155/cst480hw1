import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { application } from 'express';
//Yah just gonna write everything in here
//<img src={logo} className="App-logo" alt="logo" />

function App() {
  return (
    <div className="App">
      <header className="App-header"> 
      <h3>Books Website</h3>
        <div>
          <h5>Add Book</h5>
          <p>
            <label>Id</label>
            <input id="bookID" type="number" />
          </p>
          <p>
            <label>Title</label>
            <input id="bookTitle" type="text" />
          </p>
          <p>
            <label>Author ID</label>
            <input id="authorID" type="number" />
          </p>
          <p>
            <label>Pub Year</label>
            <input id="bookPubYear" type="number" />
          </p>
          <p>
            <label>Genre:</label>
	          <select id="genre" name="genre">
		          <option value="">Genre</option>
		          <option value="romance">romance</option>
		          <option value="horror">horror</option>
		          <option value="mystery">fantasy</option>
		          <option value="fantasy">mystery</option>
	          </select>
          </p>
          <p>
            <AddBooksButton2 />
          </p>
        </div>
        <div>
          <h5>Add Author</h5>
          <p>
            <label>Id</label>
            <input id="author_ID" type="number" />
          </p>
          <p>
            <label>Name</label>
            <input id="authorName" type="text" />
          </p>
          <p>
            <label>Author ID</label>
            <input id="authorBio" type="text" />
          </p>
          <AddAuthorButton />
        </div>
        <div>
          <h5>Search Books</h5>
          <p>
            <label>Genre:</label>
	          <select id="genreSearch" name="genre">
		          <option value="">Genre</option>
		          <option value="romance">romance</option>
		          <option value="horror">horror</option>
		          <option value="mystery">fantasy</option>
		          <option value="fantasy">mystery</option>
	          </select>
          </p>
          <p><SearchGenre /></p>
        </div>
        <GetBooksButton2 />
        <GetAuthorsButton />
        
        <table className="App-table" id="books_table">
          <th>ID</th>
          <th>Title</th>
          <th>Year</th>
          <th>Genre</th>
        </table>
        <table className="App-table" id="authors_table">
          <th>ID</th>
          <th>Name</th>
          <th>Bio</th>
        </table>
      </header>
    </div>
  );
}

function GetBooksButton() {
  function handleClick() {
    console.log('Clicked!');
    fetch("/books/all").then((response) => {
      console.log(response.status);
      return response.json();
  }).then(body => {
    var table = document.getElementById("books_table");
    let newTable = "<th>ID</th><th>Title</th><th>Year</th><th>Genre</th>";
    body.forEach((element: { id: any; author_id: any; title: any; pub_year: any; genre: any; }) => {
      let id = element.id;
      let author_id = element.author_id;
      let title = element.title;
      let pub_year = element.pub_year;
      let genre = element.genre;
      console.log("Id: ", id, " author_id: ", author_id, " title: ", title, " pub year: ", pub_year, " genre: ", genre);
      newTable += "<tr><td>"+id+"</td><td>"+title+"</td><td>"+pub_year+"</td><td>"+genre+"</td></tr>";
    });
    table!.innerHTML = newTable;
  }).catch(error => {
      console.log(error);
    });
  }

  return (
    <button onClick={handleClick}>Get All Books Old</button>
  );
}

function AddBooksButton() {
  function handleClick() {
    console.log('Clicked!');
    fetch("/add/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({id: "3", author_id: "1", title: "Please Work", pub_year: "1999", genre: "horror"}),
    }).then(response => {
      console.log("Response received:", response.status);
      return response.json();
    }).catch(error => {
      console.log(error);
    });
  }

  return (
    <button onClick={handleClick}>Add the pre-written book</button>
  );
}

function AddBooksButton2() {
  function handleClick() {
    var id = (document.getElementById("bookID") as HTMLInputElement);
    let title = (document.getElementById("bookTitle") as HTMLInputElement);
    let author_id = (document.getElementById("authorID") as HTMLInputElement);
    let pub_year = (document.getElementById("bookPubYear") as HTMLInputElement);
    let genre = (document.getElementById("genre") as HTMLSelectElement);
    let Genre = genre.options[genre.selectedIndex].text;
    console.log('Clicked!');
    console.log('id: ' + id.value);
    fetch("/add/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({id: id.value, author_id: author_id.value, title: title.value, pub_year: pub_year.value, genre: Genre}),
    }).then(response => {
      console.log("Response received:", response.status);
      return response.json();
    }).catch(error => {
      console.log(error);
    });
  }

  return (
    <button onClick={handleClick}>Add the input book</button>
  );
}

function AddAuthorButton() {
  function handleClick() {
    var id = (document.getElementById("author_ID") as HTMLInputElement);
    let name = (document.getElementById("authorName") as HTMLInputElement);
    let bio = (document.getElementById("authorBio") as HTMLInputElement);
    console.log('Clicked!');
    console.log('id: ' + id.value);
    fetch("/add/author", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({id: id.value, name: name.value, bio: bio.value}),
    }).then(response => {
      console.log("Response received:", response.status);
      return response.json();
    }).catch(error => {
      console.log(error);
    });
  }

  return (
    <button onClick={handleClick}>Add the input author</button>
  );
}

function GetBooksButton2() {
  const [books, setBooks] = useState([]);

  useEffect(() => {

    var table = document.getElementById("books_table");
    let newTable = "<th>ID</th><th>Title</th><th>Year</th><th>Genre</th>";
    books.forEach((element: { id: any; author_id: any; title: any; pub_year: any; genre: any; }) => {
      let id = element.id;
      let author_id = element.author_id;
      let title = element.title;
      let pub_year = element.pub_year;
      let genre = element.genre;
      console.log("Id: ", id, " author_id: ", author_id, " title: ", title, " pub year: ", pub_year, " genre: ", genre);
      newTable += "<tr><td>"+id+"</td><td>"+title+"</td><td>"+pub_year+"</td><td>"+genre+"</td></tr>";
    });
    table!.innerHTML = newTable;
  });


  function handleClick() {
    console.log('Clicked!');
    fetch("/books/all").then((response) => {
      console.log(response.status);
      return response.json();
  }).then(body => {
    setBooks(body);
  }).catch(error => {
      console.log(error);
    });
  }

  return (
    <button onClick={handleClick}>Get All Books</button>
  );
}

function SearchGenre() {
  const [books, setBooks] = useState([]);

  useEffect(() => {

    var table = document.getElementById("books_table");
    let newTable = "<th>ID</th><th>Title</th><th>Year</th><th>Genre</th>";
    books.forEach((element: { id: any; author_id: any; title: any; pub_year: any; genre: any; }) => {
      let id = element.id;
      let author_id = element.author_id;
      let title = element.title;
      let pub_year = element.pub_year;
      let genre = element.genre;
      console.log("Id: ", id, " author_id: ", author_id, " title: ", title, " pub year: ", pub_year, " genre: ", genre);
      newTable += "<tr><td>"+id+"</td><td>"+title+"</td><td>"+pub_year+"</td><td>"+genre+"</td></tr>";
    });
    table!.innerHTML = newTable;
  });


  function handleClick() {
    console.log('Clicked!');
    let genre = (document.getElementById("genreSearch") as HTMLSelectElement);
    let Genre = genre.options[genre.selectedIndex].text;
    fetch("/books/genre?genre="+Genre).then((response) => {
      
      console.log(response.status);
      return response.json();
  }).then(body => {
    setBooks(body);
  }).catch(error => {
      console.log(error);
    });
  }

  return (
    <button onClick={handleClick}>Search Genre</button>
  );
}



function GetAuthorsButton() {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {

    var table = document.getElementById("authors_table");
    let newTable = "<th>ID</th><th>Name</th><th>Bio</th>";
    authors.forEach((element: { id: any; name: any; bio: any; }) => {
      let id = element.id;
      let name = element.name;
      let bio = element.bio;
      console.log("Id: ", id, " Name: ", name, " Bio: ", bio );
      newTable += "<tr><td>"+id+"</td><td>"+name+"</td><td>"+bio+"</td></tr>";
    });
    table!.innerHTML = newTable;
  });


  function handleClick() {
    console.log('Clicked!');
    fetch("/authors/all").then((response) => {
      console.log(response.status);
      return response.json();
  }).then(body => {
    setAuthors(body);
  }).catch(error => {
      console.log(error);
    });
  }

  return (
    <button onClick={handleClick}>Get All Authors</button>
  );

}


function Example() {
  const [books, getbooks] = useState(0);

  useEffect(() => {
    document.title = 'You clicked ' + books + ' times';
  })

  return (
    <div>
      <p>You clicked {books} times</p>
      <button onClick={() => getbooks(books + 1)}>Click me</button>
    </div>
  );
}

function Authors() {
  const [authors, setAuthors] = useState([""]);

  return (
    <div>
      <p>You clicked {authors} times</p>
      <button onClick={() => setAuthors(["hello"])}>Get Authors</button>
    </div>
  );
}

export default App;