const { IncomingForm } = require('formidable');
const { readTaskFromFile, writeTaskToFile } = require("../utils/fileHandler");
const { copyFileSync, unlinkSync } = require('fs');
const path = require('path');

// Get all tasks
exports.getTasks = (req, res) => {
    const tasks = readTaskFromFile();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tasks));
};

// Create a new task
exports.createTask = (req, res) => {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error parsing the form' }));
            return;
        }

        const image = files.Image; // Access the image file directly

        if (!image || !image.filepath || !image.newFilename) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'No valid image file uploaded.' }));
            return;
        }

        // Create new task
        const tasks = readTaskFromFile();
        const newTask = {
            id: Date.now(),
            title: fields.title,
            description: fields.description || '',
            status: fields.status || 'pending',
            Image: `/uploads/${image.newFilename}`,
        };

        tasks.push(newTask);
        writeTaskToFile(tasks);

        // Copy the file to the uploads directory
        try {
            copyFileSync(image.filepath, path.join(__dirname, '../uploads', image.newFilename));
        } catch (copyError) {
            console.error('Error copying file:', copyError);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error saving image.' }));
            return;
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTask));
    });
};

// Update an existing task
exports.updateTask = (req, res) => {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error parsing the form' }));
            return;
        }

        const tasks = readTaskFromFile();
        const taskIndex = tasks.findIndex(t => t.id === parseInt(fields.id));

        if (taskIndex !== -1) {
            // Update task fields
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: fields.title || tasks[taskIndex].title,
                description: fields.description || tasks[taskIndex].description,
                status: fields.status || tasks[taskIndex].status,
            };

            // If a new image is uploaded, handle it
            if (files.Image && files.Image.filepath && files.Image.newFilename) {
                // Delete the old image file
                const oldImagePath = path.join(__dirname, '../uploads', tasks[taskIndex].Image.split('/').pop());
                try {
                    unlinkSync(oldImagePath);
                } catch (error) {
                    console.error('Error deleting old image file:', error);
                }

                // Update the image path
                tasks[taskIndex].Image = `/uploads/${files.Image.newFilename}`;

                // Move the new image to the uploads directory
                try {
                    copyFileSync(files.Image.filepath, path.join(__dirname, '../uploads', files.Image.newFilename));
                } catch (copyError) {
                    console.error('Error copying new image file:', copyError);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Error saving new image.' }));
                    return;
                }
            }

            writeTaskToFile(tasks);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(tasks[taskIndex]));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Task not found' }));
        }
    });
};

// Delete a task
exports.deleteTask = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // Convert Buffer to string
    });

    req.on('end', () => {
        const { id } = JSON.parse(body);
        const tasks = readTaskFromFile();
        const taskIndex = tasks.findIndex(t => t.id === id);

        if (taskIndex !== -1) {
            // Remove the task from the array
            const deletedTask = tasks.splice(taskIndex, 1)[0];
            writeTaskToFile(tasks);

            // Delete the associated image file if it exists
            if (deletedTask.Image) {
                const imagePath = path.join(__dirname, '../uploads', deletedTask.Image.split('/').pop());
                try {
                    unlinkSync(imagePath); // Delete the image file
                } catch (error) {
                    console.error('Error deleting image file:', error);
                }
            }

            res.writeHead(204); // No content
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Task not found' }));
        }
    });
};