module.exports = {
    secret: process.env.SECRET,
    mysql: {
        hostname: process.env.MYSQL_HOSTNAME,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT,
        dbname: process.env.MYSQL_DATABASE,
    }
};