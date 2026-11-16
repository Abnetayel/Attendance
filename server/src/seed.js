const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');

const users = [
    { name: 'Super Admin', email: 'admin@company.com', password: 'admin123', role: 'Admin', department: 'Management' },
    { name: 'Jane Manager', email: 'manager@company.com', password: 'manager123', role: 'Manager', department: 'Engineering' },
    { name: 'Attendance Manager', email: 'attendance@company.com', password: 'attendance123', role: 'AttendanceManager', department: 'HR' },
    { name: 'Alice Johnson', email: 'alice@company.com', password: 'alice123', role: 'Employee', department: 'Engineering' },
    { name: 'Bob Smith', email: 'bob@company.com', password: 'bob123', role: 'Employee', department: 'HR' },
    { name: 'Carol White', email: 'carol@company.com', password: 'carol123', role: 'Employee', department: 'Finance' },
];

const getPastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

const randomHour = (start, end) => start + Math.floor(Math.random() * (end - start));

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`👤 Created ${createdUsers.length} users`);

    // Seed attendance for employees (last 14 days)
    const employees = createdUsers.filter(u => u.role === 'Employee');
    const attendanceManager = createdUsers.find(u => u.role === 'AttendanceManager');
    const attendanceDocs = [];

    for (const emp of employees) {
        for (let i = 1; i <= 14; i++) {
            const date = getPastDate(i);
            const checkInHour = randomHour(8, 10);
            const checkInTime = new Date(`${date}T0${checkInHour}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`);
            const checkOutTime = new Date(checkInTime.getTime() + (randomHour(7, 9) * 60 * 60 * 1000));
            const totalHours = parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2));
            const isLate = checkInHour >= 10;
            const status = isLate ? 'Late' : totalHours < 4 ? 'Half-Day' : 'Present';

            attendanceDocs.push({
                userId: emp._id,
                date,
                checkInTime,
                checkOutTime,
                totalHours,
                status,
                recordedBy: attendanceManager ? attendanceManager._id : null,
            });
        }
    }

    await Attendance.insertMany(attendanceDocs);
    console.log(`📅 Created ${attendanceDocs.length} attendance records`);

    // Seed some leave requests
    const alice = createdUsers.find(u => u.email === 'alice@company.com');
    const bob = createdUsers.find(u => u.email === 'bob@company.com');
    const admin = createdUsers.find(u => u.role === 'Admin');

    await Leave.create([
        {
            userId: alice._id,
            leaveType: 'Sick',
            startDate: getPastDate(20),
            endDate: getPastDate(18),
            reason: 'Flu and fever',
            status: 'Approved',
            reviewedBy: admin._id,
            reviewNote: 'Get well soon!',
        },
        {
            userId: bob._id,
            leaveType: 'Casual',
            startDate: getPastDate(5),
            endDate: getPastDate(4),
            reason: 'Personal work',
            status: 'Pending',
        },
        {
            userId: alice._id,
            leaveType: 'Annual',
            startDate: getPastDate(2),
            endDate: getPastDate(1),
            reason: 'Family vacation',
            status: 'Rejected',
            reviewedBy: admin._id,
            reviewNote: 'Too short notice.',
        },
    ]);
    console.log('📋 Created leave records');

    console.log('\n🎉 Seed complete! Login credentials:');
    console.log('   Admin              → admin@company.com       / admin123');
    console.log('   Manager            → manager@company.com     / manager123');
    console.log('   Attendance Manager → attendance@company.com   / attendance123');
    console.log('   Employee           → alice@company.com       / alice123');
    console.log('   Employee           → bob@company.com         / bob123');
    console.log('   Employee           → carol@company.com       / carol123');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
