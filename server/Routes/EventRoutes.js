import express from 'express';
import Event from '../Models/Event.js';

const router = express.Router();


// Get all events
router.get('/events', async (req, res) => {
  try {
    console.log("EventsRequest received to backend");
    const events = await Event.find().sort({ date: 1 });
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// Get single event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch event' });
  }
});

// Add new event
router.post('/events/addEvent', async (req, res) => {
  try {
    const eventData = req.body;
    console.log("Received event data:", eventData);
    
    // Basic validation
    if (!eventData.name || !eventData.date) {
      return res.status(400).json({ success: false, message: 'Name and date are required' });
    }

    const newEvent = new Event(eventData);
    await newEvent.save();
    
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ success: false, message: 'Failed to add event' });
  }
});

// Update event
router.put('/events/:id', async (req, res) => {
  try {
    const eventData = req.body;
    
    // Basic validation
    if (!eventData.name || !eventData.date) {
      return res.status(400).json({ success: false, message: 'Name and date are required' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    
    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});


export default router;