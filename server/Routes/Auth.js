const express = require('express');

const AuthController = require('../Controllers/Auth');
const verifyJWT = require('../Middlewares/verifyJWT');

const router = express.Router();

router.route('/register').post(AuthController.register);
router.route('/login-status').get(AuthController.loginStatus);
router.route('/login').post(AuthController.login);
router.route('/refresh').get(AuthController.refreshAccessToken);
router.route('/logout').get(verifyJWT, AuthController.logout);

module.exports = router;
