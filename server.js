const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a81ulqy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const instagramCollection = client.db("socialDashboardDB").collection("instagram");

    // Analytics Related APIs
    app.get('/instagram', async (req, res) => {
      const result = await instagramCollection.find().toArray();
      res.send(result);
    });

    app.get('/api/instagram/:id', async (req, res) => {
      const id = req.params.id;
    
      try {
        const result = await instagramCollection.findOne({ _id: new ObjectId(id) });
    
        if (result) {
          res.json(result);
        } else {
          res.status(404).json({ success: false, message: 'Data not found' });
        }
      } catch (error) {
        console.error('Error fetching data for editing:', error);
        res.status(500).json({ success: false, message: 'Error fetching data for editing' });
      }
    });
   
    app.post('/api/instagram', async (req, res) => {
        const data = req.body;
        const result = await instagramCollection.insertOne(data);
        res.send(result);
      });

    app.put('/api/instagram/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      try {
        const result = await instagramCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
    
        if (result.modifiedCount === 1) {
          res.json({ success: true });
        } else {
          res.status(404).json({ success: false, message: 'Data not found or not modified' });
        }
      } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ success: false, message: 'Error updating data' });
      }
    });
    
  
app.delete('/api/instagram/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await instagramCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Data not found' });
    }
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ success: false, message: 'Error deleting data' });
  }
});

app.get('/api/goals', async (req, res) => {
  try {
    const goalsCollection = client.db("socialDashboardDB").collection('goals');
    const goalData = await goalsCollection.find().toArray();
    res.json(goalData);
  } catch (error) {
    console.error('Error fetching goal data:', error);
    res.status(500).json({ error: 'Failed to fetch goal data.' });
  }
});


app.post('/api/goals', async (req, res) => {
  const { goalHeading, followers, profileVisits, postInteractions, engagementRate } = req.body;
  const goalsCollection = client.db("socialDashboardDB").collection('goals');

  goalsCollection.insertOne({
    goalHeading,
    followers: parseInt(followers),
    profileVisits: parseInt(profileVisits),
    postInteractions: parseInt(postInteractions),
    engagementRate: parseFloat(engagementRate.replace("%", "")) / 100,
    date: new Date()
  })
  .then((result) => {
    res.json(result);
  })
  .catch((error) => {
    console.error('Error saving goal data:', error);
    res.status(500).json({ error: 'Failed to save goal data.' });
  });
});


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Social Dashboard is Running')
})

app.listen(port, () => {
  console.log(`Social Media Dashboard is Running On Port: ${port}`)
})