const { Client } = require("pg");
const inquirer = require("inquirer");

const client = new Client({
  user: "your_username",
  host: "localhost", 
  database: "your_database",
  password: "your_password",
  port: 5432, 
});


const deviceColumns = Array.from({ length: 100 }, (_, i) => `device_${i + 1} TEXT`).join(",\n    ");
const paramColumns = Array.from({ length: 400 }, (_, i) => `param${i + 1} NUMERIC`).join(",\n    ");


const createTableQuery = `
CREATE TABLE IF NOT EXISTS device_data (
    sl_no SERIAL PRIMARY KEY,
    ${deviceColumns},
    timestamp TIMESTAMP,
    ${paramColumns}
);
`;

async function insertData() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "date",
      message: "Enter date (YYYY-MM-DD):",
      validate: (input) => /\d{4}-\d{2}-\d{2}/.test(input) ? true : "Enter a valid date format (YYYY-MM-DD)",
    },
  ]);

  const insertQuery = `
  INSERT INTO device_data (timestamp) VALUES ($1) RETURNING *;
  `;
  
  try {
    await client.connect();
    await client.query(createTableQuery); 
    const res = await client.query(insertQuery, [`${answers.date} 00:00:00`]);
    console.log("Data inserted successfully!", res.rows);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end(); 
  }
}

insertData();
