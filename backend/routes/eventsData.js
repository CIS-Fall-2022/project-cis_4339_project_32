const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//importing data model schemas
let { eventdata } = require("../models/models");
let { organizationdata } = require("../models/models");

const e = require("express");

//finds organization document with given name
const findOrganizationByName = async (name) => {
  console.log("Burda")

  const selectedOrganization = await organizationdata.findOne({
    name: name,
  });
  return selectedOrganization;
};

//GET all events
router.get("/", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);

  eventdata
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

//GET single event by ID
router.get("/id/:id", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);
  eventdata.find({ _id: req.params.id, organization }, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

//GET entries events on search query
//Ex: '...?eventName=Food&searchBy=name'
router.get("/search/", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);
  let dbQuery = "";
  if (req.query["searchBy"] === "name") {
    dbQuery = {
      organization,
      eventName: { $regex: `^${req.query["eventName"]}`, $options: "i" },
    };
  } else if (req.query["searchBy"] === "date") {
    dbQuery = { organization, date: req.query["eventDate"] };
  }
  eventdata.find(dbQuery, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

//GET events for which a client is signed up
router.get("/client/:id", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);

/*router.get("/client/:id", (req, res, next) => { 
  const organization = findOrganizationByName(process.env.organization);
  eventdata.find( 
      { attendees: req.params.id }, 
      (error, data) => { 
          if (error) {
              return next(error);
          } else {
              res.json(data);
          }
      }
  );
});
*/

  /*
  Aggregation operations process multiple documents and return computed results.
  You can use aggregation operations to:
    *Group values from multiple documents together.
    *Perform operations on the grouped data to return a single result.
    *Analyze data changes over time.
  */
  const result = await eventdata.aggregate([
    {
      $match: {
        "attendees.attendee": req.params.id,
        organization: mongoose.Types.ObjectId(organization),
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
  res.json(result);
});

//GET method counts person who signed in last 2 month
router.get("/event-by-date", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);
  const events = await eventdata.find({
    organization,
  });

  const date = new Date();
  let response = [];

  //Calculates date 60 days before now
  date.setDate(date.getDate() - 60);
  for (let event of events) {
    const result = await eventdata.aggregate([
      {
        $match: {
          "attendees.registration": { $gte: date },
          _id: mongoose.Types.ObjectId(event._id),
        },
      },
      { $unwind: "$attendees" },
      //'$gte' means greater than or equal
      { $match: { "attendees.registration": { $gte: date } } },
      {
        $group: {
          _id: "$_id",
          //count of people who attended the event 60 days ago
          count: { $sum: 1 },
        },
      },
    ]);

    let count = result[0]?.count;
    if (!count) {
      count = 0;
    }
    //generate a response collection that stores event and attended people info
    response.push({ event: event, count: count });
  }

  res.json(response);
});

//POST
router.post("/", async (req, res, next) => {
  const organization = await findOrganizationByName(process.env.organization);
  //add organization propperty to event
  req.body = { ...req.body, organization: organization};
  eventdata.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

//PUT
router.put("/:id", async (req, res, next) => {
  //finds event document with given event id then update the document
  eventdata.findOneAndUpdate(
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

//PUT
//add attendee to event
router.put("/addAttendee/:id", (req, res, next) => {
  //only add attendee if not yet signed up
  eventdata.find(
    { _id: req.params.id, attendees: req.body.attendee },
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        if (data.length == 0) {
          eventdata.updateOne(
            { _id: req.params.id },
            {
              $push: {
                attendees: {
                  attendee: req.body.attendee,
                  registration: new Date(),
                },
              },
            },
            (error, data) => {
              if (error) {
                return next(error);
              } else {
                res.json();
              }
            }
          );
        }
      }
    }
  );
});

/*//PUT add attendee to event
router.post("/:eventId/delete-attendee/:id", (req, res, next) => {
    //only add attendee if not yet signed uo
    eventdata.find(
        { _id: req.params.id, attendees: req.params.id },
        (error, data) => {
            if (error) {
                return next(error);
            } else {
                if (data.length == 0) {
                    eventdata.updateOne(
                        { _id: req.params.id },
                        {
                            $push: {
                                attendees: {
                                    attendee: req.body.attendee,
                                    registration: new Date(),
                                },
                            },
                        },
                        (error, data) => {
                            if (error) {
                                console.log(error);
                                return next(error);
                            } else {
                                console.log(data);
                                res.json();
                            }
                        }
                    );
                }
            }
        }
    );
});

*/
// Delete Event based on Event ID
router.delete("/:id", (req, res, next) => {
  eventdata.deleteOne({ _id: req.params.id }, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});
module.exports = router;
