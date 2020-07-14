const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.urlencoded({ extended: false }));

let users = [
  {
    username: 'Admin',
    password: '123456',
  },
];

const ensureAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    req.user = jwt.verify(token, 'yay');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'You are not logged in.' });
  }
};

app.post('/login', (req, res, next) => {
  const user = users.find((user) => user.username === req.query.username);
  if (!user) return res.status(401).json({ message: 'Wrong username' });
  if (req.query.password === user.password) {
    const jwtToken = jwt.sign(
      {
        username: user.username,
      },
      'yay',
      {
        expiresIn: '1h',
      }
    );
    res.status(200).json({
      token: jwtToken,
      expiresIn: 3600,
      user: user.username,
    });
  } else {
    return res.status(401).json({ message: 'Wrong password' });
  }
});

app.get('/user', ensureAuthenticated, (req, res) => {
  return res.json({ message: `You have logged in as ${req.user.username}` });
});

const port = 1235;

app.listen(port, console.log(`Server started on port ${port}.`));
