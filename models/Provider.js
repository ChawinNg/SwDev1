const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 charecters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    tel: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//Reverse populate with virtuals
// ProviderSchema.virtual("appointments", {
//   ref: "Appointment",
//   localField: "_id",
//   foreignField: "hospital",
//   justOne: false,
// });

//Cascade delete appointments when a hospital is deleted
// ProviderSchema.pre("remove", async function (next) {
//   console.log(`Appointments being removed from hospital ${this._id}`);
//   await this.model("Appointment").deleteMany({ hospital: this._id });
//   next();
// });

module.exports = mongoose.model("Provider", ProviderSchema);
