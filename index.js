const express = require('express');
const session = require('express-session');
const passport = require('passport');

const LocalStrategy = require('passport-local');

const app = express();

let users = [
  {
    username: 'Admin',
    password: '123456',
  },
];

passport.use(
  new LocalStrategy((username, password, done) => {
    const user = users.find((user) => user.username === username);
    if (!user) return done(null, false, { message: 'Wrong username.' });
    if (password === user.password) return done(null, user);
    else return done(null, false, { message: 'Wrong password.' });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  const user = users.find((user) => user.username === username);
  return done(null, user);
});

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'You are not logged in.' });
};

app.use(express.urlencoded({ extended: false }));

app.use(session({ secret: 'Yay', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.post('/login/local', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: 'You are not logged in.' });
    else
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect('/user');
      });
  })(req, res, next);
});

app.get('/logout', ensureAuthenticated, (req, res) => {
  req.logOut();
  return res.json('You haved logged out.');
});

app.get('/user', ensureAuthenticated, (req, res) => {
  return res.json(`You have logged in as ${req.user.username}`);
});

const port = 1235;

app.listen(port, console.log(`Server started on port ${port}.`));
