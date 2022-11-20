const uuid = require('uuid');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//collection for intakeData
const primaryDataSchema = Schema({
    _id: { type: String, default: uuid.v1 },
    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phoneNumbers: {
        primaryPhone: {
            type: String,
            required: true,
        },
        secondaryPhone: {
            type: String,
        },
    },

    address: {
        addressOne: {
            type: String,
        },
        addressSecond: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
        county: {
            type: String,
        },
        zip: {
            type: String,
        },
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: "organizationData",
        autopopulate: true,
    },

    registration: { type: Date, default: Date.now },
}, {
    collection: 'primaryData',
    timestamps: true
});

//collection for eventData
const eventDataSchema = new Schema({
    eventName: {
        type: String,
        require: true
    },
    description: {
        type: String,
    },
    services: {
        type: Array
    },
    date: {
        type: Date,
        required: true
    },
    address: {
        line1: {
            type: String
        },
        line2: {
            type: String,
        },
        city: {
            type: String,
        },
        county: {
            type: String,
        },
        zip: {
            type: String,
        }
    },

    attendees: {
        type: Array
    },

    organization: {
        //geting organization Id with autopopulate
        type: Schema.Types.ObjectId,
        ref: "organizationData",
        autopopulate: true,
    },

    registration: { type: Date, default: Date.now },
}, {
    collection: 'eventData'
});

//collection for organizationData
const organizationDataSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    events: {
        type: Array
    }
}, {
    collection: 'organizationData'
});

//Used autopopulate to keep event in organization
primaryDataSchema.plugin(require("mongoose-autopopulate"));
organizationDataSchema.plugin(require('mongoose-autopopulate'));
eventDataSchema.plugin(require('mongoose-autopopulate'));

// create models from mongoose schemas
const primarydata = mongoose.model('primaryData', primaryDataSchema);
const eventdata = mongoose.model('eventData', eventDataSchema);
const organizationdata = mongoose.model('organizationData', organizationDataSchema);

// package the models in an object to export 
module.exports = { primarydata, eventdata, organizationdata }
