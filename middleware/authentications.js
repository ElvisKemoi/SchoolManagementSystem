const Admin = require("../models/adminModel");
const Teacher = require("../models/teacherModel");
const Student = require("../models/teacherModel");
const passport = require("passport");

const { countMembers } = require("../controllers/functions");
const thisGuy = {
	hasAccess: async (req, res, next) => {
		if (req.isAuthenticated()) {
			next();
		} else {
			req.flash("info", "Session Expired! Please Login");
			res.redirect("/login");
		}
	},
	isAdmin: async (req, res, next) => {
		if (req.session.passport.user.type === "Admin") {
			next();
		} else {
			req.flash("info", "Action Prohibited! Login As Admin To Continue.");
			res.redirect("/login");
		}
	},
	isTeacher: async (req, res, next) => {
		if (req.session.passport.user.type === "Teacher") {
			next();
		} else {
			req.flash("info", "Action Prohibited! Login As Admin To Continue.");
			res.redirect("/login");
		}
	},
	register: async (req, res, next) => {
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
	},
	login: async (req, res, next) => {
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
				passport.authenticate(`${userType.toLowerCase()}-local`)(
					req,
					res,
					() => {
						res.redirect("/dashboard");
					}
				);
			}
		});
	},
};
module.exports = thisGuy;
