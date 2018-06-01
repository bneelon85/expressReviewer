const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const body_parser = require('body-parser');
const pgp = require('pg-promise')({});
app.use(body_parser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static('semantic'));
const db = pgp({ database: 'restaurantv2', user: 'postgres' });

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true
});

function capital_letter(str) {
    str = str.split(" ");

    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }

    return str.join(" ");
}



app.get('/', function(request, response) {
    var context = { title: 'Home Page' };
    response.render('home.html', context);
});

app.get('/search', function(request, response, next) {
    var searchTerm = request.query.searchTerm;
    console.log(searchTerm);
    db.any('SELECT * FROM restaurant WHERE name ILIKE $1', ['%' + searchTerm + '%'])
        .then(function(results) {
            console.log(results);
            response.render('search.html', { restaurants: results });
        })
        .catch(function(error) {
            console.error("SEARCH ERROR: ", error);
            next(error);
        });
});

app.get('/restaurant/:id', function(request, response, next) {
    var restID = request.params.id;
    //fetchReviews(restID)
    db.any('SELECT restaurant.id as r_id, restaurant.name as r_name, restaurant.address as r_address,restaurant.category as r_category,review.title as rev_title, review.review as rev_review, review.stars as rev_stars,reviewer.name as person_name FROM restaurant LEFT OUTER JOIN review ON review.restaurant_id = restaurant.id LEFT OUTER JOIN reviewer ON review.reviewer_id = reviewer.id WHERE restaurant.id = $1', [restID])
        .then(function(results) {
            console.log(results);
            if (results.length == 0) {
                response.status(404);
                response.send('404');
            } else {
                var result = results[0];
                var category = capital_letter(results[0].r_category);
                response.render('restaurant.html', { restaurant: result, restaurants:results ,category: category });
            }
        })
        .catch(function(error) {
            console.error("SEARCH ERROR: ", error);
            next(error);
        });
});

app.post('/reviews', function(request, response) {
  var input = request.body.review;
  var star = request.body.stars;
  var title = request.body.title;
  var id = request.body.restaurantId;
  console.log(input+star+title+id);
  var q = "INSERT INTO review VALUES (default,NULL,$1,$2,$3,$4)"
  //console.log(typeof(input));
  db.result(q, [star, title, input, id])
  .then(function(result) {
    //console.log(result);
    });
   response.redirect('/restaurant/'+id);
});


app.listen(8000, function() {
    console.log('Listening on port 8000');
});
