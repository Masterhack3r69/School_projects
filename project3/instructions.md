### **Instruction Prompt for Cursor AI**  

#### **Update the Registration System**  
1. Ensure only **students** can register.  
   - **Admin and Teacher accounts cannot register** via the registration form.  
   - Remove or disable the option for specifying roles during registration.  

2. Update the **student registration process** with these fields:  
   - **First Name** (required)  
   - **Last Name** (required)  
   - **Middle Initial** (optional)  
   - **Course** (required)  
   - **School ID**:  
     - Must follow the format `C-20XX-XXXX` (e.g., `C-2023-1234`).  
     - **Rules for School ID**:  
       - Starts with `C-`.  
       - Includes a year (`2022` or later).  
       - Ends with a 4-digit random number.  
     - If the input does not match the format, registration should fail with a clear error message.  

3. **Validation Rules**:  
   - Registration is denied if the school ID does not follow the specified format.  
   - Validate the school ID both on the frontend (client-side) and backend (server-side).  

---

#### **Update the Admin Features**  

1. **Admin/Teacher Accounts**:  
   - Admin and teacher accounts cannot be registered through the student registration process.  
   - Admin accounts must only be created by a **super-admin** or through a dedicated admin management section.

2. **Admin Controls for Student Updates**:  
   - Add functionality for admin/teacher accounts to:  
     - View the list of all registered students.  
     - Update student details (name, course, and school ID).  
     - Ensure that the **school ID format is enforced** when admins update student records.  
   - Allow admins to delete student accounts if necessary.  

3. **Access Restriction**:  
   - Only admin accounts can access student data for updates.  
   - Ensure student registration is separate and inaccessible to admin users.  

