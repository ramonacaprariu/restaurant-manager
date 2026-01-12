# Restaurant Manager + Sessions

Express restaurant manager + ordering app with a dual HTML/JSON API, extended with MongoDB for user profiles, authentication/authorization, and sessions

## Project structure

- `restaurant-api-express/` — Express application that serves **HTML pages or JSON** and supports restaurant creation/editing plus an ordering workflow.
- `restaurant-orders-mongodb-sessions/` — Version extends to include **MongoDB-backed users, profiles, order history, privacy controls, and persistent sessions**.

## Features

### API (Express Restaurant Manager)
- Dual-mode responses (HTML or JSON) based on request's `Accept` header.  
- Navigation header links (`/`, `/restaurants`, `/addrestaurant`).  
- Routes for:
  - `GET /` (home)
  - `GET /restaurants` (list restaurants as HTML or JSON)
  - `GET /addrestaurant` (form page)
  - `POST /restaurants` (create restaurant from JSON)
  - `GET /restaurants/:restID` (view/edit restaurant as HTML or JSON)
  - `PUT /restaurants/:restID` (save updates from JSON)

### Sessions (MongoDB + User Sessions)
- MongoDB stores **user profiles, orders, and session data**.  
- Registration, login, user directory search, user profiles with order history, and individualized user privacy (public or private).  
- Order form protected (only logged-in users authenticated) and order details pages respect privacy rules.

### Prerequisites
- Node.js + npm
- MongoDB running locally

### Installation + Execution
Each folder is its own app:

```bash
cd restaurant-api-express/
npm install
npm start 
```
```bash
cd restaurant-orders-mongodb-sessions
node database-initializer.js
npm start
```
In both apps, the server listens on port 3000, so open in your browser: http://localhost:3000

### External Libraries Used
- Express
- Pug
- MongoDB Node.js Driver
- Express-session
- Connect-MongoDB-session
            

