// controllers/usersController.js
const usersStorage = require('../storages/usersStorage');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateUser = [
  body('firstName')
    .trim()
    .isAlpha().withMessage('First name must only contain letters.')
    .isLength({ min: 1, max: 10 }).withMessage('First name must be between 1 and 10 characters.'),
  body('lastName')
    .trim()
    .isAlpha().withMessage('Last name must only contain letters.')
    .isLength({ min: 1, max: 10 }).withMessage('Last name must be between 1 and 10 characters.'),
  body('email')
    .isEmail().withMessage('Email must be a valid email address.'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 120 }).withMessage('Age must be a number between 18 and 120.'),
  body('bio')
    .optional()
    .isLength({ max: 200 }).withMessage('Bio must be a maximum of 200 characters.')
];

// Controller functions
exports.usersListGet = (req, res) => {
  res.render('index', {
    title: 'User list',
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render('createUser', {
    title: 'Create user',
  });
};

exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('createUser', {
        title: 'Create user',
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, age, bio } = req.body;
    usersStorage.addUser({ firstName, lastName, email, age, bio });
    res.redirect('/');
  }
];

exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);
  res.render('updateUser', {
    title: 'Update user',
    user: user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const user = usersStorage.getUser(req.params.id);
      return res.status(400).render('updateUser', {
        title: 'Update user',
        user: user,
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, age, bio } = req.body;
    usersStorage.updateUser(req.params.id, { firstName, lastName, email, age, bio });
    res.redirect('/');
  }
];

exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect('/');
};

// Search function
exports.usersSearchGet = (req, res) => {
  const { name, email } = req.query;
  const users = usersStorage.getUsers();

  // Filter users based on query parameters
  const filteredUsers = users.filter(user => {
    const matchesName = name ? `${user.firstName} ${user.lastName}`.toLowerCase().includes(name.toLowerCase()) : true;
    const matchesEmail = email ? user.email.toLowerCase().includes(email.toLowerCase()) : true;
    return matchesName && matchesEmail;
  });

  res.render('searchResults', {
    title: 'Search Results',
    users: filteredUsers,
  });
};
