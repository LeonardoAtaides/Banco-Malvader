import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'banco_malvader',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Pool de conexões
let pool: mysql.Pool | null = null;

export const getConnection = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log(' Pool de conexões MySQL criado');
  }
  return pool;
};

export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    const connection = getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error(' Erro na execução da query:', error);
    throw error;
  }
};

export const executeTransaction = async (queries: { query: string; params: any[] }[]): Promise<any[]> => {
  const connection = await getConnection().getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    console.log(' Transação executada com sucesso');
    return results;
  } catch (error) {
    await connection.rollback();
    console.error(' Erro na transação, rollback executado:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Função para testar a conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = getConnection();
    await connection.execute('SELECT 1');
    console.log(' Conexão com MySQL estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error(' Erro ao conectar com MySQL:', error);
    return false;
  }
};

export default getConnection;
