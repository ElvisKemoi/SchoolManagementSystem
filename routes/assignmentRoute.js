const express = require("express");
const router = express.Router();
const Assignment = require("../models/assignmentModel");
const Class = require("../models/classModel");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const unit = require("../controllers/unitController");
const assignment = require("../controllers/assignmentController");
const flash = require("connect-flash");

router.use(flash());

const {
	combineDateTime,
	formatDate,
	deadlineReached,
} = require("../controllers/functions");
const passportConfig = require("../passportConfig");
passportConfig(router);

// Assignments
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const lecturerId = req.user._id;
		const assignmentDir = "Assignments";
		const assignmentGivenDir = `${assignmentDir}/${lecturerId}`;

		if (!fs.existsSync(assignmentDir)) {
			fs.mkdirSync(assignmentDir);
		}
		if (!fs.existsSync(assignmentGivenDir)) {
			fs.mkdirSync(assignmentGivenDir);
		}
		cb(null, assignmentGivenDir);
	},
	filename: (req, file, cb) => {
		// Use the original name of the file

		const uniqueName = `${Date.now()}_${file.originalname}`;
		cb(null, uniqueName);
	},
});

const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		const validTypes = [
			"text/plain",
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		if (validTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Invalid file type"), false);
		}
	},
});

// router.get("/assignments", async (req, res) => {
// 	if (req.isAuthenticated()) {
// 		try {
// 			const [allClasses, assignments] = await Promise.all([
// 				Class.find(),
// 				Assignment.find(),
// 			]);

// 			res.render("assignmentsPanel", {
// 				classes: allClasses,
// 				assignments: assignments,
// 				formatDate: formatDate,
// 				deadlineReached: deadlineReached,
// 			});
// 		} catch (err) {
// 			console.error(err);
// 			res.status(500).send("Internal Server Error");
// 		}
// 	} else {
// 		res.redirect("/login");
// 	}
// });

// Handle file upload and save metadata to MongoDB
router.post("/upload", upload.single("file"), async (req, res) => {
	try {
		if (req.isAuthenticated()) {
			const data = JSON.parse(req.body.more);
			const filePath = req.file.path;
			const creator = req.user.username;
			const goodTitle = req.file.originalname.split(".");
			const name = goodTitle[0];
			const description = data.description;
			const subject = data.subject;
			// const asClass = data.AsClass;
			const deadlineDate = data.deadlineDate;
			const deadlineTime = data.deadlineTime;
			const deadline = combineDateTime(deadlineDate, deadlineTime);

			const saveStatus = await assignment.save(
				name,
				description,
				filePath,
				creator,
				subject,
				req.body.unitId,
				deadline
			);
			const savedToUnit = await unit.assignment.save(
				saveStatus._id,
				req.body.unitId
			);
			res.status(201).json({
				message: "File uploaded and saved successfully",
				assignment: saveStatus,
			});
			// res.redirect("/assignments");
		}
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error uploading file", error: error.message });
	}
});

// 1. Get all assignments
// router.get("/assignments/all", async (req, res) => {
// 	try {
// 		const assignments = await Assignment.find();
// 		res.json(assignments);
// 	} catch (err) {
// 		res.status(500).json({ message: err.message });
// 	}
// });

// router.post("/assignments/all", async (req, res) => {
// 	// console.log(req.user);
// 	if (req.isAuthenticated()) {
// 		try {
// 			const assignments = await Assignment.find({
// 				createdBy: req.user.username,
// 			});
// 			res.json(assignments);
// 		} catch (err) {
// 			res.status(500).json({ message: err.message });
// 		}
// 	} else {
// 		res.redirect("/login");
// 	}
// });

// 2. Get assignment by ID
// router.get("/assignments/:id", async (req, res) => {
// 	if (req.isAuthenticated()) {
// 		try {
// 			const assignment = await Assignment.findById(req.params.id);
// 			if (assignment == null) {
// 				return res.status(404).json({ message: "Cannot find assignment" });
// 			}
// 			res.json(assignment);
// 		} catch (err) {
// 			res.status(500).json({ message: err.message });
// 		}
// 	} else {
// 		res.redirect("/login");
// 	}
// });
// router.get("/unit/assignments/:id", async (req, res) => {
// 	try {
// 		const { id } = req.params;

// 		const theUnitAssignments = await unit.assignment.get(id);

// 		if (theUnitAssignments == null) {
// 			return res.status(404).json({ message: "Cannot find assignment" });
// 		}
// 		res.json(theUnitAssignments);
// 	} catch (err) {
// 		res.status(500).json({ message: err.message });
// 	}
// });

async function deleteFile(filePath) {
	return new Promise((resolve) => {
		fs.unlink(filePath, (err) => {
			if (err) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

// 3. Delete assignment by ID
router.post("/assignments/delete/:id", async (req, res) => {
	if (req.isAuthenticated()) {
		// const referer = req.headers.referer || req.get("referer");
		// const refererArray = referer.split("/");
		// const originRoute = refererArray[refererArray.length - 1];

		try {
			const deleteStatus = await deleteFile(req.body.filePath);

			// Check if deleteStatus is false and throw an error
			if (!deleteStatus) {
				throw new Error("File deletion failed");
			}

			const removedFromUnit = await unit.assignment.remove(req.params.id);

			if (!removedFromUnit.error) {
				// return res.status(404).json({ message: "Cannot find assignment" });
				req.flash("info", removedFromUnit.error);
			} else {
				req.flash("info", removedFromUnit.message);
			}
			res.redirect(`/dashboard`);
		} catch (err) {
			req.flash("info", err.message);
			// res.status(500).json({ message: err.message });
		}
	} else {
		res.redirect("/login");
	}
});
router.post("/units/assignments/delete/:id/:unitId", async (req, res) => {
	try {
		// Check if deleteStatus is false and throw an error

		const removedFromUnit = await unit.assignment.remove(
			req.params.id,
			req.params.unitId
		);

		const deleteStatus = await deleteFile(req.body.filePath);
		if (!deleteStatus) {
			throw new Error("File deletion failed");
		}
		if (!removedFromUnit.error) {
			// Send a success message in JSON format
			res.json({ success: true, message: "Successfully Deleted Assignment" });
		} else {
			// Send the error message in JSON format
			res.json({ success: false, message: removedFromUnit.message });
		}
	} catch (err) {
		// Send the error message in JSON format
		res.status(500).json({ success: false, message: err.message });
	}
});

// 4. Getting all assignments for a particular class
// router.get("/assignments/get/:class", async (req, res) => {
// 	try {
// 		const className = req.params.class;
// 		const assignments = await Assignment.find({ AsClass: className });
// 		res.status(200).json(assignments);
// 	} catch (err) {
// 		res.status(500).json({ message: err.message });
// 	}
// });

// 5. Downloading assignments
router.get("/assignments/download/:id", async (req, res) => {
	try {
		const assignment = await Assignment.findById(req.params.id);
		if (!assignment) {
			return res.status(404).json({ error: "Assignment not found" });
		}

		const filePath = path.resolve(assignment.filePath);
		res.download(filePath, (err) => {
			if (err) {
				console.error("Error downloading file", err);
				return res.status(500).json({ error: "Error downloading file" });
			}
		});
	} catch (err) {
		console.error("Error fetching assignment", err);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
