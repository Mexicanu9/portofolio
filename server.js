
const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();
const PORT = 3000;

const cors = require('cors');
// Dev-friendly CORS: reflect the request origin so LAN devices (Live Server on your PC IP:5500) can call the API
app.use(cors({ origin: true }));
app.use(express.json());

const EVENTS_FILE = path.join(__dirname, 'events.json');

// Helper: Read events from file
function readEvents() {
    if (!fs.existsSync(EVENTS_FILE)) return [];
    const data = fs.readFileSync(EVENTS_FILE, 'utf8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

// Helper: Write events to file
function writeEvents(events) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
}

// GET /events - retrieve all events
app.get('/events', (req, res) => {
    const events = readEvents();
    res.json(events);
});

// POST /events - save a new event
app.post('/events', (req, res) => {
    const events = readEvents();
    // Ensure all fields are present
    const { date, title, info } = req.body;
    if (!date || !title) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const newEvent = { date, title, info, id: Date.now().toString() };
    events.push(newEvent);
    writeEvents(events);
    res.status(201).json(newEvent);
});
// PUT /events/:id - update an event
app.put('/events/:id', (req, res) => {
    const events = readEvents();
    const eventId = req.params.id;
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
    }
    // Update event fields
    events[eventIndex] = { ...events[eventIndex], ...req.body, id: eventId };
    writeEvents(events);
    res.json(events[eventIndex]);
});

// DELETE /events/:id - delete an event
app.delete('/events/:id', (req, res) => {
    const events = readEvents();
    const eventId = req.params.id;
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
    }
    events.splice(eventIndex, 1);
    writeEvents(events);
    res.json({ message: 'Event deleted' });
});

app.listen(PORT, '0.0.0.0', () => {
    const nets = os.networkInterfaces();
    const addrs = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) addrs.push(net.address);
        }
    }
    console.log('Server running:');
    console.log(`- Local:   http://localhost:${PORT}`);
    addrs.forEach(ip => console.log(`- Network: http://${ip}:${PORT}`));
});
