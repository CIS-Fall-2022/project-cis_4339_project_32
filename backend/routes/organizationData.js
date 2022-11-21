const express = require("express");
const router = express.Router();

//importing data model schemas
let { organizationdata } = require("../models/models");

// Getting all the organziations
router.get("/", (req, res, next) => {
  organizationdata.find((error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

//This method to get organization name inside of .env file
router.get("/organization", (req, res) => {

  let organization = process.env.organization
  res.body = { ...res.body, organization };

  res.json(res.body.organization)

});

// GET a specific organization based on organizationId
router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  organizationdata.findOne({ organizationNameId: id }, (error, data) => {
    if (error) {
      return next(error);
    } else if (data === null) {
      res.status(404).send("Organization is not found");
    } else {
      res.json(data);
    }
  });
});
//GET
// GET a specific organization based on organizationName
router.get("/:organizationName", (req, res, next) => {
  const organizationName = req.params.organizationName;
  organizationdata.findOne({ name: organizationName }, (error, data) => {
    if (error) {
      return next(error);
    } else if (data === null) {
      res.status(404).send("Organization is not found");
    } else {
      res.json(data);
    }
  });
});

// Adding an Organization
router.post("/", (req, res, next) => {
  organizationdata.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.send("Organziation info is added to the database.");
    }
  });
});

// Updating organziations
router.put("/:id", (req, res) => {
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
        res.send("Organizations is edited via PUT");
        console.log("Organizations has been successfully updated!", data);
      }
    }
  );
});

// Delete a organziation
router.delete("/:id", (req, res, next) => {
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
