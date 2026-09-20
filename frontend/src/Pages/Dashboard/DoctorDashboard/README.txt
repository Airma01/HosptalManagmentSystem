Doctor shell files with department-based visibility.

Copy into: frontend/src/Pages/Dashboard/DoctorDashboard/

Requires utils (place in frontend/src/utils/):
  - canWriteAdultMedicalCare.js
  - canWriteMaternalChildHealth.js  (already in project)
  - canAccessConsultation.js
  - getAuthenticatedUser.js         (already in project)

DoctorLayout.jsx  - unchanged (layout shell only)
DoctorHeader.jsx  - unchanged (shows department + logout)
DoctorDashboard.jsx - hides Consultation / Adult / MCH cards based on department
DoctorSidebar.jsx   - hides Clinical Care nav items based on department
