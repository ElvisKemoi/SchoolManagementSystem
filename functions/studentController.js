const Student = require("../models/studentModel");
const unit = require("./unitController");

const student = {
	enrollUnit: async (studentId, unitId, enrollmentKey) => {
		try {
			const theUnitProtected = await unit.isProtected(unitId);

			if (theUnitProtected) {
				if (theUnitProtected === enrollmentKey) {
					const updatedStudent = await Student.findByIdAndUpdate(
						{ _id: studentId },
						{ $push: { myUnits: unitId } },
						{ new: true }
					);
					const addedMember = await unit.addMember(unitId, studentId);

					if (updatedStudent && addedMember) {
						return true;
					} else {
						throw new Error("Unit Not Added!");
					}
				} else {
					throw new Error("Wrong Enrollment Key!");
				}
			} else {
				const updatedStudent = await Student.findByIdAndUpdate(
					{ _id: studentId },
					{ $push: { myUnits: unitId } },
					{ new: true }
				);
				const addedMember = await unit.addMember(unitId, studentId);

				if (updatedStudent && addedMember) {
					return true;
				} else {
					throw new Error("Unit Not Added!");
				}
			}
		} catch (error) {
			return { error: error.message };
		}
	},
	unenrollUnit: async (studentId, unitId) => {
		try {
			const updatedStudent = await Student.findByIdAndUpdate(
				studentId,
				{ $pull: { myUnits: unitId } },
				{ new: true }
			);

			if (!updatedStudent) {
				return {
					error: "Student not found or already unenrolled from this unit.",
				};
			}

			return { success: true, updatedStudent };
		} catch (error) {
			return { error: error.message };
		}
	},

	getStudent: async (studentId) => {
		try {
			const foundStudent = await Student.findById({ _id: studentId });
			return foundStudent;
		} catch (error) {
			return { error: message };
		}
	},
};

module.exports = student;
