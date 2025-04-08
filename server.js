const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;
const notesFile = path.join(__dirname, 'notes.json');

// Middleware
app.use(express.json());
app.use(cors()); // Allow cross-origin requests from the frontend

// Ensure notes.json exists and is initialized with an empty array if it doesn't
async function initializeNotesFile() {
    try {
        await fs.access(notesFile);
        const data = await fs.readFile(notesFile, 'utf8');
        // If file is empty or corrupted, reset it
        if (!data || !Array.isArray(JSON.parse(data))) {
            await fs.writeFile(notesFile, JSON.stringify([], null, 2));
        }
    } catch (error) {
        // File doesn't exist or other error, create it
        await fs.writeFile(notesFile, JSON.stringify([], null, 2));
    }
}

// Serve a simple HTML page at the root URL
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Note Pad</title>
            <style>
                body {
                    background: linear-gradient(135deg, #1e1e1e, #2d2d2d);
                    color: #e0e0e0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    height: 100vh;
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                h1 {
                    font-size: 3rem;
                    color: #bb86fc;
                    text-shadow: 0 0 10px rgba(187, 134, 252, 0.5);
                }
            </style>
        </head>
        <body>
            <h1>Note Pad</h1>
        </body>
        </html>
    `);
});

// Get all notes
app.get('/api/notes', async (req, res) => {
    try {
        const data = await fs.readFile(notesFile, 'utf8');
        const notes = JSON.parse(data);
        res.status(200).json(notes);
    } catch (error) {
        console.error('Error reading notes:', error);
        res.status(500).json({ error: 'Failed to load notes' });
    }
});

// Add a new note
app.post('/api/notes', async (req, res) => {
    try {
        const noteText = req.body.text;
        if (!noteText || typeof noteText !== 'string') {
            return res.status(400).json({ error: 'Note text is required and must be a string' });
        }
        const data = await fs.readFile(notesFile, 'utf8');
        const notes = JSON.parse(data);
        notes.push(noteText);
        await fs.writeFile(notesFile, JSON.stringify(notes, null, 2));
        res.status(201).json({ message: 'Note added successfully', note: noteText });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// Start the server
async function startServer() {
    await initializeNotesFile();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

// Handle server startup errors
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
