const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let projects = [];

// GET all projects
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

// GET single project
app.get('/api/projects/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
});

// POST create new project
app.post('/api/projects', (req, res) => {
    const newProject = {
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        userID: req.body.userID,
        name: req.body.name,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        estHours: parseFloat(req.body.estHours) || 0,
        actHours: parseFloat(req.body.actHours) || 0,
        wsID: req.body.wsID,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        tasks: []
    };
    projects.push(newProject);
    res.status(201).json(newProject);
});

// PATCH update project
app.patch('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = {
        ...projects[projectIndex],
        ...req.body,
        modifiedAt: new Date().toISOString()
    };
    
    projects[projectIndex] = updatedProject;
    res.json(updatedProject);
});

// DELETE project
app.delete('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    projects = projects.filter(p => p.id !== projectId);
    res.json({ success: true });
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
    const allTasks = projects.reduce((acc, project) => acc.concat(project.tasks), []);
    res.json(allTasks);
});

// POST create new task
app.post('/api/tasks', (req, res) => {
    const projectId = req.body.projectId;
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const newTask = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date(),
        modifiedAt: new Date()
    };
    projects[projectIndex].tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    
    // Find the project containing this task
    const project = projects.find(p => 
        p.tasks && p.tasks.some(t => t.id === taskId)
    );
    
    if (!project) {
        return res.status(404).json({ error: 'Task not found' });
    }

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    const updatedTask = {
        ...project.tasks[taskIndex],
        ...req.body,
        modifiedAt: new Date().toISOString()
    };
    
    project.tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    
    // Find the project containing this task
    const project = projects.find(p => 
        p.tasks && p.tasks.some(t => t.id === taskId)
    );
    
    if (!project) {
        return res.status(404).json({ error: 'Task not found' });
    }

    // Remove the task from the project's tasks array
    project.tasks = project.tasks.filter(t => t.id !== taskId);
    
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
