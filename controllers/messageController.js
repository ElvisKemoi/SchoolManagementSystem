const Student = require("../models/studentModel");
const message = {
	save: async (theTitle, studentId) => {
		try {
			const updatedStudent = await Student.findByIdAndUpdate(
				studentId,
				{
					$push: {
						messages: { title: theTitle, read: false },
					},
				},
				{ new: true } // This option returns the updated document
			);
			if (updatedStudent) {
				return true;
			} else {
				throw new Error("Message Not Saved!");
			}
		} catch (error) {
			return { error: error.message };
		}
	},
	markAsRead: async (studentId) => {
		try {
			const updatedStudent = await Student.findByIdAndUpdate(
				{ _id: studentId },
				{ $set: { messages: { read: true } } }
			);
			return true;
		} catch (error) {
			return { error: error.message };
		}
	},
	deleteAll: async (studentId) => {
		try {
			const updatedStudent = await Student.findByIdAndUpdate(
				{ _id: studentId },
				{ $set: { messages: [] } },
				{ new: true }
			);
			return true;
		} catch (error) {
			return { error: error.message };
		}
	},
};
module.exports = message;
