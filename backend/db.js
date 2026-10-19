const fs = require("node:fs");
const path = require("node:path");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const configuredPath = process.env.DB_PATH || "./timetable.db";
const dbPath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(__dirname, configuredPath);

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) return reject(error);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) return reject(error);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) return reject(error);
      resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

async function initializeDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await exec(schema);

  const existing = await get("SELECT COUNT(*) AS count FROM timetable");
  if (existing.count === 0) {
    const samples = [
      ["ICT251", "Web Technologies", "Monday", "08:00", "10:00", "Complete the weekly Node.js practical"],
      ["MSM111", "Mathematics I", "Monday", "10:00", "12:00", "Practise algebra and probability questions"],
      ["PHY101", "Physics I", "Tuesday", "08:00", "10:00", "Review lecture notes and solve five problems"],
      ["ICT281", "Statistics for Computing", "Tuesday", "10:00", "12:00", "Practise descriptive statistics"],
      ["ICT221", "Computer Programming", "Wednesday", "08:00", "10:00", "Write and test one Java program"],
      ["ICT231", "Computer Architecture", "Wednesday", "10:00", "12:00", "Revise CPU components and buses"],
      ["MSM112", "Calculus", "Thursday", "08:00", "10:00", "Practise differentiation exercises"],
      ["ICT241", "Database Systems", "Thursday", "10:00", "12:00", "Design and query a sample table"],
      ["ICT261", "Digital Design", "Friday", "08:00", "10:00", "Practise truth tables and logic gates"],
      ["ICT271", "Computer Networks", "Friday", "10:00", "12:00", "Summarise network protocols"]
    ];

    for (const sample of samples) {
      await run(
        `INSERT INTO timetable
         (course_code, course_name, day_of_week, start_time, end_time, goal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        sample
      );
    }
  }
}

module.exports = { db, run, get, all, initializeDatabase };
