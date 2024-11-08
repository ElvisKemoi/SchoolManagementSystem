require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();

const admin = require("./controllers/adminController");
const teacher = require("./controllers/teachersController");
const student = require("./controllers/studentController");
const storage = require("./controllers/storageControllers");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
require("dotenv").config();
const port = process.env.PORT || 3000;
// CREATING SESSION
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 30 * 60 * 1000,
		},
	})
);

const passportConfig = require("./passportConfig");

passportConfig(app);

// DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI);

// IMPORTING ROUTES
const eventsRoutes = require("./routes/events");
const teachersRoutes = require("./routes/teachers");
const assignmentRoutes = require("./routes/assignmentRoute");
const classRoutes = require("./routes/classRoutes");
const studentRoutes = require("./routes/studentRoutes");
const commonRoutes = require("./routes/commonRoutes");
const unitRoutes = require("./routes/unitRoute");
const timetableRouters = require("./routes/timetableRoutes");
const feesStructureRouters = require("./routes/feesRoutes");
const defermentRoutes = require("./routes/defermentRoute");
app.use("/", teachersRoutes);
app.use("/", eventsRoutes);
app.use("/", assignmentRoutes);
app.use("/", classRoutes);
app.use("/", studentRoutes);
app.use("/", commonRoutes);
app.use("/unit", unitRoutes);
app.use("/timetable", timetableRouters);
app.use("/fees", feesStructureRouters);
app.use("/deferment", defermentRoutes);

// Ensure error handling middleware is set up
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send(`Something went wrong!<br/>: Error: ${err}`);
});

async function firstUsers() {
	await Promise.all([
		admin.createFirst(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD),
		teacher.createFirst(
			process.env.TEACHER_USERNAME,
			process.env.TEACHER_PASSWORD
		),
		student.createFirst(
			process.env.STUDENT_USERNAME,
			process.env.STUDENT_PASSWORD
		),
	]);
	return true;
}

async function createAssignments() {
	return await storage.createAssignments();
}

app.listen(port, async () => {
	const creations = await Promise.all([
		firstUsers(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD),
		createAssignments(),
	]);

	console.log(`Server is live on port ${port}`);
});
