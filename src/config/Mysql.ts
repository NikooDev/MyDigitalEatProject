import { ConnectionConfig } from 'mysql2';
import Dotenv from 'dotenv';

Dotenv.config();

const MysqlConfig = {
	connectionLimit: 500,
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	keepAliveInitialDelay: 10000,
	enableKeepAlive: true
} as ConnectionConfig

export default MysqlConfig;