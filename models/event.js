const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventsSchema = new Schema({
    category: { type: String, required: [true, 'Category is required'], enum: ['Sports Extravaganza', 'Board Game Bonanza', 'Cultural Carnival', 'Tech Symposium', 'Other']},
    title: { type: String, required: [true, 'Title is required']},
    host: { type: Schema.Types.ObjectId, ref: 'User'},
    image: { type: String, required: [true, 'Image is required']},
    startTime: { type: Date, required: [true, 'Start date and time is required']},
    endTime: { type: Date, required: [true, 'End date and time is required']},
    loc: { type: String, required: [true, 'Location is required']},
    description: { type: String, required: [true, 'Description is required'], minLength: [15, 'Description should be atleast 15 characters']}
}, {timestamps: true});

module.exports = mongoose.model('Event', eventsSchema);