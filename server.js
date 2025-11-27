const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'reviews.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

//initialize reviews file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

//get all reviews
app.get('/api/reviews', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const reviews = JSON.parse(data);
        res.json(reviews);
    } catch (error) {
        console.error('Error reading reviews:', error);
        res.status(500).json({ error: 'Failed to load reviews' });
    }
});

//add a new review
app.post('/api/reviews', (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        if (!rating) {
            return res.status(400).json({ error: 'Rating is required' });
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const reviews = JSON.parse(data);

        //timezones bro
        const estDate = new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        const newReview = {
            rating,
            comment: comment || 'No comment',
            date: estDate
        };
        
        reviews.unshift(newReview);
        fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2));
        
        res.json({ success: true, review: newReview });
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ error: 'Failed to save review' });
    }
});

//delete all reviews 
app.delete('/api/reviews', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        res.json({ success: true, message: 'All reviews deleted' });
    } catch (error) {
        console.error('Error deleting reviews:', error);
        res.status(500).json({ error: 'Failed to delete reviews' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Reviews stored in: ${DATA_FILE}`);
});