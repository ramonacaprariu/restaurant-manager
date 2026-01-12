const express = require("express");
const path = require("path");
const config = require("./config.json");
const { MongoClient, ObjectId } = require("mongodb"); //gives us: const mc = require("mongodb").MongoClient;
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const { requireLogin, login, logout } = require("./auth"); 
const app = express();

//create the new mongo store, using the database we have been
//using already, and the collection sessiondata
const store = new MongoDBStore({
    //uri consists of mongoURL: "mongodb://localhost:27017/"
    //and the database name "a4"
    uri: 'mongodb://localhost:27017/a4',
    collection: 'sessiondata' });


//set up session handling
app.use(session({ 
    secret:'shh', 
    store: store,
    resave: false,               //express requires this field
    saveUninitialized: false     //and this one
})); 


//express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // static files

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//session state into local response object
//simplifies passing info to pug and not need so many req.session.___ being passes
app.use((req, res, next) => {
    res.locals.loggedIn = req.session.loggedIn;
    res.locals.username = req.session.username;
    res.locals.userId = req.session.userId;
    next();
});


//defining the routes, prior to server starting with app.listen():
//homepage
app.get("/", (req, res) => {
    res.render("home");
});

//auth.js function usage
//login
app.get("/login", (req, res) => {
    if (req.session.loggedIn) return res.redirect("/");
    res.render("login");
});
app.post("/login", login);

//logout
app.get("/logout", logout);


//register
app.get("/register", (req, res) => {
    if (req.session.loggedIn) return res.redirect("/");
    res.render("register");
});
app.post("/register", async (req, res) => {
    const db = req.app.locals.db;
    const { username, password } = req.body;

    const existing = await db.collection("users").findOne({ username });
    if (existing) {
        return res.render("register", {
            error: "Error: Username already exists"
        });
    }

    //addition of new user in users collection
    const result = await db.collection("users").insertOne({
        username,
        password,
        privacy: false, //starting with a public profile
        orderHistory: []
    });

    //set session for successful registration/login
    req.session.loggedIn = true;
    req.session.username = username;
    req.session.userId = result.insertedId.toString();

    res.redirect(`/users/${result.insertedId}`);
});

//routers:
let ordersRouter = require("./routers/orders-router.js");
app.use("/orders", ordersRouter)
let usersRouters = require("./routers/users-router.js");
app.use("/users", usersRouters);


//connect to database
MongoClient.connect("mongodb://localhost:27017").then(function(client) {
    app.locals.db = client.db("a4"); //attaching database to the express app object, to remember db connection
	app.locals.config = config; 

	//only start listening now, when we know the database is available
	app.listen(3000, ()=>console.log("Server listening on port 3000"));
}).catch(function(err) {
	console.log("Error in connecting to database");
	console.log(err);
	return;
});


//errors route
app.use((req, res) => {
    res.status(404).send("Page not found.");
});


// app.listen(3000, () => {
//     console.log("Server running at http://localhost:3000");
// });
