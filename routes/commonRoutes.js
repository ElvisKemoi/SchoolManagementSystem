const router = require("express").Router();
const Class = require("../models/classModel");
const Admin = require("../models/adminModel");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");
const Assignment = require("../models/assignmentModel");
const passport = require("passport");
const Event = require("../models/events");
const flash = require("connect-flash");
const unit = require("../functions/unitController");

router.use(flash());

const {
	Numbers,
	countMembers,
	formatDate,
	deadlineReached,
} = require("../functions/functions");

const passportConfig = require("../passportConfig");
passportConfig(router);

// COMMON ROUTES
router.get("/", (req, res) => {
	res.render("home");
});

router.get("/login", (req, res) => {
	res.render("login", { messages: req.flash("info") });
});

router.get("/register", (req, res) => {
	res.render("register", { messages: req.flash("info") });
});

router.get("/dashboard", async (req, res) => {
	try {
		if (!req.isAuthenticated()) {
			return res.redirect("/login");
		}

		const dashType = await req.session.passport.user.type;
		const userId = req.session.passport.user.id;
		let user;
		const classes = await Class.find({}).sort({ className: 1 });

		const commonData = {
			userName: req.user.username,
			userId: req.user._id,
			userType: dashType,
			formatDate: formatDate,
			deadlineReached: deadlineReached,
			messages: req.flash("info"),
		};

		const fetchAdminData = async () => {
			const [numbers, classes, allTeachers, user] = await Promise.all([
				Numbers(),
				Class.find().sort({ className: 1 }),
				Teacher.find(),
				Admin.findById(userId),
			]);
			return { numbers, classes, allTeachers, user };
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
router.post("/units", async (req, res) => {
	try {
		if (!req.isAuthenticated()) {
			return res.redirect("/login");
		}
		const { unitId } = req.body;
		const dashType = await req.session.passport.user.type;
		const userId = req.session.passport.user.id;
		let user;
		const classes = await Class.find({}).sort({ className: 1 });
		const thisUnitData = await unit.getUnit(unitId);

		const commonData = {
			userName: req.user.username,
			userId: req.user._id,
			userType: dashType,
			formatDate: formatDate,
			deadlineReached: deadlineReached,
			Unit: thisUnitData,
			messages: req.flash("info"),
		};

		// const fetchAdminData = async () => {
		// 	const [numbers, classes, allTeachers, user] = await Promise.all([
		// 		Numbers(),
		// 		Class.find().sort({ className: 1 }),
		// 		Teacher.find(),
		// 		Admin.findById(userId),
		// 	]);
		// 	return { numbers, classes, allTeachers, user };
		// };
		// await countMembers();

		const fetchStudentData = async () => {
			const studentClass = await Student.findById(userId);
			const classAssignments = await Assignment.find({
				AsClass: studentClass.class,
			});
			user = await Student.findById(userId);
			const assignments = await unit.assignment.get(user.myUnits);

			return {
				studentClass: studentClass.class,
				classAssignments: classAssignments,
				classes: classes,
				user: user,
				assignments: assignments,
			};
		};

		const fetchTeacherData = async () => {
			const teacherAssignments = await Assignment.find(
				{ createdBy: req.user.username, unit: unitId },
				{}
			);

			user = await Teacher.findById(userId);
			// const myUnitData = await unit.getMyUnitData(user._id);
			// myUnitsData: myUnitData,

			return {
				assignments: teacherAssignments,
				user: user,
				classes: classes,
			};
		};

		let dashboardData = {};
		switch (dashType) {
			// 	case "Admin":
			// 		dashboardData = await fetchAdminData();

			// 		res.render("dashboardAdmin", { ...commonData, ...dashboardData });
			// 		break;
			case "Student":
				dashboardData = await fetchStudentData();
				res.render("unitView", { ...commonData, ...dashboardData });
				break;
			case "Teacher":
				dashboardData = await fetchTeacherData();
				res.render("unitPanel", { ...commonData, ...dashboardData });
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
router.get("/units", async (req, res) => {
	try {
		if (!req.isAuthenticated()) {
			return res.redirect("/login");
		}

		const unitId = req.flash("origin")[0];

		const dashType = await req.session.passport.user.type;
		const userId = req.session.passport.user.id;
		let user;
		const classes = await Class.find({}).sort({ className: 1 });
		const thisUnitData = await unit.getUnit(unitId);

		const commonData = {
			userName: req.user.username,
			userId: req.user._id,
			userType: dashType,
			formatDate: formatDate,
			Unit: thisUnitData,
			messages: req.flash("info"),
		};

		// const fetchAdminData = async () => {
		// 	const [numbers, classes, allTeachers, user] = await Promise.all([
		// 		Numbers(),
		// 		Class.find().sort({ className: 1 }),
		// 		Teacher.find(),
		// 		Admin.findById(userId),
		// 	]);
		// 	return { numbers, classes, allTeachers, user };
		// };
		// await countMembers();

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
				{ createdBy: req.user.username, unit: unitId },
				{}
			);
			user = await Teacher.findById(userId);
			// const myUnitData = await unit.getMyUnitData(user._id);
			// myUnitsData: myUnitData,

			return {
				assignments: teacherAssignments,
				user: user,
				classes: classes,
			};
		};

		let dashboardData = {};
		switch (dashType) {
			// 	case "Admin":
			// 		dashboardData = await fetchAdminData();

			// 		res.render("dashboardAdmin", { ...commonData, ...dashboardData });
			// 		break;
			case "Student":
				dashboardData = await fetchStudentData();
				res.render("unitView", { ...commonData, ...dashboardData });
				break;
			case "Teacher":
				dashboardData = await fetchTeacherData();
				res.render("unitPanel", { ...commonData, ...dashboardData });
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

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log("Error destroying session:", err);
		}
		res.redirect("/");
	});
});

// Register Route
router.post("/register", async (req, res) => {
	// console.log(req.body);
	const userType = req.body.userType; // Assuming userType is passed in the request body
	let UserModel;
	if (userType === "Admin") {
		UserModel = Admin;
	} else if (userType === "Teacher") {
		UserModel = Teacher;
	} else if (userType === "Student") {
		UserModel = Student;
	} else {
		req.flash("info", "Invalid user type.");
		res.redirect("/register");
	}

	UserModel.register(
		{ username: req.body.username },
		req.body.password,
		(err, user) => {
			if (err) {
				req.flash("info", err.message);
				res.redirect("/register");
			} else {
				passport.authenticate(`${userType.toLowerCase()}-local`)(
					req,
					res,
					() => {
						res.redirect("/dashboard");
					}
				);
			}
		}
	);
	await countMembers();
});

// Login Route
router.post("/login", async (req, res) => {
	const userType = req.body.userType; // Assuming userType is passed in the request body
	let UserModel;
	if (userType === "Admin") {
		UserModel = Admin;
	} else if (userType === "Teacher") {
		UserModel = Teacher;
	} else if (userType === "Student") {
		UserModel = Student;
	} else {
		return res.status(400).send("Invalid user type");
	}

	const user = new UserModel({
		username: req.body.username,
		password: req.body.password,
	});

	req.login(user, (err) => {
		if (err) {
			console.log(err);
			req.flash("info", err.message);
			res.redirect("/login");
		} else {
			passport.authenticate(`${userType.toLowerCase()}-local`)(req, res, () => {
				res.redirect("/dashboard");
			});
		}
	});
});

module.exports = router;
