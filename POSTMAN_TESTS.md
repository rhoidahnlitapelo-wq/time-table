
# Postman Test Plan — ICT251 Activity 4

Start the backend before testing. Base URL: `http://localhost:3000/api/timetable`.

Use **Body → raw → JSON** for POST and PUT.

## Test 1 — GET all records
- Method: GET
- URL: `http://localhost:3000/api/timetable`
- Expected: `200 OK`, JSON array with 10 seeded records on first run.

## Test 2 — GET one record
- Method: GET
- URL: `http://localhost:3000/api/timetable/1`
- Expected: `200 OK`, JSON object for ID 1.

## Test 3 — POST a new record
- Method: POST
- URL: `http://localhost:3000/api/timetable`
- Body:
```json
{
  "course_code": "TEST101",
  "course_name": "Postman Test Course",
  "day_of_week": "Saturday",
  "start_time": "14:00",
  "end_time": "15:00",
  "goal": "Verify that POST creates a record"
}
```
- Expected: `201 Created`, message and `record` object. Note the returned record ID.

## Test 4 — PUT the record created in Test 3
Replace `ID_FROM_POST` with the numeric ID returned by Test 3.
- Method: PUT
- URL: `http://localhost:3000/api/timetable/ID_FROM_POST`
- Body:
```json
{
  "course_code": "TEST101",
  "course_name": "Updated Postman Test Course",
  "day_of_week": "Saturday",
  "start_time": "14:00",
  "end_time": "15:30",
  "goal": "Verify that PUT updates an existing record"
}
```
- Expected: `200 OK`, message and updated `record` object.

## Test 5 — DELETE the same test record
Replace `ID_FROM_POST` with the numeric ID from Test 3.
- Method: DELETE
- URL: `http://localhost:3000/api/timetable/ID_FROM_POST`
- Expected: `200 OK`, JSON success message.

## Final verification
- Run GET all again and confirm the test record is gone.
- Optionally GET the deleted ID and expect `404 Not Found`.

## Evidence video checklist
For every endpoint, show:
1. HTTP method and complete URL.
2. Request body for POST and PUT.
3. Send action.
4. Status code and JSON response.
5. For DELETE, show a follow-up GET proving the record is gone.

Record all five endpoints in one clear video if possible. Do not show passwords or private credentials.
