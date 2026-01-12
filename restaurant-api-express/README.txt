Project Details
    Name: Ramona Caprariu
    
Files Included
    config.json
    package-lock.json
    package.json
    public
        addrestaurant.js
        changerestaurant.js
    restaurants
        aragorn.json
        frodo.json
        legolas.json
    server.js
    views     
        addrestaurant.pug
        index.pug
        layout.pug
        restaurant.pug
        restaurants.pug
        
Instructions
    To download the dependencies listed in the package.json file, run:
        npm install 
    
Running the Server
    To start the application, use either:
        npm start 
        or
        node server.js
    The server listens on port 3000, so open in your browser:
        http://localhost:3000
    
External Libraries Used
    Express (web server)
    Pug (template engine)

Notes
    Inclusion of a config.json that increments restaurant IDs and defines the directory restaurantsDir 
        