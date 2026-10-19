
# ICT251 Activity 4 — Student Timetable & Goals (SQLite)

A single-table CRUD application using Node.js, Express, SQLite, HTML and browser JavaScript.

## Requirements
- Node.js 20+ recommended
- npm
- Postman for API testing
- A modern browser

## Important assignment note
The assignment PDF says SQLite in the introduction but gives MySQL (`mysql2`) setup instructions later. This project consistently uses SQLite. Confirm with your lecturer that SQLite is acceptable before final submission.

## 1. Run the backend
Open a terminal in the `backend` folder:

```bash
npm install
npm start
```

The API runs at `http://localhost:3000`. On first start, it creates `timetable.db`, creates the one `timetable` table, and inserts 10 sample records if the table is empty.

## 2. Open the frontend
Open `frontend/index.html` in a browser. If browser restrictions prevent requests, use a local static server, for example the VS Code Live Server extension. The frontend is configured to call `http://localhost:3000/api/timetable`.

## 3. API endpoints
- `GET http://localhost:3000/api/timetable`
- `GET http://localhost:3000/api/timetable/1`
- `POST http://localhost:3000/api/timetable`
- `PUT http://localhost:3000/api/timetable/1`
- `DELETE http://localhost:3000/api/timetable/1`

POST and PUT JSON body example:

```json
{
  "course_code": "ICT251",
  "course_name": "Web Technologies",
  "day_of_week": "Monday",
  "start_time": "08:00",
  "end_time": "10:00",
  "goal": "Complete weekly practical work"
}
```

## 4. Postman test order
1. GET all records.
2. GET one existing record, e.g. ID 1.
3. POST a new record.
4. PUT the ID returned by POST.
5. DELETE that same ID.
6. GET all again to confirm the deleted record is gone.

Save screenshots if useful, and record the required demonstration video showing all five endpoints, their methods and URLs, request bodies where applicable, and JSON responses.

## 5. Configuration
The `.env` file controls `PORT` and `DB_PATH`. The default database file is `timetable.db` in the backend folder. Do not commit real secrets in a public repository.

## 6. Deployment
This project is designed for local development first. Before deployment, choose a host that supports Node.js and persistent SQLite storage, or adapt the database to a hosted database supported by your lecturer. Some free cloud services erase local files on restart/redeployment, which can erase a SQLite database. The PDF's deployment wording should be clarified with your lecturer.
