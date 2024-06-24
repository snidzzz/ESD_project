
const express = require('express');


const authCtrl = require('../controllers/auth-ctrl');


const router = express.Router();




router.get('/login', authCtrl.getLogin);


router.post('/login', authCtrl.postLogin);


router.get('/register', authCtrl.getRegister);


router.post('/register', authCtrl.postRegister);


router.post('/logout', authCtrl.postLogout);

module.exports = router;
