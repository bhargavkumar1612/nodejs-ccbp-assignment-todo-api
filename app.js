const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

app = express();
app.use(express.json());
let db = null;
const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (err) {
    console.log("DB Error: " + err.message);
  }
};
initializeDatabaseAndServer();

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  console.log(status, priority, search_q);
  const getAllTodosQuery = `
    SELECT
    *
    FROM
    todo
    WHERE 
    status like "%${status}%" and
    priority like "%${priority}%"
    and todo like "%${search_q}%"
    order by id;`;
  const allTodos = await db.all(getAllTodosQuery);
  const allTodosResponse = allTodos.map((item) => ({
    id: item.id,
    todo: item.todo,
    priority: item.priority,
    status: item.status,
  }));
  response.send(allTodosResponse);
});

app.get("/todos/:todoId/", async (request, response) => {
  const todoId = request.params.todoId;
  const getTodoQuery = `
    SELECT
    *
    FROM
    todo
    WHERE id = ${todoId};
    `;
  const getTodo = await db.get(getTodoQuery);
  const getTodoResponse = {
    id: getTodo.id,
    todo: getTodo.todo,
    priority: getTodo.priority,
    status: getTodo.status,
  };
  response.send(getTodoResponse);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  await db.run(`
    Insert into
    todo
    (id, todo, priority, status)
    values
    (${id}, "${todo}", "${priority}", "${status}")
    `);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const todoId = request.params.todoId;
  const oldTodo = await db.get(`
    SELECT
    *
    FROM
    todo
    WHERE id = ${todoId};
    `);
  const {
    todo = oldTodo.todo,
    priority = oldTodo.priority,
    status = oldTodo.status,
  } = request.body;

  await db.run(`
      UPDATE
      todo
      SET
      todo = "${todo}",
      priority = "${priority}",
      status = "${status}"
      WHERE id = ${todoId};
      `);
  response.send("Todo Updated");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const todoId = request.params.todoId;
  await db.run(`
    DELETE FROM todo
    WHERE id = ${todoId};
    `);
  response.send("Todo Deleted");
});

module.exports = app;
