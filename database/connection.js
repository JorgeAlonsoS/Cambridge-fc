const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.pool = null;
        this.retryAttempts = 5;
        this.retryDelay = 5000; // 5 segundos
    }

    async createPool() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'cambridge_fc',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0,
                timezone: 'local'
            });

            // Verificar la conexión
            const connection = await this.pool.getConnection();
            console.log('✅ Conexión a la base de datos establecida correctamente');
            connection.release();

            // Configurar eventos del pool
            this.pool.on('connection', () => {
                console.log('Nueva conexión establecida con la base de datos');
            });

            this.pool.on('error', async (err) => {
                console.error('Error en el pool de conexiones:', err);
                await this.handleConnectionError(err);
            });

            return this.pool;
        } catch (error) {
            console.error('❌ Error al crear el pool de conexiones:', error);
            await this.handleConnectionError(error);
        }
    }

    async handleConnectionError(error) {
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Error de acceso denegado. Verificando credenciales...');
            // Intentar crear la base de datos y el usuario si no existen
            await this.setupDatabase();
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('Base de datos no existe. Creando base de datos...');
            await this.createDatabase();
        } else {
            console.error('Error no manejado:', error);
            throw error;
        }
    }

    async setupDatabase() {
        try {
            // Crear conexión root temporal
            const rootConnection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: 'root',
                password: ''
            });

            // Crear base de datos si no existe
            await rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'cambridge_fc'}`);
            
            // Crear usuario si no existe
            const user = process.env.DB_USER || 'root';
            const password = process.env.DB_PASSWORD || '';
            
            if (user !== 'root') {
                await rootConnection.query(`
                    CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED BY '${password}'
                `);
                
                await rootConnection.query(`
                    GRANT ALL PRIVILEGES ON ${process.env.DB_NAME || 'cambridge_fc'}.* TO '${user}'@'localhost'
                `);
            }

            await rootConnection.query('FLUSH PRIVILEGES');
            
            console.log('✅ Base de datos y usuario configurados correctamente');
            
            // Cerrar conexión root
            await rootConnection.end();

            // Inicializar las tablas
            await this.initializeTables();
        } catch (error) {
            console.error('❌ Error en la configuración inicial de la base de datos:', error);
            throw error;
        }
    }

    async initializeTables() {
        try {
            // Leer y ejecutar el script SQL
            const sqlPath = path.join(__dirname, 'init.sql');
            const sqlScript = await fs.readFile(sqlPath, 'utf8');
            
            // Dividir el script en comandos individuales
            const commands = sqlScript
                .split(';')
                .filter(cmd => cmd.trim())
                .map(cmd => cmd + ';');

            // Ejecutar cada comando
            const connection = await this.pool.getConnection();
            for (const command of commands) {
                await connection.query(command);
            }
            connection.release();

            console.log('✅ Tablas inicializadas correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar las tablas:', error);
            throw error;
        }
    }

    async query(sql, params) {
        let attempts = 0;
        while (attempts < this.retryAttempts) {
            try {
                const [results] = await this.pool.execute(sql, params);
                return results;
            } catch (error) {
                attempts++;
                if (attempts === this.retryAttempts) {
                    throw error;
                }
                console.error(`Intento ${attempts} fallido. Reintentando en ${this.retryDelay/1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
    }

    async end() {
        if (this.pool) {
            await this.pool.end();
            console.log('Conexión a la base de datos cerrada correctamente');
        }
    }
}

// Exportar una única instancia
const db = new DatabaseConnection();
module.exports = db;
