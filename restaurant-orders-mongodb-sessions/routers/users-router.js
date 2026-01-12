const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

const { requireLogin } = require("../auth");

//user search
router.get("/", async (req, res) => {
    const db = req.app.locals.db;
    const query = req.query.name || "";
    
    //getting all users
    const users = await db.collection("users")
        .find({ privacy: false }) //only public profiles to be shown
        .toArray();

    //now to filter based on name provided, case-insensitive, being part of users' names
    const filtered = users.filter(u => 
        u.username.toLowerCase().includes(query.toLowerCase()));
 
    res.render("users", { users: filtered, search: query }); //filtered users array and search term
});

//user profile
router.get("/:id", async (req, res) => {
    const db = req.app.locals.db;
    const id = req.params.id;

    let user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id) }); //need to create new MongoDB ObjectId object to find based on it

    if (!user) return res.status(404).send("User not found.");

    const isOwner = req.session.userId === id.toString(); //user searching's id matches the one who owns the profile page's id
    if (user.privacy && !isOwner) { //true is private
        return res.status(403).send("This profile is private.");
    }

    //load orders in user's history
    const orderIds = user.orderHistory || [];
    const orders = await db
        .collection("orders")
        .find({ _id: { $in: orderIds.map(id => new ObjectId(id)) } })
        .toArray();

    res.render("profile", {
        profileUser: user,
        orders,
        isOwner
    });
});

//privacy option
router.post("/:id/privacy", async (req, res) => {
    const db = req.app.locals.db;
    const id = req.params.id;

    console.log("BODY:", req.body);
    
    //req.body.privacy value is a str
    const privacyOption = req.body.privacy === "true";    

    // console.log(privacyOption);
    
    //update in db
    const isOwner = req.session.userId === id.toString(); //user searching's id matches the one who owns the profile page's id
    let result;
    if (isOwner) {
        result = await db.collection("users").updateOne(
            { _id: new ObjectId(id) }, //using the id given
            { $set: { privacy: privacyOption } }
        );
    }

    console.log("UPDATE RESULT:", result);
    
    res.redirect(`/users/${id}`);
});

module.exports = router;