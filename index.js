const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const objectid = require('mongodb').ObjectId;
const cors = require('cors')
const fs = require('fs-extra')
require('dotenv').config()



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y8hyt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(fileUpload());
const port = 9000

app.get('/', (req, res) => {
  res.send('Hello Creative agency world!')
})



client.connect(err => {
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");
  const massageCollection = client.db(`${process.env.DB_NAME}`).collection("massages");

   //add order

  app.post('/addOrder', (req, res) => {
    const orders = req.body;
    orderCollection.insertOne(orders)
    .then(result => {
      res.send(result.insertedCount)
      console.log(orders);
    })
})

//show order list
app.get('/myServiceList', (req, res) => {
  orderCollection.find({email: req.query.email})
  .toArray((err, documents) => {
    res.send(documents)
    console.log(documents);
  })    
  })

   //add review
  app.post('/addReview', (req, res) => {
    const reviews = req.body;
    reviewsCollection.insertOne(reviews)
    .then(result => {
      res.send(result.insertedCount)
    })
})

 //show review

app.get('/reviews', (req, res) => {
  const reviews = req.body;
  reviewsCollection.find({})
  .toArray((err, documents) => {
    res.send(documents)
  })    
  })


   //All customer order loaded in Admin ServiceList
    app.get('/allOrderServiceList', (req, res) => {
      const orders = req.body;
      orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })    
      })

      app.patch('/updateOrderStatus/:id',(req,res)=>{
    
        const id = req.params.id
        const status = req.body.status
        
        orderCollection.updateOne(
            {_id:objectid(id)},
            {
                $set:{"status":status}
            }).then(result=>res.send("cdc"))
            .catch(err=>{})
        
    })

 //send MakeAdmin email to database
    app.post('/makeAdmin', (req, res) => {
      const admins = req.body;
      adminCollection.insertOne(admins)
      .then(result => {
        res.send(result.insertedCount)
      })
  })

  //add Services  
  app.post('/addNewService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
    
    servicesCollection.insertOne({title, description, image})
    .then(result => {
      res.send(result.insertedCount > 0)
    })
})

//show Services  
app.get('/services', (req, res) => {
  const services = req.body;
  servicesCollection.find({})
  .toArray((err, documents) => {
    res.send(documents)
  })    
  })

  //check admin

app.post('/isAdmin', (req, res) => {
  const email = req.body.email;
  adminCollection.find({ email: email })
      .toArray((err, documents) => {
           res.send(documents.length > 0);
      })
})

//send massages
app.post('/sendMassage', (req, res) => {
  const massages = req.body;
  console.log(massages)
  massageCollection.insertOne(massages)
  .then(result => {
    res.send(result.insertedCount)
  })
})
  
});


app.listen(process.env.PORT || port)