const database = require('../database');//Database do painel de ceritificados
const databasePanel = require('../databasePanel');//Database do painel JCV

exports.moduleExportsCertificate = async (req,res) => {
    const getUUID = req.params.uuid;
    const idUser = req.params.idUser;

    //console.log(idUser)
    //Validando se o curso existe
    await database
    .select()
    .whereRaw(`JSON_CONTAINS(jcv_course_array_users, '${idUser}', '$') AND jcv_course_uuid = '${getUUID}'`)
    .table("jcv_course")
    .join("jcv_models_certificates","jcv_models_certificates.jcv_models_certificates_id","jcv_course.jcv_course_certificate_model_id")
    .then( data => {
        if(data != ''){

            //Pegando todos os instrutores de acordo com os certificados buscados
            databasePanel
            .select('jcv_userNamePrimary','jcv_id')
            .where({jcv_id: data[0].jcv_course_manager_course})
            .table("jcv_users")
            .then( dataManager => {

                //Pegando dados do usuario
                database
                .select('jcv_user_id','jcv_users_name')
                .where({jcv_user_id: idUser})
                .table("jcv_users")
                .then( dataUserInfo => {
                    if( data != ''){
                        res.render('src/layoutCertificate',{certificateInfo: data, getAllInstructors: dataManager[0].jcv_userNamePrimary, dataUserInfo: dataUserInfo})
                    }else{
                        console.log('nenhum usuario encontrado')
                    }
                })
            })

        }else{
            console.log('Curso inexistente')
            res.redirect('/painel')
        }
    })
}