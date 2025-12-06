const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
app.use(cors());

console.log('MONGODB_USER:', process.env.MONGODB_USER);
console.log('MONGODB_PASSWORD:', process.env.MONGODB_PASSWORD);  
console.log('MONGODB_HOST:', process.env.MONGODB_HOST);
console.log('MONGODB_PORT:', process.env.MONGODB_PORT);

const URI = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}` +
            `@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/`;

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Successfully connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); 
});

// Define Grade schema
const gradeSchema = new mongoose.Schema({
  name: String,
  subject: String,
  score: Number,
});

// Create Grade model
const Grade = mongoose.model('Grade', gradeSchema);

app.get('/grades', async (req, res) => {
  console.log('Received GET request for grades');
  const grades = await Grade.find();
  res.json(grades);
});

app.post('/grades', async (req, res) => {
  const { name, subject, score } = req.body;
  const newGrade = new Grade({ name, subject, score });
  await newGrade.save();
  console.log('Received POST request, added new grade:', newGrade);
  res.json(newGrade);
});

// health and readiness endpoints for Kubernetes probes
app.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

app.get('/readyz', (req, res) => {
  res.sendStatus(200);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Grade service is running on port ${port}`);
});