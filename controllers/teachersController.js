const Teacher = require("../models/teacherModel");
const teacher = {
	createFirst: async (username, password) => {
		try {
			const adminFound = await Teacher.find({ username: username });

			if (!(adminFound.length > 0)) {
				Teacher.register({ username: username }, password, (err, user) => {
					if (err) {
						throw new Error(err.message);
					} else {
						return true;
					}
				});
			} else {
				return true;
			}
		} catch (error) {
			return { error: error.message };
		}
	},
	getName: async (teacherId) => {
		try {
			const foundTeacher = await Teacher.findById(
				{ _id: teacherId },
				{ username: true }
			);

			return foundTeacher.username;
		} catch (error) {
			return "Lecturer Not Available";
		}
	},
};

module.exports = teacher;
