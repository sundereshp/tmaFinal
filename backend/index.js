const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// In-memory storage
let projects = [];

// Helper function to reassign task IDs sequentially
const reassignTaskIds = () => {
    let taskId = 1;
    projects.forEach(project => {
        project.tasks.forEach(task => {
            task.id = taskId++;
        });
    });
};

// GET all projects
app.get('/api/projects', (req, res) => {
    console.log('GET /api/projects - Returning projects:', projects);
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
    console.log('POST /api/projects - Received body:', req.body);
    
    const requiredFields = ['userID', 'name', 'startDate', 'endDate', 'wsID'];
    const missing = requiredFields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
        console.error('Missing required fields:', missing);
        return res.status(400).json({ 
            error: `Missing required fields: ${missing.join(', ')}`
        });
    }

    const {
        userID, name, startDate, endDate,
        description = '', 
        estHours = 0, actHours = 0, wsID
    } = req.body;

    // Validate required fields
    if (!userID || !name || !startDate || !endDate || !wsID) {
        console.error('Validation failed for project creation');
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newProject = {
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        userID: parseInt(userID),
        name,
        description,
        startDate,
        endDate,
        estHours: parseFloat(estHours),
        actHours: parseFloat(actHours),
        wsID: parseInt(wsID),
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        tasks: []
    };

    console.log('Adding new project:', newProject);
    projects.push(newProject);
    console.log('Projects after addition:', projects);
    
    res.status(201).json(newProject);
});

// PATCH update project
app.patch('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    // Only allow updates to fields in the schema; ignore others
    const allowedUpdates = ['userID', 'name', 'description', 'startDate', 'endDate', 'estHours', 'actHours', 'wsID'];
    const updates = {};
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }

    // Ensure numeric fields are parsed
    if (updates.userID !== undefined) updates.userID = parseInt(updates.userID);
    if (updates.estHours !== undefined) updates.estHours = parseFloat(updates.estHours);
    if (updates.actHours !== undefined) updates.actHours = parseFloat(updates.actHours);
    if (updates.wsID !== undefined) updates.wsID = parseInt(updates.wsID);

    const updatedProject = {
        ...projects[projectIndex],
        ...updates,
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
    console.log('POST /api/tasks - Received body:', req.body);
    
    const {
        wsID, userID, projectID, name, description = '',
        taskLevel = 1, status = 'TODO', parentID = 0,
        level1ID = 0, level2ID = 0, level3ID = 0, level4ID = 0,
        assignee1ID = 0, assignee2ID = 0, assignee3ID = 0,
        estHours = 0, estPrevHours = [], actHours = 0,
        isExeceeded = 0, info = {}
    } = req.body;

    // Validate required fields
    if (!wsID || !userID || !projectID || !name) {
        console.error('Missing required fields:', { wsID, userID, projectID, name });
        return res.status(400).json({ 
            error: 'Missing required fields: wsID, userID, projectID, or name' 
        });
    }

    const projectIndex = projects.findIndex(p => p.id === projectID);
    if (projectIndex === -1) {
        console.error('Project not found for ID:', projectID);
        return res.status(404).json({ error: 'Project not found' });
    }

    // Get the next sequential ID
    const allTasks = projects.reduce((acc, project) => acc.concat(project.tasks), []);
    const newTaskId = allTasks.length + 1;

    const newTask = {
        id: newTaskId,
        wsID: parseInt(wsID),
        userID: parseInt(userID),
        projectID,
        name,
        description,
        taskLevel,
        status,
        parentID,
        level1ID,
        level2ID,
        level3ID,
        level4ID,
        assignee1ID,
        assignee2ID,
        assignee3ID,
        estHours: parseFloat(estHours),
        estPrevHours,
        actHours: parseFloat(actHours),
        isExeceeded,
        info,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
    };

    console.log('Adding new task with ID:', newTaskId);
    projects[projectIndex].tasks.push(newTask);
    
    // Reassign IDs to maintain sequential order
    reassignTaskIds();
    
    res.status(201).json(newTask);
});

// GET tasks for a specific project
app.get('/api/tasks/project/:projectId', (req, res) => {
    const projectId = parseInt(req.params.projectId);
    console.log('GET /api/tasks/project/:projectId - Looking for project:', projectId);
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        console.error('Project not found for ID:', projectId);
        return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Returning tasks for project:', project.tasks);
    res.json(project.tasks);
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const updates = req.body;
    
    // Find project containing the task
    const project = projects.find(p => 
        p.tasks.some(t => t.id === taskId)
    );
    
    if (!project) {
        return res.status(404).json({ error: 'Task not found' });
    }

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    const updatedTask = {
        ...project.tasks[taskIndex],
        ...updates,
        modifiedAt: new Date().toISOString()
    };

    // Validate required fields
    if (!updatedTask.wsID || !updatedTask.userID || !updatedTask.projectID || !updatedTask.name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    project.tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    
    // Find project containing the task
    const projectIndex = projects.findIndex(p => 
        p.tasks.some(t => t.id === taskId)
    );
    
    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    // Remove task from project
    projects[projectIndex].tasks = projects[projectIndex].tasks.filter(t => t.id !== taskId);
    
    // Reassign IDs to maintain sequential order
    reassignTaskIds();
    
    res.json({ 
        success: true,
        message: `Task ${taskId} deleted successfully`
    });
});

// GET all tasks in a structured format
app.get('/api/tasks/list', (req, res) => {
    const allTasks = projects.reduce((acc, project) => {
        return acc.concat(project.tasks.map(task => ({
            ...task,
            projectName: project.name,
            projectID: project.id,
            projectDescription: project.description,
            projectStartDate: project.startDate,
            projectEndDate: project.endDate
        })));
    }, []);

    res.json(allTasks);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Initial projects:', projects);
});
