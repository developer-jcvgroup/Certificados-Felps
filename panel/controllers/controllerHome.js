const database = require('../database');//Database do painel de ceritificados
const databasePanel = require('../databasePanel');//Database do painel JCV
const bcripty = require('bcrypt')

exports.moduleHOmne = async (req,res) => {

    //Listando todos os certificados do usuario
    const getAllCertificates = await database
    .select()
    .whereRaw(`JSON_CONTAINS(jcv_course_array_users, '${DASH_INFO[0]}', '$') AND jcv_course_status = 4`)
    .orderBy("jcv_course_id","DESC")
    .table("jcv_course")
    .then(data => {return data})

    //Pegando os instrutores
    let arrayIntructors = getAllCertificates.map(function(value){
        return parseInt(value.jcv_course_manager_course);
    })

    //Pegando todos os instrutores de acordo com os certificados buscados
    const getAllInstructors = await databasePanel
    .select('jcv_userNamePrimary','jcv_id')
    .whereIn('jcv_id', arrayIntructors)
    .table("jcv_users")
    .then( data => {
        let newObj = []
        data.forEach(element => {
            newObj.push({'idUserPanel': element.jcv_id, 'nameUser': element.jcv_userNamePrimary})
        });
        return newObj
    })

    const page = 'main'
    res.render('panel/index', {page: page, getAllCertificates: getAllCertificates, getAllInstructors: getAllInstructors})

}

exports.saveProfile = async (req,res) => {

    const userName = req.body['user-name'];
    let userCPF = req.body['user-cpf'];
    userCPF = await userCPF.split('.').join('')
    userCPF = await userCPF.split('-').join('')

    const userTelefone = req.body['user-telefone'];
    const userEmailPrimary = req.body['user-email-primary'] == '' ? null: req.body['user-email-primary'];
    const userEmailSecundary = req.body['user-email-secundary'] == '' ? null : req.body['user-email-secundary']

    //Validando se o email inserido existe no portal JCV
    const validadeEmail = await databasePanel
    .select()
    .whereRaw(`jcv_userEmailCorporate in ('${userEmailPrimary}','${userEmailSecundary}')`)
    .table("jcv_users")
    .then( data => {return data})
    //console.log(validadeEmail)

    if(validadeEmail == ''){
        if(req.body['login-newpass-one'] != '' && req.body['login-newpass-one'] == req.body['login-newpass-two']){
            //Ele esta solicitando a troca de senha
    
            let salt = bcripty.genSaltSync(10);
            let passwordHash = bcripty.hashSync(req.body['login-newpass-one'], salt)
    
            //Atualiando a senha tambem
            database
            .update({
                jcv_users_pass: passwordHash
            })
            .where({jcv_user_id: DASH_INFO[0]})
            .table("jcv_users")
            .then( data => {
                if( data >= 1){
                    //Update ok
                    //console.log('senha atualizada com sucesso')
                    res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "sucess","message":"Senha atualizada com sucesso","timeMsg": 3000}`);   
                }else{
                    //Erro ao atualizar
                    console.log('erro ao atualizar a senha')
                }
            })
    
        }
    
        //Inserindo no banco de dados
        database
        .update({
            jcv_users_name: userName,
            jcv_users_cpf: userCPF,
            jcv_users_telefone: userTelefone,
            jcv_users_email_primary: userEmailPrimary,
            jcv_users_email_secundary: userEmailSecundary
        })
        .where({jcv_user_id: DASH_INFO[0]})
        .table("jcv_users")
        .then( data => {
            if( data >= 1){
                //Update ok
                //console.log('conta atualizada com sucesso')
                res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "success","message":"Conta atualizada com sucesso","timeMsg": 3000}`);
                res.redirect('/painel')
    
            }else{
                //Erro ao atualizar
                //console.log('erro ao atualizar seus dados')
                res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "error","message":"Erro ao atualizar seus dados","timeMsg": 3000}`);
                res.redirect('/painel')
            }
        })
    }else{
        res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "error","message":"Este e-mail ja está em uso","timeMsg": 3000}`);
        res.redirect('/painel')
    }

}