const faker = require("@faker-js/faker");
const express = require("express");
const mysql = require("mysql2");
const path = require("path")
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
 
const app = express();
const port = 8080;

app.use(methodOverride("_method")) // to setup patch request
app.use(express.urlencoded({extended:true})); // to parse form data which we receive from patch request;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Creating an app which can fetch data from database; Using EJS.
// Structure
// GET / on home route to show no. of users in DB
// GET /user show users (email, id, Username)
// PATCH /user/:id To edit usename;
// POST /user To add new user
// DELETE /user/:id To delete user(need pass to delete)

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "delta_app",
    password: "your_password"
})

let getRandomUser = () => {
    return [

        faker.StringModule.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password()
    ];
}

// Home Route
app.get("/", (req, res) => {
    let q = "SELECT count(*) FROM users";
    try {   
    connection.query(q, (err, result) => {
        if(err) throw err;
        let count = result[0]["count(*)"]
        res.render("home.ejs", {count})
    })
}

catch(err){
    console.log(err);
    res.send("Some Error in DB")
}

})


// Show Users Wala Route
app.get("/users", (req, res)=>{
    let q = `SELECT * FROM users`;

    try {   
        connection.query(q, (err, users) => {
            if(err) throw err;
            res.render("showUsers.ejs", {users});
        })
    }
    
    catch(err){
        console.log(err);
        res.send("Some Error in DB")
    }
})


// Edit Route
app.get("/users/:id/edit", (req, res)=> {
    let {id} = req.params; 
    let query = `SELECT * FROM users WHERE id = '${id}'`;
    try {   
        connection.query(query, (err, result) => {
            if(err) throw err;
            let user = result[0]
            res.render("edit.ejs", {user});
        })
    }
    
    catch(err){
        console.log(err);
        res.send("Some Error in DB")
    }
    
})

// Update Route
app.patch("/users/:id", (req, res)=>{
    let {id} = req.params;
    let {password: formPass, useName: newUsername} = req.body; 
    let query = `SELECT * FROM users WHERE id = '${id}'`;
    try {   
        connection.query(query, (err, result) => {
            if(err) throw err;
            let user = result[0];
            if(formPass != user.password){
                res.send("Wrong Password");
            }
            else{
                let q2 = `UPDATE users SET userName='${newUsername}' WHERE id = '${id}'`;

                connection.query(q2, (err, result)=> {
                    if(err) throw err;
                    res.redirect("/users");
                })
            }
        })
    }
    
    catch(err){
        console.log(err);
        res.send("Some Error in DB")
    }
})

// To Add new User
app.get("/users/new", (req, res) => {
    res.render("addUser.ejs");
  });
  
  app.post("/users/new", (req, res) => {
    let { username, email, password } = req.body;
    let id = uuidv4();
    //Query to Insert New User
    let q = `INSERT INTO users (id, userName, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        console.log("added new user");
        res.redirect("/users");
      });
    } catch (err) {
      res.send("some error occurred");
    }
  });
// To delete from DB

    app.delete("/users/:id/", (req, res) => {
        let { id } = req.params;
        let { password } = req.body;
        let q = `SELECT * FROM users WHERE id='${id}'`;
      
        try {
          connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
      
            if (user.password != password) {
              res.send("WRONG Password entered!");
            } else {
              let q2 = `DELETE FROM users WHERE id='${id}'`; //Query to Delete
              connection.query(q2, (err, result) => {
                if (err) throw err;
                else {
                  console.log(result);
                  console.log("deleted!");
                  res.redirect("/users");
                }
              });
            }
          });
        } catch (err) {
          res.send("some error with DB");
        }
      });



app.listen(port, ()=>{
    console.log(`app listening on post ${port}`);
})



