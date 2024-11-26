const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventController');
const { fileUpload } = require('../middleware/fileUpload');
const { isLoggedIn, isAuthor } = require('../middleware/auth');
const { validateEvent, validateResult, validatersvp, validateId } = require('../middleware/validator');

router.get('/', controller.index);

router.get('/new', isLoggedIn, controller.new);

router.get('/:id', controller.show);

router.post('/create', isLoggedIn, fileUpload, validateEvent, validateResult, controller.create);

router.post('/:id/rsvp', isLoggedIn, validateId, validatersvp, validateResult, controller.rsvp);

router.get('/:id/edit', isAuthor, controller.edit);

router.put('/:id', isAuthor, fileUpload, validateEvent, validateResult, controller.update);

router.delete('/:id', isAuthor, controller.delete);

module.exports = router;