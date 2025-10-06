const express = require("express");
const router = express.Router();

const {
  postEvent,
  allEvents,
  particularEvent,
  deleteEvent,
  checkin,
  registerForEvent,
} = require("../controllers/eventController");

router.route("/post/event").post(postEvent);
router.route("/getallevents").get(allEvents);
router.route("/getevent").post(particularEvent);
router.route("/deleteevent").post(deleteEvent);
router.route("/event/checkin").post(checkin);
router.route("/event/register").post(registerForEvent);

module.exports = router;
