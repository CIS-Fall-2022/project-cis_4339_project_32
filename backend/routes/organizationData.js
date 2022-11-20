const express = require("express"); 
const router = express.Router(); 

//importing data model schemas 
let { organizationdata } = require("../models/models");


// Getting all the organziations
router.get('/', (req, res, next) => {
    organizationdata.find((error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    });
  });

 //change times 3
  
  // GET a specific organization based on organizationNameId
  router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    organizationdata.findOne({ organizationNameId: id }, (error, data) => {
      if (error) {
        return next(error);
      } else if (data === null) {
        res.status(404).send('Organization is not found');
      } else {
        res.json(data);
      }
    });
  });
  
  // Adding an Organization
  router.post('/', (req, res, next) => {
    organizationdata.create(req.body, (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.send('Organziation info is added to the database.');
      }
    });
  });
  
  // Updating organziations
  router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    organizationdata.findOneAndUpdate(
      { organizationNameId: id },
      {
        $set: req.body,
      },
      (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.send('Organizations is edited via PUT');
          console.log('Organizations has been successfully updated!', data);
        }
      }
    );
  });

  router.put("/addEvent/:id", (req, res, next) => {
    //only add event if not yet signed up
    organizationdata.find( 
        { _id: req.params.id, orgEvents: req.body.event }, 
        (error, data) => { 
            if (error) {
                return next(error);
            } else {
                if (data.length == 0) {
                    organizationdata.updateOne(
                        { _id: req.params.id }, 
                        { $push: { orgEvents: req.body.event } },
                        (error, data) => {
                            if (error) {
                                consol
                                return next(error);
                            } else {
                                res.json(data);
                            }
                        }
                    );
                }
                
            }
        }
    );
    
});

router.put("/addClient/:id", (req, res, next) => {
    //only add a client if not yet signed up
    organizationdata.find( 
        { _id: req.params.id, orgClients: req.body.client }, 
        (error, data) => { 
            if (error) {
                return next(error);
            } else {
                if (data.length == 0) {
                    organizationdata.updateOne(
                        { _id: req.params.id }, 
                        { $push: { orgClients: req.body.client } },
                        (error, data) => {
                            if (error) {
                                consol
                                return next(error);
                            } else {
                                res.json(data);
                            }
                        }
                    );
                }
                
            }
        }
    );
    
});
  
  // Delete a organziations  record
  router.delete('/:id', (req, res, next) => {
    organizationdata.deleteOne(
      { organizationNameId: req.params.id },
      (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.status(200).json({
            msg: data,
          });
        }
      }
    );
  });


module.exports = router;
