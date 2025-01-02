const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory storage for simplicity
let rooms = [];
let bookings = [];

// 1. Create a room
app.post('/create-room', (req, res) => {
    const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;

    if (!roomName || !seatsAvailable || !amenities || !pricePerHour) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const room = {
        id: rooms.length + 1,
        roomName,
        seatsAvailable,
        amenities,
        pricePerHour,
        bookings: []
    };

    rooms.push(room);
    res.status(201).json({ message: 'Room created successfully!', room });
});

// 2. Book a room
app.post('/book-room', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    if (!customerName || !date || !startTime || !endTime || !roomId) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        return res.status(404).json({ message: 'Room not found!' });
    }

    // Check if the room is already booked for the given date and time
    const isBooked = room.bookings.some(booking => 
        booking.date === date && (
            (startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime)
        )
    );

    if (isBooked) {
        return res.status(400).json({ message: 'Room is already booked for the given time!' });
    }

    const booking = {
        customerName,
        date,
        startTime,
        endTime
    };

    room.bookings.push(booking);
    bookings.push({
        roomId: room.id,
        roomName: room.roomName,
        ...booking
    });

    res.status(201).json({ message: 'Room booked successfully!', booking });
});

// 3. List all rooms with their booked dates
app.get('/rooms', (req, res) => {
    const roomDetails = rooms.map(room => ({
        roomName: room.roomName,
        bookings: room.bookings
    }));

    res.json(roomDetails);
});

// 4. List all customers with their booking details
app.get('/customers', (req, res) => {
    res.json(bookings);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
