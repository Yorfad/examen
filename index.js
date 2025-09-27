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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               director:
 *                 type: string
 *               genero:
 *                 type: string
 *               duracion:
 *                 type: integer
 *               clasificacion:
 *                 type: string
 *               fechaEstreno:
 *                 type: string
 *                 format: date
 *               sinopsis:
 *                 type: string
 *     responses:
 *       201:
 *         description: Película creada
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
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la película
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               director:
 *                 type: string
 *               genero:
 *                 type: string
 *               duracion:
 *                 type: integer
 *               clasificacion:
 *                 type: string
 *               fechaEstreno:
 *                 type: string
 *                 format: date
 *               sinopsis:
 *                 type: string
 *     responses:
 *       200:
 *         description: Película actualizada
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
