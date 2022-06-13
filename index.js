const express = require("express")
const app = express();

const session = require("express-session");
const cookieParser = require('cookie-parser');

const flash = require("connect-flash");

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.urlencoded({extended: false, parameterLimit: 1000000, limit: '50mb'})); //Pegar dados dos forms ou Rotas
app.use(express.json({limit: '50mb'})); //Aceitar json
app.use(cookieParser())

const middleware = require('./panel/middleware')

const controllerLogin = require("./login/controllers/controllerLogin")
const controllerRegister = require("./login/controllers/controllerRegister")
/*  */
const controllerCertificates = require("./panel/controllers/controllerCertificates")

//sessions
app.use(session({
    secret: "qualu77asadasfdasth5ft!@#qualu77asadasfdasth5ft!@#", 
    name: "JCV-GROUP-CERTIFICATE", 
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 8000000}
}));

app.use(flash());

/* LOGIN */
app.get('/', (req,res) => {
    res.render("login/login", {registerFail: req.flash('registerFailedData')})
})
app.get('/auth/:uuid?', controllerLogin.moduleLoginExternal)

app.post("/login/action", controllerLogin.moduleLogin)
app.post("/login/register", controllerRegister.moduleRegister)
app.post("/login/recovery", controllerLogin.recoveryPass)

app.get("/certificate/:uuid?/:idUser?", controllerCertificates.moduleExportsCertificate)

const certificatePanel = require("./panel/app");
app.use("/painel", certificatePanel);

app.listen(5050, ()=> {
    console.log('')
    console.log('Central de certificados rodando')
    console.log('')
})