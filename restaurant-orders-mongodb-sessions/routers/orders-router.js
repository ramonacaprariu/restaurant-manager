const express = require("express");
const { ObjectId } = require("mongodb");
const path = require("path");
const router = express.Router();

const { requireLogin } = require("../auth");

// following require users to be logged in, passing auth.js middleware
//order form
router.get("/orderform", requireLogin, (req, res) => {
    // res.sendFile("orderform.html", { root: path.join(__dirname, "../public") });
    res.render("orderform"); //orderform
});

//submit order
router.post("/", requireLogin, async (req, res) => {
    const db = req.app.locals.db;
    const orderData = req.body; //whats being sent by orderform.js
    const userId = req.session.userId; //userId thats logged in currently

    //insert order into the orders collection
    const result = await db.collection("orders").insertOne({
        userId: new ObjectId(userId),
        ...orderData //all the contained object info
    });
    //result document returned by mongoDB has an 'acknowledged' boolean and 'insertedId' field of the 
    //newly inserted document's id

    //add to user history, in the users collection
    await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $push: { orderHistory: result.insertedId } }
    );

    res.send("Order successfully placed!");
});

//order summary
router.get("/:orderId", async (req, res) => {
    const db = req.app.locals.db;
    const orderId = req.params.orderId;

    const order = await db
        .collection("orders")
        .findOne({ _id: new ObjectId(orderId) });

    if (!order) return res.status(404).send("Order not found");

    const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(order.userId) });

    const isOwner = order.userId.equals(req.session.userId);

    //private = true && !notOwner
    if (user.privacy && !isOwner) {
        return res.status(403).send("This user's orders are private.");
    }

    res.render("order", { orderId, order, items: order.order, user });
});

module.exports = router;