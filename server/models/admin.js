const mongoose = require("mongoose");
const { eventSchema } = require("./event");

const adminSchema = new mongoose.Schema(
    {
        admin_id: {
            type: String,
            required: true, // Fixed typo
        },
        email: {
            type: String,
            unique: true,
        },
        pass: {
            type: String,
        },
        name: {
            type: String,
        },
        eventCreated: [
            {
                event_id: String,
                name: String,
                venue: String,
                date: String,
                time: String,
                description: String,
                price: Number,
                profile: String,
                cover: String,
                organizer: String,
            },
        ], // Defined schema for eventCreated

        expireAt: {
            type: Date,
            default: Date.now,
            index: { expires: "2592000s" },
        },
    },
    { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

const test_credential = new Admin({
    admin_id: "hqwkufywealufyewf.weiugbfre654wegreg",
    email: "InVITe.testing@gmail.com",
    name: "test",
    pass: "InVITe123",
});

Admin.find(
    { admin_id: "hqwkufywealufyewf.weiugbfre654wegreg" },
    async function (err, docs) {
        if (err) {
            console.log("Error checking admin:", err);
            return;
        }
        if (docs && docs.length === 0) {
            test_credential.save((error, success) => {
                if (error) console.log(error);
                else
                    console.log(
                        "Saved::Admin::test credentials",
                        test_credential
                    );
            });
        } else if (docs && docs.length > 0) {
            console.log("Demo admin already exists:", docs[0].email);
        }
    }
);

module.exports = Admin;
