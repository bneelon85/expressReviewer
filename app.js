const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const body_parser = require('body-parser');
const pgp = require('pg-promise')({});
app.use(body_parser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(express.static('semantic'));
const db = pgp({database: 'restaurantv2', user: 'postgres'});

nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: true
});


app.get('/', function(request, response){
    var context = {title: 'Home Page'};
    response.render('home.html',context);
});

app.get('/search', function(request, response, next){
    var searchTerm = request.query.searchTerm;
    console.log(searchTerm);
    db.any('SELECT * FROM restaurant WHERE name ILIKE $1', ['%' + searchTerm + '%'])
    .then(function(results) {
        console.log(results);
        response.render('search.html', {restaurants: results});
    })
    .catch(function(error) {
        console.error("SEARCH ERROR: ", error);
        next(error);
    });
});


app.listen(8000, function () {
    console.log('Listening on port 8000');
});