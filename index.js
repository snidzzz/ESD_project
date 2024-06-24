
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
require('dotenv').config();


const authRoutes = require('./routes/auth-routes');
const schRoutes = require('./routes/schedule-routes');
const OrgAccount = require('./models/org');
const isAuth = require('./middleware/is-auth');


const MONGODB_URL = process.env.MONGODB_URL || process.env.DB_CONNECTION;

const PORT = process.env.PORT || 5050;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
};

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: 'sessions',
});

const csrfProtection = csrf({});


app.set('view engine', 'ejs');
app.set('views', 'views');



app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));


app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);


app.use(csrfProtection);


app.use((req, res, next) => {
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.org) {
    return next();
  }
  OrgAccount.findById(req.session.org._id)
    .then((org) => {
      
      if (!org) {
        return next();
      }
      req.org = org;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// set up headers
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET');
//   next();
// });

// set up routes
app.use('/schedule', isAuth, schRoutes);
app.use(authRoutes);

app.get('/', (req, res, next) => {
  res.render('home', {
    pageTitle: 'Home',
    msg: 'Welcome to the Scheduling App!',
    isAuthenticated: req.session.isLoggedIn,
  });
});


mongoose
  .connect(MONGODB_URL, options)
  .then((result) => {
    console.log(`Listening on ${PORT}`);
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
