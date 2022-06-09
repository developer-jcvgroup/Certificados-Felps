const database = require("./database")
const databasePanel = require('./databasePanel');

authenticate = async (req, res, next) => {

    if(req.session.cookieLoginPanelCertificate != undefined){
        //Login aceito

        const idUser = req.session.cookieLoginPanelCertificate

        //Pegando todos os dados do usuario
        const allInfo = await database
        .select()
        .where({jcv_user_id: idUser})
        .table("jcv_users")
        .then( data => {return data})

        global.DASH_INFO = [
            idUser,
            allInfo
        ]

        //Verificando se a conta é de origem no portal JCV GROUP
        const getValidation = await databasePanel
        .select()
        .where({jcv_userCpf: allInfo[0].jcv_users_cpf})
        .table("jcv_users")
        .then( data => {
            if(data != ''){
                return true
            }else{
                return false
            }
        })

        global.USER_ORIGIN = getValidation

        //console.log(getValidation)

        next()
    }else{
        //Logue-se
        res.redirect('/')
    }

}

module.exports = authenticate;