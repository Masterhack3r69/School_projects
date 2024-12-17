

### **Updated Instructions for the Computer Laboratory System**

---

#### **Changes to the System**:

1. **Add New Models**:
   - **Computers**: 
     - Track individual computers in the laboratory.
     - Fields: `id`, `computer_name`, `lab_name`, `status` (available/in-use/under-maintenance), `createdAt`, `updatedAt`.
   - **Requests**:
     - Track student requests to use a computer.
     - Fields: `id`, `studentId`, `computerId`, `status` (pending/approved/rejected), `requestedAt`, `processedAt`.

---

2. **Update Backend Logic**:
   - **Inventory Updates**:
     - When a student request is approved, mark the requested computer's `status` as **in-use** in the `Computers` table.
     - When a student finishes using the computer, mark the `status` back to **available**.
   - **Endpoints for Requests**:
     - **POST /requests**: 
       - Allow students to request to use a computer.
     - **GET /requests** (for Teachers/Admins):
       - View all requests, filterable by student, computer, or status.
     - **PATCH /requests/:id/approve**:
       - Approve a student’s request, set the computer status to **in-use**.
     - **PATCH /requests/:id/reject**:
       - Reject a request, optionally with a reason.
     - **PATCH /requests/:id/complete**:
       - Mark the computer as **available** when the student completes their session.

---

3. **Frontend Changes**:
   - **Student Dashboard**:
     - Add a page for students to:
       - View a list of available computers by laboratory.
       - Submit a request to use a computer.
       - View the status of their past requests (pending/approved/rejected).
   - **Teacher/Admin Dashboard**:
     - Add a page to manage student requests:
       - Approve or reject requests.
       - View and filter logs of student activity per computer or laboratory.
     - Add inventory controls for computers, such as marking a computer as **under maintenance**.

---

4. **Logs Integration**:
   - Expand the existing `Logs` table to include computer usage:
     - Fields: `id`, `computerId`, `userId`, `operation` (check-in/check-out), `timestamp`.

---

#### **Example Workflow**:

1. **Student Requests a Computer**:
   - A student logs in, views available computers, and submits a request for a specific computer in a laboratory.
   - The request is stored in the `Requests` table with the status **pending**.

2. **Admin/Teacher Reviews the Request**:
   - A teacher or admin approves or rejects the request.
   - If approved:
     - The computer’s `status` is updated to **in-use**.
     - The request’s `status` is updated to **approved**, and the student is notified.

3. **Student Completes Their Session**:
   - The student checks out from the computer.
   - The computer’s `status` is updated to **available**.
   - A log entry is recorded for the session.

4. **Admin/Teacher Views Logs**:
   - Teachers/admins can view computer usage logs for auditing and reporting purposes.

---

#### **Action Steps for Implementation**:

1. **Modify Database**:
   - Create the `Computers` and `Requests` tables.
   - Update relationships between `Users`, `Requests`, and `Computers`.

2. **Update API Endpoints**:
   - Add endpoints for managing computers, requests, and logs.

3. **Frontend Adjustments**:
   - Update dashboards for students and teachers/admins.
   - Ensure seamless integration with the new request and approval workflows.
