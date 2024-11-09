const Deferment = require("../models/defermentModel");
const messages = require("./messageController");
const Student = require("../models/studentModel");
const deferment = {
	save: async (studentName, studentId, reason) => {
		try {
			const newDeferment = new Deferment({
				studentName: studentName,
				studentNumber: studentId,
				reason: reason,
			});
			const savedDeferment = await newDeferment.save();

			if (!savedDeferment.error) {
				const savedMessage = await messages.save(
					Student,
					"Deferment Request Sent Successfully. Please wait for confirmation.",
					studentId
				);
				return true;
			} else {
				throw new Error(savedDeferment.error);
			}
		} catch (error) {
			return { error: error.message };
		}
	},
	approve: async (defermentId) => {
		try {
			const theDeferment = await Deferment.findByIdAndUpdate(
				{ _id: defermentId },
				{
					$set: {
						approved: true,
					},
				}
			);
			const savedMessage = await messages.save(
				Student,
				"Deferment Request Approved!",
				theDeferment.studentNumber
			);
			return true;
		} catch (error) {
			return { error: error.message };
		}
	},
	list: async () => {
		try {
			const theDeferments = await Deferment.find();
			return theDeferments;
		} catch (error) {
			return { error: error.message };
		}
	},
	delete: async (defermentId) => {
		try {
			const deletedDefermentRequest = await Deferment.findByIdAndDelete(
				defermentId
			);
			if (!deletedDefermentRequest.error) {
				return true;
			} else {
				throw new Error("Failed To Delete Deferment Request!");
			}
		} catch (error) {
			return { error: error.message };
		}
	},
};
module.exports = deferment;
