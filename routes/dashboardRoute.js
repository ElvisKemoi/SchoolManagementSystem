const router = require("express").Router();
const Class = require("../models/classModel");
const timetable = require("../controllers/timetableController");
const fees = require("../controllers/feesController");
const thisGuy = require("../middleware/authentications");
const deferment = require("../controllers/defermentController");
const unit = require("../controllers/unitController");
const {
	deadlineReached,
	formatDate,
	Numbers,
	countMembers,
} = require("../controllers/functions");
const Teacher = require("../models/teacherModel");
const Admin = require("../models/adminModel");
const Student = require("../models/studentModel");
const Assignment = require("../models/assignmentModel");

router.get("/dashboard", thisGuy.hasAccess, async (req, res) => {
	try {
		const dashType = await req.session.passport.user.type;
		const userId = req.session.passport.user.id;
		let user;
		const classes = await Class.find({}).sort({ className: 1 });
		const timetableList = await timetable.list();
		const feesStructures = await fees.list();
		const commonData = {
			userName: req.user.username,
			userId: req.user._id,
			userType: dashType,
			formatDate: formatDate,
			deadlineReached: deadlineReached,
			timetables: timetableList,
			feesStructures: feesStructures,
			messages: req.flash("info"),
		};
		const fetchAdminData = async () => {
			const [numbers, classes, allTeachers, user, allStudents, deferments] =
				await Promise.all([
					Numbers(),
					Class.find().sort({ className: 1 }),
					Teacher.find(),
					Admin.findById(userId),
					Student.find(),
					deferment.list(),
				]);
			return { numbers, classes, allTeachers, user, allStudents, deferments };
		};
		await countMembers();
		const fetchStudentData = async () => {
			const studentClass = await Student.findById(userId);
			const classAssignments = await Assignment.find({
				AsClass: studentClass.class,
			});
			user = await Student.findById(userId);
			const unitData = await unit.getUnitData(user.myUnits);
			return {
				studentClass: studentClass.class,
				classAssignments: classAssignments,
				classes: classes,
				user: user,
				unitData: unitData,
			};
		};
		const fetchTeacherData = async () => {
			const teacherAssignments = await Assignment.find(
				{ createdBy: req.user.username },
				{}
			);
			user = await Teacher.findById(userId);
			const myUnitData = await unit.getMyUnitData(user._id);
			return {
				assignments: teacherAssignments,
				user: user,
				classes: classes,
				myUnitsData: myUnitData,
			};
		};
		let dashboardData = {};
		switch (dashType) {
			case "Admin":
				dashboardData = await fetchAdminData();
				res.render("dashboardAdmin", { ...commonData, ...dashboardData });
				break;
			case "Student":
				dashboardData = await fetchStudentData();
				res.render("dashboardStudent", { ...commonData, ...dashboardData });
				break;
			case "Teacher":
				dashboardData = await fetchTeacherData();
				res.render("dashboardTeacher", { ...commonData, ...dashboardData });
				break;
			default:
				res.status(403).send("You do not have access to this page");
				break;
		}
	} catch (error) {
		console.error("Error accessing the dashboard:", error);
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
