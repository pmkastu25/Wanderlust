const express = require('express');
const data = require('./data');

// Initialize App
const app = express();

// Assign route
app.use('/', (req, res, next) => {
    const filters = req.query;
    console.log(req.query)
    // const filteredUsers = data.filter(user => {
    //     let isValid = true;
    //     for (key in filters) {
    //         console.log(key, user[key], filters[key]);
    //         isValid = isValid && user[key] == filters[key];
    //     }
    //     return isValid;
    // });
    // res.send(filteredUsers);
});

// Start server on PORT 5000
app.listen(5000, () => {
  console.log('Server started!');
});