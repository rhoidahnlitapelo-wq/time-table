require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  run,
  get,
  all,
  initializeDatabase
} = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

const RESOURCE = "/api/timetable";
const fields = [
  "course_code",
  "course_name",
  "day_of_week",
  "start_time",
  "end_time",
  "goal"
];

function validateRecord(body) {
  const missing = fields.filter(
    (field) => typeof body[field] !== "string" || body[field].trim() === ""
  );
  if (missing.length > 0) {
    return `Please provide non-empty values for: ${missing.join(", ")}.`;
  }
  if (body.start_time >= body.end_time) {
    return "end_time must be later than start_time.";
  }
  return null;
}

app.get("/", (req, res) => {
  res.json({
    message: "Student Timetable & Goals API",
    endpoints: {
      list: `GET ${RESOURCE}`,
      getOne: `GET ${RESOURCE}/:id`,
      create: `POST ${RESOURCE}`,
      update: `PUT ${RESOURCE}/:id`,
      delete: `DELETE ${RESOURCE}/:id`
    }
  });
});

// GET /api/timetable — return every timetable record.
app.get(RESOURCE, async (req, res, next) => {
  try {
    const records = await all(
      "SELECT * FROM timetable ORDER BY day_of_week, start_time, id"
    );
    res.json(records);
  } catch (error) {
    next(error);
  }
});

// GET /api/timetable/:id — return one record.
app.get(`${RESOURCE}/:id`, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "ID must be a positive integer." });
    }
    const record = await get("SELECT * FROM timetable WHERE id = ?", [id]);
    if (!record) {
      return res.status(404).json({ error: "Timetable record not found." });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
});

// POST /api/timetable — create a record.
app.post(RESOURCE, async (req, res, next) => {
  try {
    const validationError = validateRecord(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const values = fields.map((field) => req.body[field].trim());
    const result = await run(
      `INSERT INTO timetable
       (${fields.join(", ")})
       VALUES (?, ?, ?, ?, ?, ?)`,
      values
    );
    const created = await get("SELECT * FROM timetable WHERE id = ?", [result.lastID]);
    res.status(201).json({
      message: "Timetable record created successfully.",
      record: created
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/timetable/:id — replace the editable fields of a record.
app.put(`${RESOURCE}/:id`, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "ID must be a positive integer." });
    }

    const validationError = validateRecord(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existing = await get("SELECT id FROM timetable WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ error: "Timetable record not found." });
    }

    const values = fields.map((field) => req.body[field].trim());
    values.push(id);
    await run(
      `UPDATE timetable
       SET ${fields.map((field) => `${field} = ?`).join(", ")},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    const updated = await get("SELECT * FROM timetable WHERE id = ?", [id]);
    res.json({
      message: "Timetable record updated successfully.",
      record: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/timetable/:id — delete a record.
app.delete(`${RESOURCE}/:id`, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "ID must be a positive integer." });
    }

    const result = await run("DELETE FROM timetable WHERE id = ?", [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Timetable record not found." });
    }
    res.json({ message: "Timetable record deleted successfully.", id });
  } catch (error) {
    next(error);
  }
});

// Return JSON errors instead of an HTML error page.
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running at http://localhost:${PORT}`);
      console.log(`Timetable endpoint: http://localhost:${PORT}${RESOURCE}`);
    });
  })
  .catch((error) => {
    console.error("Could not initialize the database:", error);
    process.exit(1);
  });
