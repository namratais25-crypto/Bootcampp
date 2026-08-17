const API_URL = "http://localhost:5000/api/complaints";


// ==========================================
// SUBMIT COMPLAINT
// ==========================================

const complaintForm = document.getElementById("complaintForm");

if (complaintForm) {

    complaintForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const data = {
            residentName: document.getElementById("residentName").value.trim(),
            roomNumber: document.getElementById("roomNumber").value.trim(),
            contact: document.getElementById("contact").value.trim(),
            category: document.getElementById("category").value,
            description: document.getElementById("description").value.trim(),
            priority: document.getElementById("priority").value,
            additionalInfo: document.getElementById("additionalInfo").value.trim()
        };

        if (
            !data.residentName ||
            !data.roomNumber ||
            !data.contact ||
            !data.category ||
            !data.description ||
            !data.priority
        ) {
            showMessage("Please fill all required fields.", "error");
            return;
        }

        if (!/^[0-9]{10}$/.test(data.contact)) {
            showMessage("Enter a valid 10-digit contact number.", "error");
            return;
        }

        try {

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                showMessage(result.message, "error");
                return;
            }

            showMessage(
                "Complaint submitted successfully! Complaint ID: " +
                result.complaint.id,
                "success"
            );

            complaintForm.reset();

        } catch (error) {

            showMessage(
                "Unable to connect to server. Make sure backend is running.",
                "error"
            );
        }
    });
}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text, type) {

    const message = document.getElementById("message");

    if (!message) return;

    message.textContent = text;
    message.className = "message " + type;
    message.style.display = "block";
}


// ==========================================
// LOAD COMPLAINTS
// ==========================================

async function loadComplaints() {

    const list = document.getElementById("complaintList");

    if (!list) return;

    try {

        const response = await fetch(API_URL);
        const complaints = await response.json();

        displayComplaints(complaints);

    } catch (error) {

        list.innerHTML = `
            <div class="message error" style="display:block">
                Unable to load complaints.
            </div>
        `;
    }
}


// ==========================================
// DISPLAY COMPLAINTS
// ==========================================

function displayComplaints(complaints) {

    const list = document.getElementById("complaintList");

    if (!list) return;

    if (complaints.length === 0) {

        list.innerHTML = `
            <div class="card">
                <h3>No complaints found</h3>
            </div>
        `;

        return;
    }

    list.innerHTML = complaints.map(complaint => {

        const statusClass = complaint.status.replaceAll(" ", "-");

        return `
            <div class="complaint-card">

                <h3>
                    Complaint #${complaint.id}
                </h3>

                <p>
                    <strong>Resident:</strong>
                    ${complaint.residentName}
                </p>

                <p>
                    <strong>Room:</strong>
                    ${complaint.roomNumber}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${complaint.category}
                </p>

                <p>
                    <strong>Priority:</strong>
                    ${complaint.priority}
                </p>

                <span class="status status-${statusClass}">
                    ${complaint.status}
                </span>

                <br>

                <a
                    class="btn"
                    href="details.html?id=${complaint.id}">
                    View Details
                </a>

                <a
                    class="btn btn-warning"
                    href="edit.html?id=${complaint.id}">
                    Edit
                </a>

                <a
                    class="btn btn-success"
                    href="track.html?id=${complaint.id}">
                    Track
                </a>

                <button
                    class="btn btn-danger"
                    onclick="deleteComplaint(${complaint.id})">
                    Delete
                </button>

            </div>
        `;

    }).join("");
}


// ==========================================
// SEARCH / FILTER
// ==========================================

async function filterComplaints() {

    const search = document
        .getElementById("search")
        .value
        .toLowerCase();

    const category = document
        .getElementById("filterCategory")
        .value;

    const status = document
        .getElementById("filterStatus")
        .value;

    const response = await fetch(API_URL);

    const complaints = await response.json();

    const filtered = complaints.filter(complaint => {

        const matchesSearch =
            complaint.residentName.toLowerCase().includes(search) ||
            complaint.roomNumber.toLowerCase().includes(search) ||
            complaint.category.toLowerCase().includes(search);

        const matchesCategory =
            !category || complaint.category === category;

        const matchesStatus =
            !status || complaint.status === status;

        return matchesSearch &&
               matchesCategory &&
               matchesStatus;
    });

    displayComplaints(filtered);
}


// ==========================================
// DELETE
// ==========================================

async function deleteComplaint(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this complaint?"
    );

    if (!confirmDelete) return;

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (response.ok) {

            alert("Complaint deleted successfully.");

            loadComplaints();

        } else {

            alert(result.message);
        }

    } catch (error) {

        alert("Unable to delete complaint.");
    }
}


// ==========================================
// LOAD DETAILS
// ==========================================

async function loadDetails() {

    const container = document.getElementById("details");

    if (!container) return;

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) {

        container.innerHTML = `
            <div class="message error" style="display:block">
                Complaint ID is missing.
            </div>
        `;

        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`);

        const complaint = await response.json();

        if (!response.ok) {

            container.innerHTML = `
                <div class="message error" style="display:block">
                    ${complaint.message}
                </div>
            `;

            return;
        }

        container.innerHTML = `

            <h2>Complaint #${complaint.id}</h2>

            <div class="detail-row">
                <strong>Resident Name:</strong>
                ${complaint.residentName}
            </div>

            <div class="detail-row">
                <strong>Room/Flat Number:</strong>
                ${complaint.roomNumber}
            </div>

            <div class="detail-row">
                <strong>Contact:</strong>
                ${complaint.contact}
            </div>

            <div class="detail-row">
                <strong>Category:</strong>
                ${complaint.category}
            </div>

            <div class="detail-row">
                <strong>Description:</strong>
                ${complaint.description}
            </div>

            <div class="detail-row">
                <strong>Date:</strong>
                ${new Date(complaint.date).toLocaleString()}
            </div>

            <div class="detail-row">
                <strong>Priority:</strong>
                ${complaint.priority}
            </div>

            <div class="detail-row">
                <strong>Status:</strong>
                ${complaint.status}
            </div>

            <div class="detail-row">
                <strong>Additional Information:</strong>
                ${complaint.additionalInfo || "None"}
            </div>

            <br>

            <a
                class="btn btn-warning"
                href="edit.html?id=${complaint.id}">
                Edit Complaint
            </a>

            <a
                class="btn btn-success"
                href="track.html?id=${complaint.id}">
                Track Status
            </a>

        `;

    } catch (error) {

        container.innerHTML = `
            <div class="message error" style="display:block">
                Server connection failed.
            </div>
        `;
    }
}


// ==========================================
// LOAD EDIT FORM
// ==========================================

async function loadEditForm() {

    const form = document.getElementById("editForm");

    if (!form) return;

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) return;

    const response = await fetch(`${API_URL}/${id}`);

    const complaint = await response.json();

    if (!response.ok) {

        alert(complaint.message);
        return;
    }

    document.getElementById("residentName").value =
        complaint.residentName;

    document.getElementById("roomNumber").value =
        complaint.roomNumber;

    document.getElementById("contact").value =
        complaint.contact;

    document.getElementById("category").value =
        complaint.category;

    document.getElementById("description").value =
        complaint.description;

    document.getElementById("priority").value =
        complaint.priority;

    document.getElementById("additionalInfo").value =
        complaint.additionalInfo || "";


    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const data = {

            residentName:
                document.getElementById("residentName").value.trim(),

            roomNumber:
                document.getElementById("roomNumber").value.trim(),

            contact:
                document.getElementById("contact").value.trim(),

            category:
                document.getElementById("category").value,

            description:
                document.getElementById("description").value.trim(),

            priority:
                document.getElementById("priority").value,

            additionalInfo:
                document.getElementById("additionalInfo").value.trim()
        };


        const updateResponse = await fetch(`${API_URL}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });


        const result = await updateResponse.json();


        if (!updateResponse.ok) {

            showMessage(result.message, "error");

            return;
        }


        showMessage(
            "Complaint updated successfully.",
            "success"
        );

    });
}


// ==========================================
// TRACK STATUS
// ==========================================

async function loadTrack() {

    const container = document.getElementById("trackDetails");

    if (!container) return;

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) return;


    const response = await fetch(`${API_URL}/${id}`);

    const complaint = await response.json();


    if (!response.ok) {

        container.innerHTML = `
            <div class="message error" style="display:block">
                ${complaint.message}
            </div>
        `;

        return;
    }


    container.innerHTML = `

        <h2>Complaint #${complaint.id}</h2>

        <p>
            <strong>Resident:</strong>
            ${complaint.residentName}
        </p>

        <p>
            <strong>Category:</strong>
            ${complaint.category}
        </p>

        <br>

        <h3>Current Status</h3>

        <br>

        <span class="status status-${complaint.status.replaceAll(" ", "-")}">
            ${complaint.status}
        </span>

        <br><br>

        <label>Update Status</label>

        <select id="newStatus">

            <option value="Pending">
                Pending
            </option>

            <option value="In Progress">
                In Progress
            </option>

            <option value="Resolved">
                Resolved
            </option>

            <option value="Cancelled">
                Cancelled
            </option>

        </select>

        <button
            class="btn btn-success"
            onclick="updateStatus(${complaint.id})">
            Update Status
        </button>

    `;
}


// ==========================================
// UPDATE STATUS
// ==========================================

async function updateStatus(id) {

    const status = document.getElementById("newStatus").value;


    const response = await fetch(`${API_URL}/${id}/status`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            status: status
        })

    });


    const result = await response.json();


    if (response.ok) {

        alert("Status updated successfully.");

        loadTrack();

    } else {

        alert(result.message);
    }
}


// ==========================================
// AUTO LOAD
// ==========================================

loadComplaints();
loadDetails();
loadEditForm();
loadTrack();