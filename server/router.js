// import the controllers
// This only specifies the folder name, which means it will automatically pull the index.js file
const controllers = require('./controllers');

// function to attach routes
const router = (app) => {
  
  //router calls
  app.get('/page1', controllers.page1);
  app.get('/page2', controllers.page2);
  app.get('/page3', controllers.page3);
  app.get('/page4', controllers.page4);
  app.get('/getName', controllers.getName);
  app.get('/getDogName', controllers.getDogName);
  app.get('/findByName', controllers.searchName);
  app.get('/findByDogName', controllers.searchDogName);

  //go to index
  app.get('/', controllers.index);

  // catch for any other GET request. The * means anything
  app.get('/*', controllers.notFound);

  // post calls
  app.post('/setName', controllers.setName);
  app.post('/setDogName', controllers.setDogName);

  // When someone POSTS to /updateLast, call controllers.updateLast
  app.post('/updateLast', controllers.updateLast);
};

// export the router function
module.exports = router;
