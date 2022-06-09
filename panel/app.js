const express = require("express");
const router = express.Router();
const database = require('./database');//Database do painel de ceritificados
const databasePanel = require('./database');//DAtabase do painel do JCV GROUP

const middleware = require('./middleware')
const controllerHome = require('./controllers/controllerHome')

router.get('/', middleware, controllerHome.moduleHOmne)

router.get('/logout', (req,res) => { 
    req.session.cookieLoginPanelCertificate = undefined;
    res.redirect("/");
})

router.post('/account/save', middleware, controllerHome.saveProfile)

module.exports = router;