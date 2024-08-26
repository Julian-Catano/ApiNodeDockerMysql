//importo las librerias para poder utilizar la api y msql
import express from "express";
import mysql from "mysql2/promise";

//instancio express
const app = express();
//le doy el puerto al que va a escuchar 
const port = 3000;

//creo la conexion
let connection;

const connectDB = async () => {
  while (!connection) {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      console.log("Conectado a la base de datos MySQL");
      await createTable();
    } catch (error) {
      console.error("Error al conectar a la base de datos MySQL:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5 segundos antes de reintentar
    }
  }
};

//creo la tabla 

const createTable = async () => {
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS animales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255),
        especie VARCHAR(255),
        status VARCHAR(255)
      )
    `);
    console.log("Tabla animales verificada/creada");
  } catch (error) {
    console.error("Error al crear la tabla:", error);
  }
};

app.use(express.json());

//metodo de mostrar

app.get("/", async (req, res) => {
  console.log("Loading");
  try {
    const [rows] = await connection.query("SELECT * FROM animales");
    return res.json(rows);
  } catch (error) {
    console.error("Error al obtener animales:", error);
    return res.status(500).send("Error al obtener animales");
  }
});

//metodo de agregar
app.get("/agregar", async (req, res) => {
  const { nombre, especie, status } = req.body;
  console.log("Creating");
  try {
    await connection.query(
      "INSERT INTO animales (nombre, especie, status) VALUES (?, ?, ?)",
      [nombre, especie, status]
    );
    return res.send("Created");
  } catch (error) {
    console.error("Error al crear animal:", error);
    return res.status(500).send("Error al crear animal");
  }
});

//metodo de actualizar

app.put("/actualizar/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, especie, status } = req.body;
  console.log("Updating");
  try {
    await connection.query(
      "UPDATE animales SET nombre = ?, especie = ?, status = ? WHERE id = ?",
      [nombre, especie, status, id]
    );
    return res.send("Updated");
  } catch (error) {
    console.error("Error al actualizar animal:", error);
    return res.status(500).send("Error al actualizar animal");
  }
});

//metodo de borrar

app.delete("/destroy/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Deleting");
  try {
    await connection.query("DELETE FROM animales WHERE id = ?", [id]);
    return res.send("Deleted");
  } catch (error) {
    console.error("Error al eliminar animal:", error);
    return res.status(500).send("Error al eliminar animal");
  }
});

//aca le paso la conexion y le digo uqe si todo salio bien escuche al puerto 3000 y me muestre un mensaje de aceptacion por decirlo asi 
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});
