var ejs = require("ejs");
const moment = require("moment");
moment.locale('pt-BR');
//moment.tz.setDefault('America/Sao_Paulo');

//Data atual
function generateDate(){
    moment.locale('pt-br');
    return moment().format('LT')+" "+moment().format('L')
}

exports.sendMailExe = async (sysEmails, subTitleEmail, titleBodyMail, sysApp, sysNameUser, sysMailTextOne, sysMailTextTwo) => {

    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
        host: "smtp.vitorstudio.com.br",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "nao-responda=vitorstudio.com.br",
            pass: "!@#naoresponda123"
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 5 * 60 * 1000, // 5 min
    });

    const data = await ejs.renderFile('views/src/padraoEmail.ejs', 
    { 
        titleBodyMail: titleBodyMail,
        sysApp: sysApp,
        sysNameUser: sysNameUser,
        sysMailTextOne: sysMailTextOne,
        sysMailTextTwo: sysMailTextTwo
    });

    const mainOptions = {
        from: 'Sistema | JCV GROUP nao-responda@vitorstudio.com.br',
        to: sysEmails,
        subject: subTitleEmail,
        html: data
    };

    transporter.sendMail(mainOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response + ' | '+generateDate());
        }
    });
    
}