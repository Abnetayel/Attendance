const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String, // YYYY-MM-DD format
            required: true,
        },
        checkInTime: {
            type: Date,
            default: null,
        },
        checkOutTime: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ['Present', 'Late', 'Half-Day', 'Absent'],
            default: 'Present',
        },
        totalHours: {
            type: Number, // in decimal hours e.g. 8.5
            default: 0,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        // The user (typically an AttendanceManager) who recorded this check-in/out
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

// Compound unique index: one record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
