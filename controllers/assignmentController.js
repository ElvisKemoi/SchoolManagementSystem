const Assignment = require("../models/assignmentModel");

const assignment = {
	save: async (
		title,
		description,
		filePath,
		creator,
		subject,
		unit,
		deadline
	) => {
		try {
			const newAssignment = new Assignment({
				title: title,
				description: description,
				filePath: filePath,
				createdBy: creator,
				subject: subject,
				unit: unit,
				deadline: deadline,
			});

			const saveStatus = await newAssignment.save();
			if (saveStatus) {
				return saveStatus;
			} else {
				throw new Error("Assignment Not Saved!");
			}
		} catch (error) {}
	},
};

module.exports = assignment;
