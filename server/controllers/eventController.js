const { Event } = require("../models/event");
const Admin = require("../models/admin");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const nodemailer = require("nodemailer");

function sendCheckInMail(data) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODE_MAILER_USER,
            pass: process.env.NODE_MAILER_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    let mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: data.email,
        subject: `${data.name} You've Checked In - InVITe`,
        html: `Dear ${data.name},<br><br>
           <strong>Congratulations, you've successfully checked in!</strong><br><br>
           Name: ${data.name}<br>
           Registration Number: ${data.regNo}<br>
           Contact Number: ${data.number}<br><br>
           If you have any questions or concerns, please don't hesitate to contact us:<br>
           Anurag Singh: 2002anuragksingh@gmail.com<br>
           Devanshu Yadav: devanshu.yadav2020@vitbhopal.ac.in<br>
           Saksham Gupta: saksham.gupta2020@vitbhopal.ac.in<br><br>
           Lavanya Doohan: lavanya.doohan2020@vitbhopal.ac.in<br><br>
           Thank you for choosing InVITe!<br><br>
           Best regards,<br>
           The InVITe Team`,
    };

    transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
            console.log(err);
        } else {
            console.log("Checked In Email sent successfully");
        }
    });
}

const postEvent = async (req, res) => {
    const Name = req.body.name;
    const Venue = req.body.venue;
    const Date = req.body.date;
    const Time = req.body.time;
    const Desc = req.body.description;
    const Price = req.body.price;
    const Profile = req.body.profile;
    const Cover = req.body.cover;
    const Organizer = req.body.organizer;

    const adminId = req.body.admin_id;
    console.log("Admin mil gaya: ", adminId);

    const secret = JWT_SECRET;
    const payload = {
        email: Name,
    };

    const token = await jwt.sign(payload, secret);

    const new_event = new Event({
        event_id: token,
        name: Name,
        venue: Venue,
        date: Date,
        time: Time,
        description: Desc,
        price: Price,
        profile: Profile,
        cover: Cover,
        organizer: Organizer,
    });

    try {
        new_event.save((error, success) => {
            if (error) console.log(error);
            else console.log("Saved::New Event::created.");
        });
    } catch (err) {
        console.log(err);
    }

    Admin.updateOne(
        { admin_id: adminId },
        {
            $push: {
                eventCreated: {
                    event_id: token,
                    name: Name,
                    venue: Venue,
                    date: Date,
                    time: Time,
                    description: Desc,
                    price: Price,
                    profile:
                        Profile == null
                            ? "https://i.etsystatic.com/15907303/r/il/c8acad/1940223106/il_794xN.1940223106_9tfg.jpg"
                            : Profile,
                    cover:
                        Cover == null
                            ? "https://eventplanning24x7.files.wordpress.com/2018/04/events.png"
                            : Cover,
                    organizer: Organizer,
                },
            },
        },
        function (err) {
            if (err) {
                console.log(err);
            }
        }
    );

    res.status(200).send({ msg: "event created", event_id: token });
};

const allEvents = async (req, res) => {
    Event.find({})
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(400).send({ msg: "Error fetching data", error: err });
        });
};

const particularEvent = async (req, res) => {
    const eventId = req.body.event_id;
    
    if (!eventId) {
        return res.status(400).send({ msg: "Event ID is required" });
    }
    
    try {
        const events = await Event.find({ event_id: eventId });
        
        if (events.length === 0) {
            return res.status(404).send({ msg: "Event not found" });
        }
        
        res.status(200).send(events[0]);
    } catch (err) {
        console.error("Error fetching event:", err);
        res.status(500).send({ msg: "Error fetching event", error: err.message });
    }
};

const deleteEvent = async (req, res) => {
    const eventId = req.body.event_id;
    const adminId = req.body.admin_id;

    Event.deleteOne({ event_id: eventId }, function (err) {
        if (err) return handleError(err);
        else {
            console.log("Event deleted::events collection.");
        }
    });

    Admin.updateOne(
        { admin_id: adminId },
        { $pull: { eventCreated: { event_id: eventId } } },
        function (err) {
            if (err) return handleError(err);
            else {
                console.log("Event deleted::admin collection.");
            }
        }
    );
    res.status(200).send({ msg: "success" });
};

const checkin = async (req, res) => {
    const eventId = req.body.event_id;
    const userList = req.body.checkInList;

    try {
        // Get event details
        const event = await Event.findOne({ event_id: eventId });
        if (!event) {
            return res.status(400).send({ msg: "Event not found" });
        }

        const eventName = event.name;

        // Update check-in status for each user
        for (let i = 0; i < userList.length; i++) {
            await Event.updateOne(
                { event_id: eventId, "participants.id": userList[i] },
                { $set: { "participants.$.entry": true } }
            );
        }

        // Send check-in emails
        for (let i = 0; i < userList.length; i++) {
            const participant = event.participants.find(p => p.id === userList[i]);
            if (participant) {
                const data_obj = {
                    name: participant.name,
                    regNo: participant.regno,
                    email: participant.email,
                    number: participant.contactNumber || "N/A",
                    event: eventName,
                };

                sendCheckInMail(data_obj);
            }
        }

        res.status(200).send({ msg: "success" });
    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).send({ msg: "error", error: error.message });
    }
};

const registerForEvent = async (req, res) => {
    const { event_id, name, contactNumber } = req.body;
    
    // Log incoming request for debugging
    console.log("Registration request received:", { event_id, name, contactNumber });
    
    // Validate required fields
    if (!event_id || !name || !contactNumber) {
        return res.status(400).send({ 
            msg: "All fields are required",
            missing: {
                event_id: !event_id,
                name: !name,
                contactNumber: !contactNumber
            }
        });
    }
    
    // Generate unique pass ID using crypto (built-in Node.js module)
    const crypto = require("crypto");
    const passID = crypto.randomBytes(16).toString("hex");

    try {
        // Find event details
        const event = await Event.findOne({ event_id: event_id });
        if (!event) {
            return res.status(404).send({ msg: "Event not found" });
        }

        // Check if user is already registered using mobile number
        const alreadyRegistered = event.participants.some(
            (participant) => participant.contactNumber === contactNumber
        );

        if (alreadyRegistered) {
            return res.status(400).send({ msg: "alreadyregistered" });
        }

        // Add participant to event
        await Event.updateOne(
            { event_id: event_id },
            {
                $push: {
                    participants: {
                        id: passID, // Use passID as unique identifier
                        name: name,
                        contactNumber: contactNumber,
                        passID: passID,
                        entry: false,
                    },
                },
            }
        );

        console.log("Registration successful for:", name);
        res.status(200).send({ msg: "success", status: "success" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send({ msg: "error", error: error.message });
    }
};

module.exports = {
    postEvent,
    allEvents,
    particularEvent,
    deleteEvent,
    checkin,
    registerForEvent,
};
