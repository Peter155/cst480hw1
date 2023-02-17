CREATE TABLE books (
    id TEXT PRIMARY KEY, -- can change to be integer if you want
    author_id TEXT,
    title TEXT,
    pub_year TEXT,
    genre TEXT,
    FOREIGN KEY(author_id) REFERENCES authors(id)
);

CREATE TABLE authors (
    id TEXT PRIMARY KEY, -- can change to be integer if you want
    name TEXT,
    bio TEXT
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT
);

-- password
INSERT INTO users(username, password) VALUES ('admin', '$argon2id$v=19$m=65536,t=3,p=4$0toyJJQ6Xdv5rUQq1cCoCQ$hYs/2qQrQDy4gld9v4fy0kiQnBzpAu/FWyJgyTq3Ito');

-- abc
INSERT INTO users(username, password) VALUES ('applesauce', '$argon2id$v=19$m=65536,t=3,p=4$aet/Up/t2f9Bu8teKj5SZA$KTYJ35q136nHVyphnqR3Zs9an5gS0hn1inw5YUoi8TU');

-- fiddlesticks
INSERT INTO users(username, password) VALUES ('bananabread', '$argon2id$v=19$m=65536,t=3,p=4$KwUDBdwmyFhYtFmdiUI+Nw$aVYp48DsGXYrBYMELdUbj4iO89eS8BwOhK9OPhYHQOE');

-- correcthorsebatterystaple
INSERT INTO users(username, password) VALUES ('coconutcake', '$argon2id$v=19$m=65536,t=3,p=4$A2+TzjOmpPShDeSaGiBjEg$zf1NFDQYKZWHXhge/f9ZhjrmmnzQ8v8q4UWHXX75SMI');
