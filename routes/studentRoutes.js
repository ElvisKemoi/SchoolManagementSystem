const router = require("express").Router();
const flash = require("connect-flash");

const Student = require("../models/studentModel");
const student = require("../functions/studentController");

router.use(flash());

router
	.post("/students/:id/class", async (req, res) => {
		if (req.isAuthenticated()) {
			const studentId = req.params.id;
			const newClass = await req.body.newClass;

			try {
				const theStudent = await Student.findByIdAndUpdate(
					studentId,
					{ class: newClass },
					{ new: true }
				);

				if (!theStudent) {
					return res.status(404).json({ message: "Student not found" });
				} else if (theStudent.class === newClass) {
					res.redirect("/dashboard");
				} else {
					throw Error("Class not updated");
				}
			} catch (err) {
				res.status(500).json({ message: err.message });
			}
		} else {
			res.redirect("/login");
		}
	})
	.post("/students/addunit", async (req, res) => {
		let { unitId, enrollmentKey } = req.body;

		const addedUnit = await student.enrollUnit(
			req.user._id,
			unitId,
			enrollmentKey
		);

		if (!addedUnit.error) {
			req.flash("info", "Unit Added Successfully!");
		} else {
			req.flash("info", addedUnit.error);
		}
		res.redirect("/dashboard");
	});

module.exports = router;
