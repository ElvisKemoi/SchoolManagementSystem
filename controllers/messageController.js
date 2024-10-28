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
};
module.exports = message;
