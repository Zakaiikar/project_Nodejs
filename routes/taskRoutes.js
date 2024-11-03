const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");

const taskRoutes = (req, res) => {
    if (req.method === 'GET') {
        getTasks(req, res);
    } else if (req.method === 'POST') {
        createTask(req, res);
    } else if (req.method === 'PUT') {  // Change PATCH to PUT
        updateTask(req, res);
    } else if (req.method === 'DELETE') {
        deleteTask(req, res);
    } else {
        res.writeHead(404, 'data not found', { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Invalid request method'
        }));
    }
};

module.exports = taskRoutes;