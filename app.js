const express = require('express');
const cors = require('cors');

const videoRoutes = require('./routes/videoRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Register video routes
app.use('/api/video', videoRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
