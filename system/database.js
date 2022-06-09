const connection = require('knex')({
    client: 'mysql2',
    connection: {
    host : '45.82.72.240',
    user : 'jcv_sys',
    password : '!@#246810Cp',
    database : 'jcv_jcvcertificates',
    port: 3306
    }
});

module.exports = connection;