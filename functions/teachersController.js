const Teacher = require("../models/teacherModel");
const teacher = {
	getName: async (teacherId) => {
		try {
			const foundTeacher = await Teacher.findById(
				{ _id: teacherId },
				{ username: true }
			);

			return foundTeacher.username;
		} catch (error) {
			return { error: error.message };
		}
	},
};

module.exports = teacher;
