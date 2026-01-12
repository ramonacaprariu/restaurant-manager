const { ObjectId } = require("mongodb");

function auth(req, res, next) {
  //check: is there a loggedIn property for this session
  if(!req.session.loggedIn){
      res.status(401).send("Unauthorized");
      return;
  }

  next();
};



//If the username and password match somebody in our database,
// then create a new session ID and save it in the database.
//That session ID will be associated with the requesting user
//using mongoDB users collection
async function login(req, res){
  if(req.session.loggedIn){
      res.status(200).send("Already logged in.");
      return;
  }

  const db = req.app.locals.db;
  const { username, password } = req.body;
  const user = await db.collection("users").findOne({ username });

  if (!user || user.password !== password) { //not matching existing user credentials in db
      return res.status(401).render("login", {
          error: "Invalid username or password"
      });
  }

  //set session for successful login
  req.session.loggedIn = true;
  req.session.username = username;
  req.session.userId = user._id.toString();

  req.session.save(err => {
    if (err) return res.status(500).send("Session save error");
    res.redirect(`/users/${user._id}`);
  });
  // res.redirect(`/users/${user._id}`); //redirect to user's profile page
}



//undoing; so getting rid of the values we set and indicate the person is NOT loggedin
function logout(req, res, next){
  if (req.session.loggedIn) { 
          req.session.destroy(err => {
              if (err) return res.status(500).send("Logout failed.");
              res.redirect("/");      
          });
      } else {
          res.redirect("/");
    }
}



module.exports = {
  requireLogin: auth,
  login,
  logout
};
