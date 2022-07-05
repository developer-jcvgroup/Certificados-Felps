const database = require('../database');
const databasePanel = require('../databasePanel');
const bcripty = require('bcrypt')

//Sistema de emails
const emailSystemExe = require('./emailSystem');

exports.moduleLogin = async (req,res) => {
    //Modulo loin

    let primaryAcess = req.body['login-acess'];//Email ou CPF de acesso
    const secundaryAcess = req.body['login-pass'];//Senha de acesso

    //Verificando se é email ou senha
    primaryAcess = primaryAcess.indexOf("@") == -1 ? parseInt(primaryAcess.split('.').join('').split('-').join('')) : primaryAcess

    // 1° Validando se o e-mail inserido faz parte do painel do JCV GROUP
    let validadeOne = await databasePanel
    .select()
    .whereRaw(`jcv_userEmailCorporate = '${primaryAcess}' OR jcv_userCpf = '${primaryAcess}'`)
    .table("jcv_users")
    .then( data => {
        return data != '' ? true : false
    }) 

    if(validadeOne == true){
        //O usuario possui conta no painel JCV GROUP
        //res.cookie('SYS-NOTIFICATION-EXE1', "SYS02|Você possui conta no portal JCV GROUP! Acesse por la");
        res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "warning","message":"Você possui conta no portal JCV GROUP! Acesse por la","timeMsg": 3000}`);
        res.redirect('/') 
    }else{
        //O Usuario não possui conta no JCV GROUP

        // 2° Validando o login
        database
        .select()
        .whereRaw(`jcv_users_email_primary = '${primaryAcess}' OR jcv_users_cpf = '${primaryAcess}'`)
        .table("jcv_users")
        .then( data => {
            if( data != ''){

                if(bcripty.compareSync(secundaryAcess, data[0].jcv_users_pass)){

                    //Usuario authenticado com sucesso!

                    //Sessão de login
                    req.session.cookieLoginPanelCertificate = [
                        data[0].jcv_user_id
                    ]

                    console.log('logado com sucesso!')
                    res.redirect('/painel')
                }else{
                    //res.cookie('SYS-NOTIFICATION-EXE1', "SYS03|Usuario ou senha incorretos!");
                    res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "error","message":"Usuario ou senha incorretos!","timeMsg": 3000}`);
                    res.redirect('/') 
                }

            }else{
                //Erro ao autenticar

                //res.cookie('SYS-NOTIFICATION-EXE1', "SYS02| Senha incorreta");
                //res.cookie('SYS-NOTIFICATION-EXE1', "SYS02|Você possui conta no portal JCV GROUP! Acesse por la");
                res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "error","message":"Senha incorreta!","timeMsg": 3000}`);
                res.redirect('/')
            }
        })
    }
}

exports.recoveryPass = async (req,res) => {

    const emailRecovery = req.body['email-recovery'];

    //Validando se o email é de usuario da plataforma de cursos ou da plataforma do JCV GROUP
    const validateMail = await database
    .select()
    .where({jcv_users_email_primary: emailRecovery})
    .table("jcv_users")
    .then( data => {
        if(data != ''){
            //Este email esta cadastrado na plataforma de certificados

            //Senha aleatoria
            var randomstring = Math.random().toString(36).slice(-8);

            let salt = bcripty.genSaltSync(10);
            let passwordHash = bcripty.hashSync(randomstring, salt)

            //Update da nova senha
            database
            .update({
                jcv_users_pass: passwordHash
            })
            .where({jcv_users_email_primary: emailRecovery})
            .table("jcv_users")
            .then( data => { /* console.log (data) */})

            //Passando senha provisória no email
            //Sistema de email
            const textOne = 'Você solicitou a <b>redefinição de sua senha</b>.';
            const textTwo = `Sua senha foi redefinida! Senha provisória: <b>${randomstring}</b>. <b>Não se esqueça de mudar a senha após o login</b>!`;
            emailSystemExe.sendMailExe(data[0].jcv_users_email_primary, 'Pedido de redefinição de senha', 'Redefinição de senha', 'Sistema JCV GROUP', data[0].jcv_users_name, textOne, textTwo);

            //res.cookie('SYS-NOTIFICATION-EXE1', "SYS01|Email de confirmação enviado, acesse e valide sua conta.");
            res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "success","message":"Email de confirmação enviado, acesse e valide sua conta","timeMsg": 3000}`);
            res.redirect('/')
        }else{
            //Este email não esta na plataforma de certificado

            //Verificando no portal JCV GROUP
            databasePanel
            .select()
            .whereRaw(`jcv_userEmailCorporate = '${emailRecovery}' OR jcv_userEmailFolks ='${emailRecovery}'`)
            .table("jcv_users")
            .then( dataPanel => {

                if(dataPanel != ''){
                    //Usuario é da plataforma do jcv GROUP
                    //res.cookie('SYS-NOTIFICATION-EXE1', "SYS03|Redefina sua senha no portal do JCV GROUP!");
                    res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "error","message":"Redefina sua senha no portal do JCV GROUP!","timeMsg": 3000}`);
                    res.redirect('/')
                }else{
                    //Usuario não é da plataforma

                    //res.cookie('SYS-NOTIFICATION-EXE1', "SYS03|Usuario inexistente!");
                    res.cookie('SYSTEM-NOTIFICATIONS-MODULE', `{"typeMsg": "error","message":"Usuario inexistente!","timeMsg": 3000}`);
                    res.redirect('/')

                    //Chegando aqui significa que o email inserido não existe
                }

            })

        }
    })

}

exports.moduleLoginExternal = async (req,res) =>{
    const uuidExternalLogin = req.params.uuid;

    //Validando se tem uma solicitação de login externo
    const validateLogin = await database
    .select()
    .where({jcv_external_login_uuid: uuidExternalLogin})
    .table("jcv_external_login")
    .then( data => {return data})

    //Validando
    if(validateLogin != ''){
        //Registro de login externo existente

        //Pegando as informações do portal JCV GROUP
        const getInfoUserPanel = await databasePanel
        .select("jcv_userNamePrimary","jcv_userCpf","jcv_userEmailCorporate","jcv_userEmailFolks","jcv_userPassword")
        .where({jcv_id: validateLogin[0].jcv_external_id_user})
        .table("jcv_users")
        .then( data => {return data})

        //console.log(getInfoUserPanel)

        //1° Validando e pegando dados se o usuario do painel possui conta no portal de certificados
        const getInfoUserCert = await database
        .select()
        .where({jcv_users_cpf: getInfoUserPanel[0].jcv_userCpf})
        .table("jcv_users")
        .then( data =>{ return data })

        if(getInfoUserCert != ''){
            //Conta com este CPF encontrada no portal do certificado

            //Atualizando as informações do usuario no banco de dados do certificados
            await database
            .update({
                jcv_users_name: getInfoUserPanel[0].jcv_userNamePrimary,
                jcv_users_cpf: getInfoUserPanel[0].jcv_userCpf,
                jcv_users_email_primary: getInfoUserPanel[0].jcv_userEmailCorporate,
                jcv_users_email_secundary: getInfoUserPanel[0].jcv_userEmailFolks,
                jcv_users_pass: getInfoUserPanel[0].jcv_userPassword
            })
            .where({jcv_users_cpf: getInfoUserPanel[0].jcv_userCpf})
            .table("jcv_users")
            .then( data =>{
                //console.log(data)
            })

            req.session.cookieLoginPanelCertificate = [
                getInfoUserCert[0].jcv_user_id
            ]

            //Desabilitando o registro de acesso externo
            database
            .update({jcv_external_enabled: 0})
            .where({jcv_external_login_uuid: uuidExternalLogin})
            .table("jcv_external_login")
            .then( data => {
                //console.log(data)
            })
    
            console.log('logado com sucesso!')
            res.redirect('/painel')
        }else{
            //Conta não encotrada

            //Solictando a sincronização dos dados
            console.log('solicite a sincronização do perfil')
        }

    }else{
        //Registro inexistente

    }
}