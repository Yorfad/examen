import express from "express";
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Configuración de conexión a SQL Server
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Cartelera",
      version: "1.0.0",
    },
  },
  apis: ["./index.js"], // <- ajusta según dónde tengas tus anotaciones @openapi
};
// Crear conexión pool
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Conectado a SQL Server");
    return pool;
  })
  .catch(err => console.error("❌ Error de conexión a SQL Server:", err));

// ================================
// RUTAS
// ================================

/**
 * @openapi
 * /cartelera:
 *   get:
 *     summary: Obtener todas las películas en cartelera
 *     responses:
 *       200:
 *         description: Lista de películas
 */
app.get("/cartelera", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM cartelera5710");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /cartelera:
 *   post:
 *     summary: Crear una nueva película en cartelera
 */
app.post("/cartelera", async (req, res) => {
  try {
    const { titulo, director, genero, duracion, clasificacion, fechaEstreno, sinopsis } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("titulo", sql.NVarChar(200), titulo)
      .input("director", sql.NVarChar(150), director)
      .input("genero", sql.NVarChar(100), genero)
      .input("duracion", sql.Int, duracion)
      .input("clasificacion", sql.NVarChar(50), clasificacion)
      .input("fechaEstreno", sql.Date, fechaEstreno)
      .input("sinopsis", sql.NVarChar(sql.MAX), sinopsis)
      .query(`
        INSERT INTO cartelera5710 (titulo, director, genero, duracion, clasificacion, fechaEstreno, sinopsis)
        VALUES (@titulo, @director, @genero, @duracion, @clasificacion, @fechaEstreno, @sinopsis)
      `);

    res.status(201).json({ message: "✅ Película creada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /cartelera/{id}:
 *   put:
 *     summary: Actualizar una película por ID
 */
app.put("/cartelera/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, director, genero, duracion, clasificacion, fechaEstreno, sinopsis } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, id)
      .input("titulo", sql.NVarChar(200), titulo)
      .input("director", sql.NVarChar(150), director)
      .input("genero", sql.NVarChar(100), genero)
      .input("duracion", sql.Int, duracion)
      .input("clasificacion", sql.NVarChar(50), clasificacion)
      .input("fechaEstreno", sql.Date, fechaEstreno)
      .input("sinopsis", sql.NVarChar(sql.MAX), sinopsis)
      .query(`
        UPDATE cartelera5710
        SET titulo=@titulo, director=@director, genero=@genero, duracion=@duracion,
            clasificacion=@clasificacion, fechaEstreno=@fechaEstreno, sinopsis=@sinopsis
        WHERE id=@id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "❌ Película no encontrada" });
    }

    res.json({ message: "✅ Película actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// Servidor
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
