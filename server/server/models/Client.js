const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Custom validation for Zimbabwean phone number format
        return /^(\+263)?7[0-9]{8}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid Zimbabwean phone number!`,
    },
  },
});

module.exports = mongoose.model("Client", ClientSchema);
