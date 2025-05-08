const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const taskFilePath = path.join(DATA_DIR, 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory and files exist
async function ensureDataFiles() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });

        // Ensure projects file exists
        try {
            await fs.access(PROJECTS_FILE);
            const data = await fs.readFile(PROJECTS_FILE, 'utf8');
            const projects = JSON.parse(data);

            // Ensure each project has a tasks array
            const updatedProjects = projects.map(project => ({
                ...project,
                tasks: project.tasks || []
            }));

            await fs.writeFile(PROJECTS_FILE, JSON.stringify(updatedProjects, null, 2));
        } catch (error) {
            await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
        }

        // Ensure tasks file exists
        try {
            await fs.access(taskFilePath);
        } catch (error) {
            await fs.writeFile(taskFilePath, JSON.stringify([], null, 2));
        }

        console.log('Data files initialized successfully');
    } catch (error) {
        console.error('Error setting up data files:', error);
        throw error;
    }
}

// GET all projects (without tasks)
app.get('/api/projects', async (req, res) => {
    try {
        const data = await fs.readFile(PROJECTS_FILE, 'utf8');
        const projects = JSON.parse(data);

        // Remove tasks from each project before sending
        const projectsWithoutTasks = projects.map(project => ({
            ...project,
            tasks: [] // Keep the tasks array but empty
        }));

        res.json(projectsWithoutTasks);
    } catch (error) {
        console.error('Error reading projects:', error);
        res.status(500).json({ error: 'Failed to read projects' });
    }
});

// GET single project by ID (without tasks)
app.get('/api/projects/:id', async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const data = await fs.readFile(PROJECTS_FILE, 'utf8');
        const projects = JSON.parse(data);
        const project = projects.find(p => p.id === projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Remove tasks before sending
        const projectWithoutTasks = {
            ...project,
            tasks: [] // Keep the tasks array but empty
        };

        res.json(projectWithoutTasks);
    } catch (error) {
        console.error('Error reading project:', error);
        res.status(500).json({ error: 'Failed to read project' });
    }
});

// POST create new project
app.post('/api/projects', async (req, res) => {
    try {
        const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
        const currentDate = new Date().toISOString().split('T')[0];

        const newProject = {
            id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
            userID: req.body.userID || 1,
            name: req.body.name,
            description: req.body.description || '',
            startDate: req.body.startDate || currentDate,
            endDate: req.body.endDate || currentDate,
            estHours: req.body.estHours || 0,
            actHours: 0,
            wsID: req.body.wsID || 1,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            tasks: []
        };

        projects.push(newProject);
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// PATCH update project
app.patch('/api/projects/:id', async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const updates = req.body;

        const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
        const projectIndex = projects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updatedProject = {
            ...projects[projectIndex],
            ...updates,
            id: projectId,
            modifiedAt: new Date().toISOString()
        };

        projects[projectIndex] = updatedProject;
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
        const initialLength = projects.length;

        const updatedProjects = projects.filter(p => p.id !== projectId);

        if (updatedProjects.length === initialLength) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await fs.writeFile(PROJECTS_FILE, JSON.stringify(updatedProjects, null, 2));
        res.status(200).json({ success: true, id: projectId });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// POST /api/tasks - Create a new task
app.get('/api/tasks', (req, res) => {
    fs.readFile(taskFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading task file:', err);
            return res.status(500).json({ error: 'Failed to read tasks' });
        }

        try {
            const tasks = JSON.parse(data);
            res.json(tasks);
        } catch (parseErr) {
            console.error('Error parsing task file:', parseErr);
            res.status(500).json({ error: 'Failed to parse tasks' });
        }
    });
});

// POST /api/tasks — add a new task
app.post('/api/tasks', (req, res) => {
    fs.readFile(taskFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading task file:', err);
            return res.status(500).json({ error: 'Failed to read tasks' });
        }

        let tasks = [];
        try {
            tasks = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing task file:', parseErr);
        }

        const newTask = {
            id: Date.now(), // or use a UUID
            ...req.body,
            createdAt: new Date(),
            modifiedAt: new Date()
        };

        tasks.push(newTask);

        fs.writeFile(taskFilePath, JSON.stringify(tasks, null, 2), err => {
            if (err) {
                console.error('Error writing task file:', err);
                return res.status(500).json({ error: 'Failed to save task' });
            }

            res.status(201).json(newTask);
        });
    });
});
// PUT /api/tasks/:id - Update a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const updates = req.body;

        // Read tasks from file
        const tasksData = await fs.readFile(taskFilePath, 'utf8');
        const tasks = JSON.parse(tasksData);

        // Find and update task
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }

        tasks[taskIndex] = { ...tasks[taskIndex], ...updates, modifiedAt: new Date().toISOString() };

        // Write tasks back to file
        await fs.writeFile(taskFilePath, JSON.stringify(tasks, null, 2));

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);

        // Read tasks from file
        const tasksData = await fs.readFile(taskFilePath, 'utf8');
        const tasks = JSON.parse(tasksData);

        // Find and remove task
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = tasks[taskIndex];
        tasks.splice(taskIndex, 1);

        // Write tasks back to file
        await fs.writeFile(taskFilePath, JSON.stringify(tasks, null, 2));

        // Remove task ID from project's tasks array
        const projectsData = await fs.readFile(PROJECTS_FILE, 'utf8');
        const projects = JSON.parse(projectsData);

        const project = projects.find(p => p.id === task.projectID);
        if (project) {
            project.tasks = project.tasks.filter(t => t !== taskId);
            await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Start server
async function startServer() {
    await ensureDataFiles();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
