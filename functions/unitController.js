const Unit = require("../models/unitModel");
const teacher = require("./teachersController");

const unit = {
	save: async (unitName, unitCode, enrollmentKey, creator) => {
		try {
			enrollmentKey = enrollmentKey === "" ? undefined : enrollmentKey;

			const newUnit = new Unit({
				unitName: unitName,
				unitCode: unitCode,
				enrollmentKey: enrollmentKey,
				creator: creator,
			});
			const savedUnit = await newUnit.save();
			if (savedUnit) {
				if (!savedUnit.error) {
					return true;
				} else {
					throw new Error(savedUnit.error);
				}
			} else {
				throw new Error("Unit Not Saved!");
			}
		} catch (error) {
			return { error: error.message };
		}
	},
	deleteUnit: async (unitId) => {
		try {
			const deletedUnit = await Unit.findByIdAndDelete({ _id: unitId });
			if (deletedUnit) {
				return true;
			} else {
				throw new Error("Unit Not Deleted!");
			}
		} catch (error) {
			return { error: error.message };
		}
	},
	addMember: async (unitId, studentId) => {
		try {
			const updatedUnit = await Unit.findByIdAndUpdate(
				{ _id: unitId },
				{ $push: { members: studentId } }
			);
			if (updatedUnit) {
				return true;
			} else {
				throw new Error("Member Not Added!");
			}
		} catch (error) {
			return { error: error.message };
		}
	},
	getUnitData: async (unitsArray) => {
		try {
			let theUnits = [];
			for (let index = 0; index < unitsArray.length; index++) {
				const element = unitsArray[index];
				let theUnit = await Unit.findById({ _id: element });
				// TODO ADD CREATOR NAME

				theUnit["creatorName"] = await teacher.getName(theUnit.creator);

				theUnits.push(theUnit);
			}

			return theUnits;
		} catch (error) {
			return { error: error.message };
		}
	},
	getMyUnitData: async (teacherId) => {
		try {
			const unitsGotten = await Unit.find({ creator: teacherId });
			if (unitsGotten) {
				return unitsGotten;
			} else {
				throw new Error("Units Not Found!");
			}
		} catch (error) {
			return { error: error.message };
		}
	},
	getSearch: async (searchValue) => {
		try {
			let theRealResults = [];
			const results = await Unit.find({});
			for (let index = 0; index < results.length; index++) {
				const element = results[index];

				if (
					element.unitName.toLowerCase().includes(searchValue.toLowerCase()) ||
					element.unitCode.toLowerCase().includes(searchValue.toLowerCase())
				) {
					theRealResults.push(element);
				}
			}

			return theRealResults;
		} catch (error) {
			return { error: error.message };
		}
	},
	isProtected: async (unitId) => {
		try {
			const foundUnit = await Unit.findById(
				{ _id: unitId },
				{ enrollmentKey: true }
			);
			return foundUnit.enrollmentKey;
		} catch (error) {
			return { error: error.message };
		}
	},
};
module.exports = unit;
