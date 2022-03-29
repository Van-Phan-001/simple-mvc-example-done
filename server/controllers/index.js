// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');
const DogModel = require('../models/Dog');

// get the Cat model
const { Cat } = models;
const { Dog } = models;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

const defaultDataDog = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);

let lastAddedDog = new Dog(defaultDataDog);

// Function to handle rendering the index page.
const hostIndex = (req, res) => {
  /* res.render will render the given view from the views folder. In this case, index.
     We pass it a number of variables to populate the page.
  */
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// Function for rendering the page1 template
// Page1 has a loop that iterates over an array of cats
const hostPage1 = async (req, res) => {

  try {

    const docs = await Cat.find({}).lean().exec();

    return res.render('page1', { cats: docs });
  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

// Function to render the untemplated page2.
const hostPage2 = (req, res) => {
  res.render('page2');
};

// Function to render the untemplated page3.
const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = async (req, res) => {
  try {

    const docs = await Dog.find({}).lean().exec();

    return res.render('page4', { dogs: docs });
  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: 'failed to find dogs' });
  }
};

// Get name will return the name of the last added cat.
const getName = (req, res) => res.json({ name: lastAdded.name });

const getDogName = (req, res) => res.json({ name: lastAdded.name });

// Function to create a new cat in the database
const setDogName = async (req, res) => {

  //guard check for required data
  if (!req.body.name || !req.body.breed || !req.body.age) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'name, breed and age are all required' });
  }

  //create json obj
  const dogData = {
    name: `${req.body.name}`,
    breed: `${req.body.breed}`,
    age: req.body.age,
  };


  const newDog = new Dog(dogData);

  //save created obj
  try {

    await newDog.save();

    lastAddedDog = newDog;
    return res.json({
      name: lastAddedDog.name,
      breed: lastAddedDog.breed,
      age: lastAddedDog.age,
    });
  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: 'failed to create dog' });
  }
};

// Function to create a new cat in the database
const setName = async (req, res) => {

  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }

  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };


  const newCat = new Cat(catData);


  try {

    await newCat.save();


    lastAdded = newCat;
    return res.json({
      name: lastAdded.name,
      beds: lastAdded.bedsOwned,
    });
  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }
};

// Function to handle searching a cat by name.
const searchName = async (req, res) => {
  
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  
  try {
    
    const doc = await Cat.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    // Otherwise, we got a result and will send it back to the user.
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const searchDogName = async (req, res) => {
  
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  
  try {
    
    const doc = await Dog.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }

    //increment dog age by 1
    doc.age += 1;
    return res.json({ name: doc.name, breed: doc.breed, age: doc.age });


  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


const updateLast = (req, res) => {
  // First we will update the number of bedsOwned.
  lastAdded.bedsOwned++;

  /* Remember that lastAdded is a Mongoose document (made on line 14 if no new
     ones were made after the server started, or line 116 if there was). Mongo
     documents have an _id, which is a globally unique identifier that distinguishes
     them from other documents. Our mongoose document also has this _id. When we
     call .save() on a document, Mongoose and Mongo will use the _id to determine if
     we are creating a new database entry (if the _id doesn't already exist), or
     if we are updating an existing entry (if the _id is already in the database).

     Since lastAdded is likely already in the database, .save() will update it rather
     than make a new cat.

     We can use async/await for this, or just use standard promise .then().catch() syntax.
  */
  const savePromise = lastAdded.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions (numbered ones are dog onlu)
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  getName,
  getDogName, //1
  setName,
  setDogName, //2
  updateLast,
  searchName,
  searchDogName, //3
  notFound,
};
