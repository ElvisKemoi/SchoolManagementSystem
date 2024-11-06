const message = {
	save: async (User, theTitle, studentId) => {
		try {
			const updatedStudent = await User.findByIdAndUpdate(
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
	markAsRead: async (User, studentId) => {
		try {
			// TODO MAKE THE FUNCTION RIGHT
			const updatedStudent = await User.findByIdAndUpdate(
				{ _id: studentId },
				{ $set: { messages: { read: true } } }
			);
			return true;
		} catch (error) {
			return { error: error.message };
		}
	},
	deleteAll: async (User, studentId) => {
		try {
			const updatedStudent = await User.findByIdAndUpdate(
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
