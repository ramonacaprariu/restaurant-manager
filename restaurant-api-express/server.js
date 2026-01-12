const express = require('express');
const path = require('path');
const fs = require("fs");
const app = express();

app.use(express.json());
//app.locals -- a storage for local server information
app.locals.config = require("./config.json");
app.set('view engine', 'pug');
// app.set('views', './views');
app.use(express.static("public"));

function loadRestaurants(req, res, next) {
    let results = [];
    const dir = path.join(".", req.app.locals.config.restaurantsDir);
    //reading files in the directory
    fs.readdir(dir, function(err, items) {
        if (err) return next(err); //onto next error handler
        let count = 0;
        //empty directory
        if (items.length == 0) {
            res.restaurants = [];
            return next();
        }
        //For each product file
        for (let fileNum=0; fileNum < items.length; fileNum++) {
            //Read the products data and create an object
            let data = fs.readFileSync(path.join(".", req.app.locals.config.restaurantsDir, items[fileNum]));
            let restaurant = JSON.parse(data);
            results.push(restaurant);
            count++;
            }
        //Set the property to be used in the response
        res.restaurants = results;
        next();
        });
}

app.get('/', function(req, res, next) {
    res.render('index', { title: 'Home Page', message: 'Welcome to the home page!'});
});

app.get('/restaurants', loadRestaurants, function(req, res, next) {
    const restaurants = res.restaurants;
    if (req.accepts('html')) {
        // console.log(res.restaurants);
        res.render('restaurants', { title : 'Restaurants', restaurants: res.restaurants});
    }
    //else if statement in the case a req specifies both in header
    else if (req.accepts('json')) {
        // res.setHeader('Content-Type', 'application/json');
        let ids = [];
        restaurants.forEach(restaurant => {
            ids.push(restaurant.id);
        });
        res.json({restaurants: ids}); //JS object literal
    }
});

app.get('/addrestaurant', function(req, res, next) {
    res.render('addrestaurant', { title: 'Add a Restaurant'});
});

app.post('/restaurants', function(req, res, next) {
    let restaurant = req.body;
    //checking if empty, missing, null
    if (!restaurant.name || restaurant.delivery_fee == null || restaurant.min_order == null) {
        return res.status(400).json({ error: "Required input missing" });
    }
    restaurant.menu = restaurant.menu || {};
    restaurant.id = req.app.locals.config.nextRestaurantID;
    req.app.locals.config.nextRestaurantID++;
    fs.writeFileSync("config.json", JSON.stringify(req.app.locals.config));
    fs.writeFileSync(path.join(".", req.app.locals.config.restaurantsDir, restaurant.id + ".json"), JSON.stringify(restaurant));
    return res.status(201).json(restaurant);
});

app.get('/restaurants/:restID', function(req, res, next) {
    let restaurant = null;
    const dir = path.join(".", req.app.locals.config.restaurantsDir);
    const id = req.params.restID;

    //in the case the restaurant is newly added
    let idPath = path.join(dir, id + ".json");
    if (fs.existsSync(idPath)) {
        let data = fs.readFileSync(idPath);
        restaurant = JSON.parse(data);
    } else { //in the case the restaurant is one of the originally provided (thus 'name' file)
        let files = fs.readdirSync(dir);
        for (let file of files) { //'of' for values in array, 'in' for keys in array
            let data = fs.readFileSync(path.join(dir, file));
            let fileObj = JSON.parse(data);

            if (fileObj.id == id) {
                restaurant = fileObj;
                break;
            }
        }
    }

    //restaurant stayed null
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found in directory" });
    }

    restaurant.menu = restaurant.menu || {};

    //onto handling the accepts type:
    if (req.accepts('html')) {
        return res.render('restaurant', { restaurant : restaurant})
    } else if (req.accepts('json')) {
        // let data = fs.readFileSync(path.join(".", req.app.locals.config.restaurantsDir, req.params.restID + ".json"));
        // let restaurant = JSON.parse(data);
        res.status(200).json(restaurant);
    }
});

app.put("/restaurants/:restID", function(req, res, next) {
    let updatedRestaurant = req.body;
    const dir = path.join(".", req.app.locals.config.restaurantsDir);
    const id = req.params.restID;

    //similar verification as to above
    if (!updatedRestaurant.name || updatedRestaurant.delivery_fee == null || updatedRestaurant.min_order == null) {
        return res.status(400).json({ error: "Required input missing" });
    }

    updatedRestaurant.menu = updatedRestaurant.menu || {};

    let restoFile = null;
    //in the case the restaurant is newly added
    let idPath = path.join(dir, id + ".json");
    if (fs.existsSync(idPath)) {
        restoFile = idPath;
    } else { //in the case the restaurant is one of the originally provided (thus 'name' file)
        let files = fs.readdirSync(dir);
        for (let file of files) { //'of' for values in array, 'in' for keys in array
            let data = fs.readFileSync(path.join(dir, file));
            let fileObj = JSON.parse(data);

            if (fileObj.id == id) {
                restoFile = path.join(dir, file);
                break;
            }
        }
    }
    //restoFile stayed null
    if (!restoFile) {
        return res.status(404).json({ error: "Restaurant ID error" });
    }
    
    // let filePath = path.join(".", req.app.locals.config.restaurantsDir, restaurant.id + ".json");
    fs.writeFileSync(restoFile, JSON.stringify(updatedRestaurant));

    res.status(200).json({ status: "OK" });

});

//for the invalid routes
app.use((req, res) => {
    res.status(404).send("Route not found");
});

app.listen(3000);
console.log('Listening on http://localhost:3000');