const database = require('../database');
const databasePanel = require('../databasePanel');
const bcripty = require('bcrypt')

exports.moduleRegister = async (req,res) => {

    const registerName = req.body['register-name'];
    let registerCPF = req.body['register-cpf'];
    const registerTell = req.body['register-tell'];
    const registerEmail = req.body['register-email'];
    /*  */
    const registerPassOne = req.body['register-pass-one'];
    const registerPassTwo = req.body['register-pass-two'];

    registerCPF = await registerCPF.split('.').join('')
    registerCPF = await registerCPF.split('-').join('')

    //Verificando se ja existe um email ou CPF cadastrado no banco de usuarios do certificados
    const validateRegister = await database
    .select("jcv_users_enabled")
    .whereRaw(`jcv_users_cpf = '${registerCPF}' OR jcv_users_email_primary = '${registerEmail}' `)
    .table("jcv_users")
    .then( data => {return data})

    if(validateRegister != ''){
        //Usuario ja registradp
        req.flash('registerFailedData', [registerName, registerCPF, registerTell, registerEmail])
        res.cookie('SYS-NOTIFICATION-EXE1', "SYS03|Usuário ja registrado! Verifique o e-mail e CPF inseridos");
        res.redirect('/') 
    }else{
        //Usuario ainda não registrado

        //Validando se o usuario tem cadastro no portal do jcv
        const validateRegisterPortal = await databasePanel
        .select("jcv_userEnabled")
        .whereRaw(`jcv_userCpf = '${registerCPF}' OR jcv_userEmailCorporate = '${registerEmail}' OR jcv_userEmailFolks = '${registerEmail}'`)
        .table("jcv_users")
        .then( data => {return data})

        if(validateRegisterPortal != ''){
            //Usuario cadastrado no portal JCV
            req.flash('registerFailedData', [registerName, registerCPF, registerTell, registerEmail])
            res.cookie('SYS-NOTIFICATION-EXE1', "SYS02|Dados inseridos vinculados a uma conta no <b>jcv.net.br</b>, acesse sua conta e vincule seu perfil!");
            res.redirect('/') 
        }else{
            //Usuario não cadastrado no portal

            if(registerPassOne === registerPassTwo){
                //Vamos cadastrar o usuario

                let salt = bcripty.genSaltSync(10);
                let passwordHash = bcripty.hashSync(registerPassOne, salt)

                //Cadastrando o usuario!!
                database
                .insert({
                    jcv_users_name: registerName,
                    jcv_users_cpf: registerCPF,
                    jcv_users_telefone: registerTell,
                    jcv_users_email_primary: registerEmail,
                    jcv_users_pass: passwordHash,
                    jcv_users_enabled: 1
                })
                .table("jcv_users")
                .then(data => {
                    if(data[0] == 1){
                        res.cookie('SYS-NOTIFICATION-EXE1', "SYS01|Conta registrada com sucesso!!");
                        res.redirect('/') 
                    }else{
                        res.cookie('SYS-NOTIFICATION-EXE1', "SYS03|Erro ao criar sua conta");
                        res.redirect('/') 
                    }
                })
            }else{
                console.log('As senhas não correspondem!')
                req.flash('registerFailedData', [registerName, registerCPF, registerTell, registerEmail])
                res.redirect('/')
            }            
        }
    }


}