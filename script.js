const API_URL = "http://localhost:8080/api/bugs";
const USERS_API_URL = "http://localhost:8080/api/users";

let bugs = [];
let users = [];
let editingBugId = null;
let assigningBugId = null;


// ================================
// ELEMENTS
// ================================

const createBugButton = document.getElementById("createBugButton");
const sidebarCreateBug = document.getElementById("sidebarCreateBug");

const bugModal = document.getElementById("bugModal");
const closeModal = document.getElementById("closeModal");
const cancelButton = document.getElementById("cancelButton");

const bugForm = document.getElementById("bugForm");

const bugModalTitle = document.getElementById("bugModalTitle");
const bugModalSubtitle = document.getElementById("bugModalSubtitle");
const saveBugButton = document.getElementById("saveBugButton");

const bugTitle = document.getElementById("bugTitle");
const bugDescription = document.getElementById("bugDescription");
const bugPriority = document.getElementById("bugPriority");
const bugStatus = document.getElementById("bugStatus");

const bugTableBody = document.getElementById("bugTableBody");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

const refreshButton = document.getElementById("refreshButton");

const totalBugs = document.getElementById("totalBugs");
const openBugs = document.getElementById("openBugs");
const progressBugs = document.getElementById("progressBugs");
const resolvedBugs = document.getElementById("resolvedBugs");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");


// ================================
// ASSIGN MODAL ELEMENTS
// ================================

const assignModal = document.getElementById("assignModal");
const closeAssignModal = document.getElementById("closeAssignModal");
const cancelAssignButton = document.getElementById("cancelAssignButton");
const confirmAssignButton = document.getElementById("confirmAssignButton");

const assignBugSubtitle = document.getElementById("assignBugSubtitle");
const userSelect = document.getElementById("userSelect");


// ================================
// TIMELINE ELEMENTS
// ================================

const timelineModal = document.getElementById("timelineModal");
const closeTimelineModal = document.getElementById("closeTimelineModal");

const timelineBugTitle = document.getElementById("timelineBugTitle");
const timelineBugId = document.getElementById("timelineBugId");

const timelineDescription = document.getElementById("timelineDescription");
const timelinePriority = document.getElementById("timelinePriority");
const timelineStatus = document.getElementById("timelineStatus");
const timelineAssigned = document.getElementById("timelineAssigned");

const timelineContainer = document.getElementById("timelineContainer");

const sidebarTimeline = document.getElementById("sidebarTimeline");


// ================================
// CREATE BUG
// ================================

if (createBugButton) {
    createBugButton.addEventListener("click", openCreateModal);
}

if (sidebarCreateBug) {
    sidebarCreateBug.addEventListener("click", function (event) {
        event.preventDefault();
        openCreateModal();
    });
}


function openCreateModal() {

    editingBugId = null;

    if (bugForm) {
        bugForm.reset();
    }

    if (bugPriority) {
        bugPriority.value = "LOW";
    }

    if (bugStatus) {
        bugStatus.value = "OPEN";
    }

    if (bugModalTitle) {
        bugModalTitle.textContent = "Create New Bug";
    }

    if (bugModalSubtitle) {
        bugModalSubtitle.textContent =
            "Report a new issue to the development team.";
    }

    if (saveBugButton) {
        saveBugButton.textContent = "Create Bug";
    }

    if (bugModal) {
        bugModal.classList.add("show");
    }
}


// ================================
// CLOSE BUG MODAL
// ================================

if (closeModal) {
    closeModal.addEventListener("click", closeBugModal);
}

if (cancelButton) {
    cancelButton.addEventListener("click", closeBugModal);
}


function closeBugModal() {

    if (bugModal) {
        bugModal.classList.remove("show");
    }

    if (bugForm) {
        bugForm.reset();
    }

    editingBugId = null;
}


// ================================
// CLOSE MODAL OUTSIDE
// ================================

if (bugModal) {

    bugModal.addEventListener("click", function (event) {

        if (event.target === bugModal) {
            closeBugModal();
        }

    });

}


if (assignModal) {

    assignModal.addEventListener("click", function (event) {

        if (event.target === assignModal) {
            closeAssignModalFunction();
        }

    });

}


if (timelineModal) {

    timelineModal.addEventListener("click", function (event) {

        if (event.target === timelineModal) {
            closeTimeline();
        }

    });

}


// ================================
// LOAD BUGS
// ================================

async function loadBugs() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch bugs");
        }

        bugs = await response.json();

        if (!Array.isArray(bugs)) {
            bugs = [];
        }

        renderBugs();
        updateStatistics();

    }
    catch (error) {

        console.error("Error loading bugs:", error);

        showToast(
            "Connection Error",
            "Unable to connect to the Spring Boot server."
        );

    }

}


// ================================
// LOAD USERS
// ================================

async function loadUsers() {

    try {

        const response = await fetch(USERS_API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        users = await response.json();

        if (!Array.isArray(users)) {
            users = [];
        }

    }
    catch (error) {

        console.error("Error loading users:", error);

        users = [];

        throw error;
    }

}


// ================================
// CREATE / UPDATE BUG
// ================================

if (bugForm) {

    bugForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const bugData = {

            title: bugTitle
                ? bugTitle.value.trim()
                : "",

            description: bugDescription
                ? bugDescription.value.trim()
                : "",

            priority: bugPriority
                ? bugPriority.value
                : "LOW",

            status: bugStatus
                ? bugStatus.value
                : "OPEN"

        };


        if (!bugData.title || !bugData.description) {

            showToast(
                "Validation Error",
                "Please enter the bug title and description."
            );

            return;
        }


        const currentEditingId = editingBugId;


        try {

            let response;


            // CREATE
            if (currentEditingId === null) {

                response = await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(bugData)

                });

            }


            // UPDATE
            else {

                response = await fetch(
                    API_URL + "/" + currentEditingId,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(bugData)

                    }
                );

            }


            if (!response.ok) {

                let errorData = null;

                try {
                    errorData = await response.json();
                }
                catch (error) {
                    errorData = null;
                }


                if (
                    errorData &&
                    errorData.message &&
                    errorData.message
                        .toLowerCase()
                        .includes("duplicate")
                ) {

                    throw new Error(
                        "Duplicate bug already exists"
                    );

                }


                throw new Error("Unable to save bug");

            }


            closeBugModal();

            await loadBugs();


            if (currentEditingId === null) {

                showToast(
                    "Bug Created",
                    "The bug has been created successfully."
                );

            }
            else {

                showToast(
                    "Bug Updated",
                    "The bug has been updated successfully."
                );

            }

        }
        catch (error) {

            console.error("Error saving bug:", error);


            if (
                error.message ===
                "Duplicate bug already exists"
            ) {

                showToast(
                    "Duplicate Bug",
                    "A bug with the same title and description already exists."
                );

            }
            else {

                showToast(
                    "Error",
                    "Unable to save the bug."
                );

            }

        }

    });

}


// ================================
// RENDER BUGS
// ================================

function renderBugs() {

    if (!bugTableBody) {
        return;
    }


    bugTableBody.innerHTML = "";


    const searchText = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";


    const selectedStatus = statusFilter
        ? statusFilter.value
        : "";


    const selectedPriority = priorityFilter
        ? priorityFilter.value
        : "";


    const filteredBugs = bugs.filter(function (bug) {

        const title = bug.title
            ? String(bug.title).toLowerCase()
            : "";


        const description = bug.description
            ? String(bug.description).toLowerCase()
            : "";


        const matchesSearch =
            title.includes(searchText) ||
            description.includes(searchText);


        const matchesStatus =
            selectedStatus === "" ||
            bug.status === selectedStatus;


        const matchesPriority =
            selectedPriority === "" ||
            bug.priority === selectedPriority;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );

    });


    if (filteredBugs.length === 0) {

        if (emptyState) {
            emptyState.style.display = "block";
        }

        return;

    }


    if (emptyState) {
        emptyState.style.display = "none";
    }


    filteredBugs.forEach(function (bug) {

        const row = document.createElement("tr");


        const assignedName =
            bug.assignedTo &&
            bug.assignedTo.name
                ? bug.assignedTo.name
                : "Unassigned";


        row.innerHTML = `

            <td>
                #${bug.id}
            </td>

            <td>

                <strong>
                    ${escapeHTML(bug.title)}
                </strong>

                <div class="bug-description">
                    ${escapeHTML(bug.description)}
                </div>

            </td>

            <td>

                <span class="priority-badge ${getPriorityClass(bug.priority)}">

                    ${formatText(bug.priority)}

                </span>

            </td>

            <td>

                <span class="status-badge ${getStatusClass(bug.status)}">

                    ${formatText(bug.status)}

                </span>

            </td>

            <td>
                ${escapeHTML(assignedName)}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="action-button"
                        onclick="viewBug(${bug.id})"
                        title="View Bug"
                    >
                        👁
                    </button>

                    <button
                        class="action-button"
                        onclick="editBug(${bug.id})"
                        title="Edit Bug"
                    >
                        ✏
                    </button>

                    <button
                        class="action-button"
                        onclick="openAssignModal(${bug.id})"
                        title="Assign Bug"
                    >
                        👤
                    </button>

                    <button
                        class="action-button"
                        onclick="deleteBug(${bug.id})"
                        title="Delete Bug"
                    >
                        🗑
                    </button>

                </div>

            </td>

        `;


        bugTableBody.appendChild(row);

    });

}


// ================================
// EDIT BUG
// ================================

function editBug(id) {

    const bug = bugs.find(function (item) {
        return item.id === id;
    });


    if (!bug) {

        showToast(
            "Error",
            "Bug not found."
        );

        return;
    }


    editingBugId = id;


    if (bugTitle) {
        bugTitle.value = bug.title || "";
    }


    if (bugDescription) {
        bugDescription.value = bug.description || "";
    }


    if (bugPriority) {
        bugPriority.value = bug.priority || "LOW";
    }


    if (bugStatus) {
        bugStatus.value = bug.status || "OPEN";
    }


    if (bugModalTitle) {
        bugModalTitle.textContent = "Edit Bug";
    }


    if (bugModalSubtitle) {
        bugModalSubtitle.textContent =
            "Update the details of this bug.";
    }


    if (saveBugButton) {
        saveBugButton.textContent = "Update Bug";
    }


    if (bugModal) {
        bugModal.classList.add("show");
    }

}


// ================================
// DELETE BUG
// ================================

async function deleteBug(id) {

    const bug = bugs.find(function (item) {
        return item.id === id;
    });


    if (!bug) {
        return;
    }


    const confirmed = confirm(
        'Are you sure you want to delete "' +
        bug.title +
        '"?'
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            API_URL + "/" + id,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to delete bug"
            );

        }


        await loadBugs();


        showToast(
            "Bug Deleted",
            "The bug has been removed successfully."
        );

    }
    catch (error) {

        console.error(
            "Error deleting bug:",
            error
        );


        showToast(
            "Error",
            "Unable to delete the bug."
        );

    }

}


// ================================
// ASSIGN BUG
// ================================

async function openAssignModal(id) {

    const bug = bugs.find(function (item) {
        return item.id === id;
    });


    if (!bug) {

        showToast(
            "Error",
            "Bug not found."
        );

        return;
    }


    assigningBugId = id;


    if (assignBugSubtitle) {

        assignBugSubtitle.textContent =
            'Assign "' +
            bug.title +
            '" to a developer.';

    }


    if (userSelect) {

        userSelect.innerHTML = `

            <option value="">
                Select a developer
            </option>

        `;

    }


    try {

        await loadUsers();


        const developers = users.filter(function (user) {

            return (
                user.role === "DEVELOPER" ||
                user.role === "USER"
            );

        });


        if (developers.length === 0) {

            showToast(
                "No Users",
                "No developers are available."
            );

            return;
        }


        developers.forEach(function (user) {

            const option =
                document.createElement("option");


            option.value = user.id;


            option.textContent =
                user.name +
                " (" +
                user.role +
                ")";


            userSelect.appendChild(option);

        });


        if (bug.assignedTo) {

            userSelect.value =
                bug.assignedTo.id;

        }


        if (assignModal) {
            assignModal.classList.add("show");
        }

    }
    catch (error) {

        console.error(
            "Error opening assign modal:",
            error
        );


        showToast(
            "Error",
            "Unable to load users."
        );

    }

}


// ================================
// CONFIRM ASSIGNMENT
// ================================

if (confirmAssignButton) {

    confirmAssignButton.addEventListener(
        "click",
        assignBug
    );

}


async function assignBug() {

    if (assigningBugId === null) {

        showToast(
            "Error",
            "No bug selected."
        );

        return;
    }


    if (!userSelect) {

        showToast(
            "Error",
            "User selection is unavailable."
        );

        return;
    }


    const selectedUserId =
        userSelect.value;


    if (!selectedUserId) {

        showToast(
            "Select Developer",
            "Please select a developer."
        );

        return;
    }


    try {

        const response = await fetch(

            API_URL +
            "/" +
            assigningBugId +
            "/assign/" +
            selectedUserId,

            {
                method: "PUT"
            }

        );


        if (!response.ok) {

            throw new Error(
                "Unable to assign bug"
            );

        }


        closeAssignModalFunction();


        await loadBugs();


        showToast(
            "Bug Assigned",
            "The bug has been assigned successfully."
        );

    }
    catch (error) {

        console.error(
            "Error assigning bug:",
            error
        );


        showToast(
            "Assignment Error",
            "Unable to assign the bug."
        );

    }

}


// ================================
// CLOSE ASSIGN MODAL
// ================================

if (closeAssignModal) {

    closeAssignModal.addEventListener(
        "click",
        closeAssignModalFunction
    );

}


if (cancelAssignButton) {

    cancelAssignButton.addEventListener(
        "click",
        closeAssignModalFunction
    );

}


function closeAssignModalFunction() {

    if (assignModal) {
        assignModal.classList.remove("show");
    }

    assigningBugId = null;

}


// ================================
// VIEW BUG + HISTORY
// ================================

async function viewBug(id) {

    const bug = bugs.find(function (item) {
        return item.id === id;
    });


    if (!bug) {

        showToast(
            "Error",
            "Bug not found."
        );

        return;
    }


    const assignedName =
        bug.assignedTo &&
        bug.assignedTo.name
            ? bug.assignedTo.name
            : "Unassigned";


    if (
        !timelineModal ||
        !timelineBugTitle ||
        !timelineBugId ||
        !timelineDescription ||
        !timelinePriority ||
        !timelineStatus ||
        !timelineAssigned ||
        !timelineContainer
    ) {

        alert(

            "BUG DETAILS\n\n" +

            "ID: #" +
            bug.id +
            "\n\n" +

            "Title: " +
            bug.title +
            "\n\n" +

            "Description: " +
            bug.description +
            "\n\n" +

            "Priority: " +
            formatText(bug.priority) +
            "\n\n" +

            "Status: " +
            formatText(bug.status) +
            "\n\n" +

            "Assigned To: " +
            assignedName

        );

        return;
    }


    timelineBugTitle.textContent =
        bug.title || "Bug Details";


    timelineBugId.textContent =
        "Bug #" + bug.id;


    timelineDescription.textContent =
        bug.description ||
        "No description available.";


    timelinePriority.textContent =
        formatText(bug.priority);


    timelineStatus.textContent =
        formatText(bug.status);


    timelineAssigned.textContent =
        assignedName;


    timelineContainer.innerHTML = `

        <div class="timeline-loading">
            Loading bug history...
        </div>

    `;


    timelineModal.classList.add("show");


    try {

        const response = await fetch(
            API_URL +
            "/" +
            id +
            "/history"
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load bug history"
            );

        }


        const history =
            await response.json();


        renderTimeline(history);

    }
    catch (error) {

        console.error(
            "Error loading bug history:",
            error
        );


        timelineContainer.innerHTML = `

            <div class="timeline-empty">

                <div class="timeline-empty-icon">
                    ⚠
                </div>

                <h4>
                    Unable to load history
                </h4>

                <p>
                    The bug details are available,
                    but the timeline could not be loaded.
                </p>

            </div>

        `;

    }

}


// ================================
// RENDER TIMELINE
// ================================

function renderTimeline(history) {

    if (!timelineContainer) {
        return;
    }


    timelineContainer.innerHTML = "";


    if (!history || history.length === 0) {

        timelineContainer.innerHTML = `

            <div class="timeline-empty">

                <div class="timeline-empty-icon">
                    ◷
                </div>

                <h4>
                    No history available
                </h4>

                <p>
                    No activity has been recorded for this bug yet.
                </p>

            </div>

        `;

        return;
    }


    history.forEach(function (item) {

        const timelineItem =
            document.createElement("div");


        timelineItem.className =
            "timeline-item";


        const actionInfo =
            getHistoryAction(item.action);


        timelineItem.innerHTML = `

            <div class="timeline-dot ${actionInfo.className}">

                ${actionInfo.icon}

            </div>


            <div class="timeline-content">

                <div class="timeline-content-header">

                    <strong>
                        ${escapeHTML(actionInfo.title)}
                    </strong>

                    <span>
                        ${formatDate(item.changedAt)}
                    </span>

                </div>


                <p class="timeline-action">

                    ${escapeHTML(
                        buildHistoryMessage(item)
                    )}

                </p>

            </div>

        `;


        timelineContainer.appendChild(
            timelineItem
        );

    });

}


// ================================
// HISTORY ACTION
// ================================

function getHistoryAction(action) {

    if (action === "BUG_CREATED") {

        return {
            title: "Bug Created",
            icon: "＋",
            className: "timeline-created"
        };

    }


    if (action === "BUG_ASSIGNED") {

        return {
            title: "Bug Assigned",
            icon: "👤",
            className: "timeline-assigned"
        };

    }


    if (action === "STATUS_CHANGED") {

        return {
            title: "Status Changed",
            icon: "↻",
            className: "timeline-status"
        };

    }


    if (action === "PRIORITY_CHANGED") {

        return {
            title: "Priority Changed",
            icon: "!",
            className: "timeline-priority"
        };

    }


    if (action === "BUG_UPDATED") {

        return {
            title: "Bug Updated",
            icon: "✎",
            className: "timeline-updated"
        };

    }


    return {

        title: formatText(action),
        icon: "•",
        className: "timeline-default"

    };

}


// ================================
// HISTORY MESSAGE
// ================================

function buildHistoryMessage(item) {

    if (item.action === "BUG_CREATED") {

        return "Bug was created: " +
            (item.newValue || "");

    }


    if (item.action === "BUG_ASSIGNED") {

        return "Assigned to " +
            (item.newValue || "user");

    }


    if (item.action === "STATUS_CHANGED") {

        return (
            "Status changed from " +
            formatText(item.oldValue) +
            " to " +
            formatText(item.newValue)
        );

    }


    if (item.action === "PRIORITY_CHANGED") {

        return (
            "Priority changed from " +
            formatText(item.oldValue) +
            " to " +
            formatText(item.newValue)
        );

    }


    if (item.action === "BUG_UPDATED") {

        return "Bug information was updated.";

    }


    return item.newValue ||
        "Activity recorded.";

}


// ================================
// CLOSE TIMELINE
// ================================

if (closeTimelineModal) {

    closeTimelineModal.addEventListener(
        "click",
        closeTimeline
    );

}


function closeTimeline() {

    if (timelineModal) {
        timelineModal.classList.remove("show");
    }

}


// ================================
// SIDEBAR TIMELINE
// ================================

if (sidebarTimeline) {

    sidebarTimeline.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            if (bugs.length === 0) {

                showToast(
                    "No Bugs",
                    "There are no bugs available to view."
                );

                return;
            }


            const latestBug =
                bugs[0];


            viewBug(latestBug.id);

        }
    );

}


// ================================
// PRIORITY CLASS
// ================================

function getPriorityClass(priority) {

    if (priority === "CRITICAL") {
        return "priority-critical";
    }


    if (priority === "HIGH") {
        return "priority-high";
    }


    if (priority === "MEDIUM") {
        return "priority-medium";
    }


    return "priority-low";

}


// ================================
// STATUS CLASS
// ================================

function getStatusClass(status) {

    if (status === "OPEN") {
        return "status-open";
    }


    if (status === "IN_PROGRESS") {
        return "status-progress";
    }


    if (status === "RESOLVED") {
        return "status-resolved";
    }


    return "status-resolved";

}


// ================================
// FORMAT TEXT
// ================================

function formatText(value) {

    if (!value) {
        return "";
    }


    return String(value)
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, function (letter) {
            return letter.toUpperCase();
        });

}


// ================================
// FORMAT DATE
// ================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Date unavailable";
    }


    try {

        const date =
            new Date(dateValue);


        if (isNaN(date.getTime())) {
            return String(dateValue);
        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }
    catch (error) {

        return String(dateValue);

    }

}


// ================================
// UPDATE STATISTICS
// ================================

function updateStatistics() {

    if (totalBugs) {

        totalBugs.textContent =
            bugs.length;

    }


    if (openBugs) {

        openBugs.textContent =
            bugs.filter(function (bug) {

                return bug.status === "OPEN";

            }).length;

    }


    if (progressBugs) {

        progressBugs.textContent =
            bugs.filter(function (bug) {

                return bug.status === "IN_PROGRESS";

            }).length;

    }


    if (resolvedBugs) {

        resolvedBugs.textContent =
            bugs.filter(function (bug) {

                return bug.status === "RESOLVED";

            }).length;

    }

}


// ================================
// SEARCH
// ================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            renderBugs();

        }
    );

}


// ================================
// STATUS FILTER
// ================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        function () {

            renderBugs();

        }
    );

}


// ================================
// PRIORITY FILTER
// ================================

if (priorityFilter) {

    priorityFilter.addEventListener(
        "change",
        function () {

            renderBugs();

        }
    );

}


// ================================
// REFRESH
// ================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        async function () {

            refreshButton.disabled = true;

            refreshButton.textContent =
                "↻ Loading...";


            await loadBugs();


            refreshButton.disabled = false;

            refreshButton.textContent =
                "↻ Refresh";


            showToast(
                "Refreshed",
                "Bug list has been refreshed."
            );

        }
    );

}


// ================================
// TOAST
// ================================

function showToast(title, message) {

    if (!toast || !toastTitle || !toastMessage) {
        return;
    }


    toastTitle.textContent =
        title;


    toastMessage.textContent =
        message;


    toast.classList.add("show");


    setTimeout(function () {

        toast.classList.remove("show");

    }, 3000);

}


// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ================================
// INITIAL LOAD
// ================================

loadBugs();
