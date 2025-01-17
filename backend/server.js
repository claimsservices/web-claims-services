const express = require('express');
const authRoutes = require('./routes/controller');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5400; // Use Azure-provided port or default to 8181

app.use(express.json());

app.get('/', (req, res) => res.send('Server running'));

// Routes
app.use('/api', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
