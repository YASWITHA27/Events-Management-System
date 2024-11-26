const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middleware/auth');
const { logInLimiter } = require('../middleware/rateLimiters');
const { validateLogIn, validateSignUp, validateResult } = require('../middleware/validator');
router.get('/new', isGuest, controller.new);

router.post('/', isGuest, validateSignUp, validateResult, controller.create);

router.get('/login', isGuest, controller.getUserLogin);

router.post('/login', logInLimiter, isGuest, validateLogIn, validateResult, controller.login);

router.get('/profile', controller.profile);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;