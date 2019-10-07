const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/forgot-password', authController.getReset);

router.post('/forgot-password', authController.postReset);

router.get('/forgot-password/:resetToken', authController.getResetToken);

router.post('/new-password', authController.postResetPassword);


module.exports = router;