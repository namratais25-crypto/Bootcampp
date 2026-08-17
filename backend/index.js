const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let complaints = [
    {
        id: 1,
        residentName: "Rahul Sharma",
        roomNumber: "204",
        contact: "9876543210",
        category: "Plumbing",
        description: "Water leakage in bathroom.",
        date: new Date().toISOString(),
        priority: "High",
        status: "Pending",
        additionalInfo: "Leakage is increasing during evening."
    }
];

let nextId = 2;


// ===============================
// GET ALL COMPLAINTS
// ===============================

app.get("/api/complaints", (req, res) => {
    res.status(200).json(complaints);
});


// ===============================
// GET SINGLE COMPLAINT
// ===============================

app.get("/api/complaints/:id", (req, res) => {

    const id = Number(req.params.id);

    const complaint = complaints.find(item => item.id === id);

    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: "Complaint not found"
        });
    }

    res.status(200).json(complaint);
});


// ===============================
// CREATE COMPLAINT
// ===============================

app.post("/api/complaints", (req, res) => {

    const {
        residentName,
        roomNumber,
        contact,
        category,
        description,
        priority,
        additionalInfo
    } = req.body;

    if (
        !residentName ||
        !roomNumber ||
        !contact ||
        !category ||
        !description ||
        !priority
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required fields."
        });
    }

    if (!/^[0-9]{10}$/.test(contact)) {
        return res.status(400).json({
            success: false,
            message: "Contact number must contain exactly 10 digits."
        });
    }

    const newComplaint = {
        id: nextId++,
        residentName,
        roomNumber,
        contact,
        category,
        description,
        date: new Date().toISOString(),
        priority,
        status: "Pending",
        additionalInfo: additionalInfo || ""
    };

    complaints.push(newComplaint);

    res.status(201).json({
        success: true,
        message: "Complaint submitted successfully.",
        complaint: newComplaint
    });
});


// ===============================
// UPDATE COMPLAINT
// ===============================

app.put("/api/complaints/:id", (req, res) => {

    const id = Number(req.params.id);

    const complaint = complaints.find(item => item.id === id);

    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: "Complaint not found."
        });
    }

    const {
        residentName,
        roomNumber,
        contact,
        category,
        description,
        priority,
        additionalInfo
    } = req.body;

    if (contact && !/^[0-9]{10}$/.test(contact)) {
        return res.status(400).json({
            success: false,
            message: "Contact number must contain exactly 10 digits."
        });
    }

    if (residentName) complaint.residentName = residentName;
    if (roomNumber) complaint.roomNumber = roomNumber;
    if (contact) complaint.contact = contact;
    if (category) complaint.category = category;
    if (description) complaint.description = description;
    if (priority) complaint.priority = priority;

    if (additionalInfo !== undefined) {
        complaint.additionalInfo = additionalInfo;
    }

    res.status(200).json({
        success: true,
        message: "Complaint updated successfully.",
        complaint
    });
});


// ===============================
// UPDATE STATUS
// ===============================

app.put("/api/complaints/:id/status", (req, res) => {

    const id = Number(req.params.id);

    const complaint = complaints.find(item => item.id === id);

    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: "Complaint not found."
        });
    }

    const { status } = req.body;

    const validStatuses = [
        "Pending",
        "In Progress",
        "Resolved",
        "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status."
        });
    }

    complaint.status = status;

    res.status(200).json({
        success: true,
        message: "Complaint status updated.",
        complaint
    });
});


// ===============================
// DELETE COMPLAINT
// ===============================

app.delete("/api/complaints/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = complaints.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "Complaint not found."
        });
    }

    complaints.splice(index, 1);

    res.status(200).json({
        success: true,
        message: "Complaint deleted successfully."
    });
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`PGCare server running on http://localhost:${PORT}`);
});