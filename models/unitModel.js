const mongoose = require("mongoose");
const Student = require("./studentModel");
const Teacher = require("./teacherModel");

const unitSchema = new mongoose.Schema(
	{
		unitName: {
			type: String,
			required: true,
		},
		unitCode: {
			type: String,
			required: true,
		},
		enrollmentKey: {
			type: String,
			required: false,
			default: undefined,
		},
		members: {
			type: [mongoose.Schema.ObjectId],
			default: [],
		},
		creator: {
			type: mongoose.Schema.ObjectId,
			ref: Teacher,
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

const Unit = new mongoose.model("Unit", unitSchema);
module.exports = Unit;
