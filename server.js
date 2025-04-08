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
