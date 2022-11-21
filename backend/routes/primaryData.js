const express = require("express");
const router = express.Router();

//importing data model schemas
let { primarydata } = require("../models/models");
let { organizationdata } = require("../models/models");
let { eventdata } = require("../models/models");

//finds organization document with given name
const findOrganizationByName = async (name) => {
  const selectedOrganization = await organizationdata.findOne({
    name: name,
  });
  return selectedOrganization;
};

//GET all persons
router.get("/", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);
  primarydata
    .find({ organization }, (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    })
    .sort({ updatedAt: -1 })
    .limit(10);
});

//GET single person by ID
router.get("/id/:id", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);
  primarydata.find({ _id: req.params.id, organization }, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});
//DELETE this method hard removes person data from DB also removes person from signed up events
router.delete("/id/:id", async (req, res, next) => {
  //delete person
  primarydata.deleteOne({ _id: req.params.id }, async (error, data) => {
    if (error) {
      return next(error);
    } else {
      //delete person reference from event
      /*
    *Group values from multiple documents together.
    *Perform operations on the grouped data to return a single result.
  */
      let events = await eventdata.aggregate([
        {
          $match: {
            "attendees.attendee": req.params.id,
          },
        },
        { $unwind: "$attendees" },
        { $match: { "attendees.attendee": req.params.id } },
        {
          $group: {
            _id: "$_id",
            doc: { $first: "$$ROOT" },
          },
        },
        // this part to return the whole collection
        { $replaceRoot: { newRoot: "$doc" } },
      ]);
      for (let item of events) {
        const event = await eventdata.findById(item._id);

        event.attendees = event.attendees.filter(
          (item) => item.attendee != req.params.id
        );
        eventdata.findByIdAndUpdate(
          { _id: event._id },
          event,
          (error, data) => {
            if (error) {
              return next(error);
            }
          }
        );
      }
    }
  });
  res.json();
});

//GET entries based on search query
//Ex: '...?firstName=Bob&lastName=&searchBy=name'
router.get("/search/", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);
  let dbQuery = "";
  if (req.query["searchBy"] === "name") {
    dbQuery = {
      organization,
      firstName: { $regex: `^${req.query["firstName"]}`, $options: "i" },
      lastName: { $regex: `^${req.query["lastName"]}`, $options: "i" },
    };
  } else if (req.query["searchBy"] === "number") {
    dbQuery = {
      organization,
      "phoneNumbers.primaryPhone": {
        $regex: `^${req.query["phoneNumbers.primaryPhone"]}`,
        $options: "i",
      },
    };
  }
  primarydata.find(dbQuery, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

//POST
router.post("/", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);

  //add organization propperty to person
  req.body = { ...req.body, organization: organization };
  primarydata.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
  primarydata.createdAt;
  primarydata.updatedAt;
  primarydata.createdAt instanceof Date;
});

//PUT update (make sure req body doesn't have the id)
router.put("/:id", (req, res, next) => {
  primarydata.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    }
  );
});

module.exports = router;
