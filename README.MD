### express-validator

<p align="center">
  <img src="https://express-validator.github.io/img/logo-horizontal.svg" />
</p>

---

```bash
# Use the application generator tool, express-generator, to quickly create an application skeleton.
npx express-generator
```

```json
// Default dependencies on package.json
"dependencies": {
  "cookie-parser": "~1.4.4",
  "debug": "~2.6.9",
  "express": "~4.16.1",
  "http-errors": "~1.6.3",
  "morgan": "~1.9.1"
}
```

```bash
# Install the latest version
# Before doing that remove the entire dependencies object from package.json
npm i cookie-parser debug express http-errors morgan
```

```json
// After installing the latest version
"dependencies": {
  "cookie-parser": "^1.4.6",
  "debug": "^4.3.4",
  "express": "^4.19.2",
  "http-errors": "^2.0.0",
  "morgan": "^1.10.0"
}
```

```sh
# Update .gitignore
node_modules
package-lock.json
```

```bash
# Add nodemon as dev dependencies
# When we change anything in js file it will auto reload the application
# It will not work for www and .env file
npm i nodemon -D
```

```json
"devDependencies": {
  "nodemon": "^3.1.1"
}
```

```json
// Update start script with nodemon
"scripts": {
  "start": "nodemon ./bin/www"
}
```

```json
// Add node and npm version
"engines": {
  "node": ">= 20.9.0",
  "npm": ">= 10.1.0"
}
```

```bash
# Run the application
npm start
```

```bash
# Install the following packages
npm i express-validator http-errors moment
```

```js
// Add this block of code in app.js under error handler section for handling error message
// res.render('error');
res.json({
  status: false,
  error: { message: err.message },
});
```

---

#### Crate a `data/db.json` file for some dummy data

```bash
# to fetch the dummy data use the following command
npx json-server data/db.json --port 4000
```

---

#### Now follow the `routes/index.js`

---

#### Call the api from `api.rest`

---
