const mongoose = require("mongoose");
const Student = require("./studentModel");
const Teacher = require("./teacherModel");

const announcementSchema = new mongoose.Schema(
	{
		announcementTitle: {
			type: String,
			trim: true,
			required: true,
		},
		announcementDetails: {
			type: String,
			trim: true,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

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
		announcements: [announcementSchema],
		assignments: {
			type: [mongoose.Schema.ObjectId],
			default: [],
		},
		creator: {
			type: mongoose.Schema.ObjectId,
			ref: Teacher,
			default: [],
		},
		creatorName: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const Unit = new mongoose.model("Unit", unitSchema);
module.exports = Unit;
