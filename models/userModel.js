const mongoose  = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, 'Please tell us your username']
    },
    role: {
      type: String,
      enum: ['standard', 'authorised', 'maintenance', 'admin'],
      default: 'standard'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6
    },
    createdAt: Date
});

const User = mongoose.model('User', userSchema);

module.exports = User;
