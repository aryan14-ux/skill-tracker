export function buildStudentRegistrationPayload(formData) {
  return {
    email: formData.email.trim(),
    password: formData.password,
    role: 'student',
    full_name: formData.fullName.trim(),
    roll_no: formData.usn.trim(),
    phone: formData.phone.trim(),
    department: formData.department,
    semester: Number(formData.semester),
    cgpa: Number(formData.cgpa),
    backlogs: Number(formData.activeBacklogs)
  };
}
