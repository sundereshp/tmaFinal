require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { pool, testConnection, initializeDatabase } = require('./db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost', 'http://127.0.0.1'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Add logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});
// Start server
async function startServer(port) {
    const server = app.listen(port)
        .on('error', async (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is in use, trying port ${port + 1}...`);
                await startServer(port + 1);
            } else {
                console.error('Server error:', err);
                process.exit(1);
            }
        })
        .on('listening', () => {
            console.log(`Server running on port ${port}`);
        });

    try {
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }
        await initializeDatabase();
    } catch (error) {
        console.error('Failed to start server:', error);
        server.close();
        process.exit(1);
    }
}
// Create a router for the API with base path
const apiRouter = express.Router();
app.use('/sunderesh/backend', apiRouter);

// Configure email transporter with Hostinger SMTP
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'anand@aisrv.in',
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
});
  

// Generate 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP Endpoint
apiRouter.post('/send-otp', async (req, res) => {
    console.log('Received OTP request');

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Basic email validation
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Email not found in our system'
            });
        }

        // Generate 4-digit OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Store OTP in database
        await pool.query(
            'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?',
            [otp, otpExpiry, email]
        );

        // Verify transporter
        await transporter.verify();

        // Send OTP email
        const mailOptions = {
            from: `"Task Management App" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset OTP</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                            Hello! You requested to reset your password. Here's your One-Time Password:
                        </p>
                        <div style="background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
                            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                                ${otp}
                            </div>
                        </div>
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                ⏰ <strong>Important:</strong> This OTP will expire in 10 minutes for security reasons.
                            </p>
                        </div>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            This is an automated message from Task Management App. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`4-digit OTP sent to ${email}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent to your email successfully',
            // For development only - remove in production
            ...(process.env.NODE_ENV === 'development' && { otp })
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send OTP. Please try again.',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

// Verify OTP Endpoint
apiRouter.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Email and OTP are required'
            });
        }

        // Verify OTP from database
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > ?',
            [email, otp, Date.now()]
        );

        if (users.length === 0) {
            // Check if OTP exists but expired
            const [expiredOtp] = await pool.query(
                'SELECT * FROM users WHERE email = ? AND otp = ?',
                [email, otp]
            );

            if (expiredOtp.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'OTP has expired. Please request a new one.'
                });
            }

            return res.status(400).json({
                success: false,
                error: 'Invalid OTP. Please check and try again.'
            });
        }

        // Generate a temporary reset token for the password reset step
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

        // Store reset token and clear OTP
        await pool.query(
            'UPDATE users SET resetToken = ?, resetTokenExpiry = ?, otp = NULL, otp_expiry = NULL WHERE email = ?',
            [resetToken, resetTokenExpiry, email]
        );

        res.json({
            success: true,
            message: 'OTP verified successfully',
            resetToken
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify OTP. Please try again.',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

// Reset Password Endpoint
apiRouter.post('/reset-password', async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Email, reset token, and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Find user with valid reset token
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND resetToken = ? AND resetTokenExpiry > ?',
            [email, resetToken, Date.now()]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        // Update password and clear reset token
        // TODO: Hash the password before saving in production!
        await pool.query(
            'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE email = ?',
            [newPassword, email]
        );

        // Send confirmation email
        const mailOptions = {
            from: `"Task Management App" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Successful',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Password Reset Successful</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333;">
                            Your password has been successfully reset. You can now login with your new password.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:8080/login" 
                               style="display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Go to Login
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            If you didn't make this change, please contact our support team immediately.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset password. Please try again.',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

// Other existing endpoints (login, signup, etc.)
apiRouter.post('/users', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const [result] = await pool.query(
            'INSERT INTO users (email, password, name, createdAt, modifiedAt) VALUES (?, ?, ?, NOW(), NOW())',
            [email, password, name]
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Failed to create user',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
});

apiRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [rows] = await pool.query('SELECT id, name, password FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({
            message: 'Login successful',
            userId: user.id,
            name: user.name
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



const PORT = process.env.PORT || 5000;
console.log(`Starting server on port ${PORT}...`);
startServer(PORT);

apiRouter.get('/projects', async (req, res) => {
    try {
        const [projects] = await pool.query('SELECT * FROM projects ORDER BY id');
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
apiRouter.get('/test', async (req, res) => {
    try {
        res.status(200).json({ message: 'Test successful' });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
// DELETE a project and all its tasks
apiRouter.delete('/projects/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const projectId = req.params.id;

        // 1. First verify the project exists
        const [projects] = await connection.query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (projects.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Project not found' });
        }

        // 2. Delete all tasks associated with this project
        await connection.query('DELETE FROM tasks WHERE projectID = ?', [projectId]);

        // 3. Delete the project
        await connection.query('DELETE FROM projects WHERE id = ?', [projectId]);

        await connection.commit();
        res.status(200).json({ message: 'Project and all associated tasks deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    } finally {
        connection.release();
    }
});

// GET single project with its tasks
apiRouter.get('/projects/:id', async (req, res) => {
    try {
        const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const [tasks] = await pool.query('SELECT * FROM tasks WHERE projectID = ?', [req.params.id]);
        const project = { ...projects[0], tasks };
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// POST create new project
apiRouter.post('/projects', async (req, res) => {
    try {
        const requiredFields = ['userID', 'name', 'startDate', 'endDate', 'wsID'];
        const missing = requiredFields.filter(field => !req.body[field]);

        if (missing.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missing.join(', ')}`
            });
        }

        const { description, userID, name, startDate, endDate, estHours = 0, actHours = 0, wsID } = req.body;
        const now = new Date();

        // Format dates for MySQL (YYYY-MM-DD HH:MM:SS)
        const formatDateForMySQL = (date) => {
            const d = new Date(date);
            return d.toISOString().slice(0, 19).replace('T', ' ');
        };

        const [result] = await pool.query(
            'INSERT INTO projects (userID, name, description, startDate, endDate, estHours, actHours, wsID, createdAt, modifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userID,
                name,
                description,
                formatDateForMySQL(startDate),
                formatDateForMySQL(endDate),
                estHours,
                actHours,
                wsID,
                formatDateForMySQL(now),
                formatDateForMySQL(now)
            ]
        );

        // Get the newly created project
        const [newProject] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);

        // Initialize with empty tasks array
        const response = { ...newProject[0], tasks: [] };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            error: 'Failed to create project',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PATCH update project
apiRouter.patch('/projects/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const projectId = req.params.id;
        const updates = req.body;
        const allowedUpdates = ['name', 'description', 'startDate', 'endDate', 'estHours', 'actHours', 'wsID'];

        // Build the update query
        const updateFields = [];
        const values = [];

        for (const field of allowedUpdates) {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }

        if (updateFields.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Add modifiedAt timestamp
        updateFields.push('modifiedAt = ?');
        values.push(new Date());

        // Add projectId for WHERE clause
        values.push(projectId);

        const query = `
            UPDATE projects 
            SET ${updateFields.join(', ')} 
            WHERE id = ?`;

        const [result] = await connection.query(query, values);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Project not found' });
        }

        // Get the updated project
        const [updatedProject] = await connection.query('SELECT * FROM projects WHERE id = ?', [projectId]);

        await connection.commit();

        // Return the updated project
        res.json(updatedProject[0]);
    } catch (error) {
        await connection.rollback();
        console.error('Error updating project:', error);
        res.status(500).json({
            error: 'Failed to update project',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
});

// GET all tasks
apiRouter.get('/tasks', async (req, res) => {
    try {
        const [tasks] = await pool.query('SELECT * FROM tasks');
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST create new task (including subtasks)
apiRouter.post('/tasks', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            description, wsID, userID, projectID, name,
            taskLevel = 1, status = 'todo', parentID = 0,
            assignee1ID = 0, assignee2ID = 0, assignee3ID = 0,
            estHours = 0, estPrevHours = [], actHours = 0,
            isExceeded = 0, info = {}, taskType = 'task',
            priority = 'low', dueDate = null, comments = ''
        } = req.body;

        // Check if project exists
        const [projects] = await connection.query('SELECT id FROM projects WHERE id = ?', [projectID]);
        if (projects.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Project not found' });
        }

        // Initialize level IDs
        let level1ID = 0, level2ID = 0, level3ID = 0, level4ID = 0;

        // Handle hierarchy levels if this is not a top-level task
        if (taskLevel > 1 && parentID) {
            const [parentTasks] = await connection.query(
                'SELECT id, level1ID, level2ID, level3ID, level4ID, taskLevel FROM tasks WHERE id = ?',
                [parentID]
            );

            if (parentTasks.length === 0) {
                await connection.rollback();
                return res.status(400).json({ error: 'Parent task not found' });
            }

            const parent = parentTasks[0];

            // Set level IDs based on parent's level
            level1ID = parent.level1ID || (parent.taskLevel === 1 ? parent.id : 0);
            level2ID = parent.level2ID || (parent.taskLevel === 2 ? parent.id : 0);
            level3ID = parent.level3ID || (parent.taskLevel === 3 ? parent.id : 0);
            level4ID = parent.level4ID || (parent.taskLevel === 4 ? parent.id : 0);

            // Ensure parentID is set correctly based on task level
            // No need to reset parentID as it's already set from the request
        }

        // Insert the new task
        const now = new Date();
        const [result] = await connection.query(
            `INSERT INTO tasks (
                wsID, userID, projectID, name, description, taskLevel, status, parentID,
                level1ID, level2ID, level3ID, level4ID,
                assignee1ID, assignee2ID, assignee3ID,
                estHours, estPrevHours, actHours, isExceeded,
                priority, info, taskType, dueDate, comments,
                createdAt, modifiedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                wsID, userID, projectID, name, description, taskLevel, status, parentID || 0,
                level1ID, level2ID, level3ID, level4ID,
                assignee1ID || 0, assignee2ID || 0, assignee3ID || 0,
                estHours, JSON.stringify(estPrevHours), actHours, isExceeded,
                priority, JSON.stringify(info || {}), taskType, dueDate, comments || '',
                now, now
            ]
        );

        const newTaskId = result.insertId;

        // Update the level IDs for the new task
        if (taskLevel === 1) {
            // For top-level tasks, set level1ID to its own ID
            await connection.query(
                'UPDATE tasks SET level1ID = ? WHERE id = ?',
                [newTaskId, newTaskId]
            );
        } else if (taskLevel === 2) {
            // For subtasks, set level2ID to its own ID and ensure parentID is set to the task ID
            await connection.query(
                'UPDATE tasks SET level2ID = ?, parentID = ? WHERE id = ?',
                [newTaskId, level1ID, newTaskId]
            );
        } else if (taskLevel === 3) {
            // For action items, set level3ID to its own ID and ensure parentID is set to the subtask ID
            await connection.query(
                'UPDATE tasks SET level3ID = ?, parentID = ? WHERE id = ?',
                [newTaskId, level2ID, newTaskId]
            );
        } else if (taskLevel === 4) {
            // For sub-actions, set level4ID to its own ID and ensure parentID is set to the action item ID
            await connection.query(
                'UPDATE tasks SET level4ID = ?, parentID = ? WHERE id = ?',
                [newTaskId, level3ID, newTaskId]
            );
        }

        // Get the complete task with updated fields
        const [newTask] = await connection.query('SELECT * FROM tasks WHERE id = ?', [newTaskId]);

        if (newTask.length === 0) {
            throw new Error('Failed to retrieve created task');
        }

        await connection.commit();

        try {
            // Check if fields are already objects before parsing
            const responseTask = {
                ...newTask[0],
                estPrevHours: typeof newTask[0].estPrevHours === 'string'
                    ? JSON.parse(newTask[0].estPrevHours)
                    : (newTask[0].estPrevHours || []),
                info: typeof newTask[0].info === 'string'
                    ? JSON.parse(newTask[0].info)
                    : (newTask[0].info || {})
            };

            res.status(201).json(responseTask);
        } catch (parseError) {
            console.error('Error parsing task data:', parseError);
            // Return the task with default values if parsing fails
            res.status(201).json({
                ...newTask[0],
                estPrevHours: [],
                info: {}
            });
        }
    } catch (error) {
        await connection.rollback();
        console.error('Error creating task:', error);
        res.status(500).json({
            error: 'Failed to create task',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection && typeof connection.release === 'function') {
            await connection.release();
        }
    }
});

// GET tasks for a specific project
apiRouter.get('/tasks/project/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId;
        console.log(projectId);
        // Check if project exists
        const [projects] = await pool.query('SELECT id FROM projects WHERE id = ?', [projectId]);
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        console.log(projects);
        // Get all tasks for the project
        const [tasks] = await pool.query('SELECT * FROM tasks WHERE projectID = ?', [projectId]);
        console.log(tasks);
        // Parse JSON fields with error handling
        const parsedTasks = tasks.map(task => {
            try {
                return {
                    ...task,
                    estPrevHours: task.estPrevHours ? safeJsonParse(task.estPrevHours, []) : [],
                    info: task.info ? safeJsonParse(task.info, {}) : {}
                };
            } catch (parseError) {
                console.error('Error parsing task data for task ID', task.id, ':', parseError);
                return {
                    ...task,
                    estPrevHours: [],
                    info: {}
                };
            }
        });

        res.json(parsedTasks);
    } catch (error) {
        console.error('Error fetching project tasks:', error);
        res.status(500).json({
            error: 'Failed to fetch tasks',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PUT update task
apiRouter.put('/tasks/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const taskId = req.params.id;
        const updates = req.body;

        // --- Handle comments field ---
        if (updates.comments) {
            try {
                // Parse the comments if they're a string
                const parsedComments = typeof updates.comments === 'string'
                    ? JSON.parse(updates.comments)
                    : updates.comments;

                // Validate and normalize the comments structure
                if (Array.isArray(parsedComments)) {
                    updates.comments = JSON.stringify(parsedComments.map(comment => ({
                        id: comment.id || Date.now().toString(),
                        userId: comment.userId || comment.userID || 0, // Handle both field names
                        text: comment.text || '',
                        createdAt: comment.createdAt || new Date().toISOString()
                    })));
                } else {
                    // If not an array, make it an empty array
                    updates.comments = '[]';
                }
            } catch (e) {
                console.error('Error processing comments:', e);
                updates.comments = '[]'; // Default to empty array on error
            }
        }

        // --- Fetch current task ---
        const [currentTask] = await connection.query(
            'SELECT estHours, estPrevHours, taskLevel FROM tasks WHERE id = ?',
            [taskId]
        );

        if (currentTask.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Task not found' });
        }

        // --- Handle estHours history ---
        if (updates.estHours !== undefined) {
            let history = [];

            if (currentTask[0].estPrevHours) {
                try {
                    const parsed = typeof currentTask[0].estPrevHours === 'string'
                        ? JSON.parse(currentTask[0].estPrevHours)
                        : currentTask[0].estPrevHours;

                    history = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    history = [];
                }
            }

            history.push({
                value: currentTask[0].estHours,
                timestamp: new Date().toISOString()
            });

            updates.estPrevHours = JSON.stringify(history);
        }

        // --- Prepare update fields ---
        const updateFields = [];
        const values = [];
        const allowedUpdates = [
            'name', 'description', 'status', 'assignee1ID', 'assignee2ID', 'assignee3ID',
            'estHours', 'estPrevHours', 'actHours', 'priority', 'dueDate', 'comments',
            'taskType', 'expanded'
        ];

        for (const field of allowedUpdates) {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                values.push(field === 'dueDate' && updates[field]
                    ? formatDateForMySQL(updates[field])
                    : updates[field]);
            }
        }

        if (updateFields.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Add modifiedAt
        updateFields.push('modifiedAt = ?');
        values.push(new Date());

        // Add WHERE id
        values.push(taskId);

        // Perform update
        await connection.query(`
            UPDATE tasks 
            SET ${updateFields.join(', ')} 
            WHERE id = ?
        `, values);

        // Fetch updated task
        const [updatedTasks] = await connection.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

        if (updatedTasks.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Task not found after update' });
        }

        await connection.commit();

        // Parse relevant JSON fields and ensure comments are properly formatted
        const updatedTask = {
            ...updatedTasks[0],
            estPrevHours: typeof updatedTasks[0].estPrevHours === 'string'
                ? JSON.parse(updatedTasks[0].estPrevHours || '[]')
                : (updatedTasks[0].estPrevHours || []),
            info: typeof updatedTasks[0].info === 'string'
                ? JSON.parse(updatedTasks[0].info || '{}')
                : (updatedTasks[0].info || {}),
            comments: typeof updatedTasks[0].comments === 'string'
                ? JSON.parse(updatedTasks[0].comments || '[]')
                : (updatedTasks[0].comments || [])
        };

        res.json(updatedTask);
    } catch (error) {
        await connection.rollback();
        console.error('Error updating task:', error);
        res.status(500).json({
            error: 'Failed to update task',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
});


// DELETE task
apiRouter.delete('/tasks/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const taskId = req.params.id;

        // First, get the task to determine its level
        const [tasks] = await connection.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (tasks.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Task not found' });
        }

        const taskToDelete = tasks[0];
        const projectId = taskToDelete.projectID;

        // Determine which level ID to match based on the deleted task's level
        const levelMap = {
            1: 'level1ID',
            2: 'level2ID',
            3: 'level3ID',
            4: 'level4ID'
        };

        const targetField = levelMap[taskToDelete.taskLevel];
        if (!targetField) {
            await connection.rollback();
            return res.status(400).json({ error: 'Invalid task level' });
        }

        // Get all tasks in the project that are at the same or deeper level
        const [allTasks] = await connection.query('SELECT id, ' + targetField + ' FROM tasks WHERE projectID = ?', [projectId]);

        const idsToDelete = new Set([taskId]);

        // First pass: Get direct children
        allTasks.forEach(task => {
            if (task[targetField] == taskId) { // Using == for type coercion
                idsToDelete.add(task.id);
            }
        });

        // Subsequent passes: Find descendants of descendants
        let currentSize;
        do {
            currentSize = idsToDelete.size;
            allTasks.forEach(task => {
                if (idsToDelete.has(task[targetField]) && !idsToDelete.has(task.id)) {
                    idsToDelete.add(task.id);
                }
            });
        } while (currentSize !== idsToDelete.size);

        // Convert Set to array for SQL IN clause
        const idsToDeleteArray = Array.from(idsToDelete);

        // Delete all collected tasks
        await connection.query('DELETE FROM tasks WHERE id IN (?)', [idsToDeleteArray]);

        await connection.commit();

        res.json({
            success: true,
            deletedCount: idsToDelete.size
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    } finally {
        connection.release();
    }
});

// Helper function to format date for MySQL (YYYY-MM-DD HH:MM:SS)
function formatDateForMySQL(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper function to safely parse JSON
function safeJsonParse(jsonString, defaultValue) {
    // If it's already an object/array, return it as is
    if (typeof jsonString === 'object' && jsonString !== null) {
        return jsonString;
    }

    // If it's not a string, return the default value
    if (typeof jsonString !== 'string') {
        return defaultValue;
    }

    // If it's an empty string, return the default value
    if (jsonString.trim() === '') {
        return defaultValue;
    }

    try {
        const parsed = JSON.parse(jsonString);
        // If parsing succeeded but the result is null/undefined, return the default value
        return parsed === null || parsed === undefined ? defaultValue : parsed;
    } catch (e) {
        console.error('JSON parse error:', e);
        return defaultValue;
    }
}
