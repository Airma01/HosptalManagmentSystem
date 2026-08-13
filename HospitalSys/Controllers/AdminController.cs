//Controller/AdminController
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Attributes;
using HospitalSys.Models.HospitalStruct;
using HospitalSys.Models.Pharmacy.Branch;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Pharmacy.CentralStore;
using HospitalSys.Models.Pharmacy.AidStore;
namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/[Controller]")]
    public class AdminController :ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context)
        {
            _context = context;
        }
        
        [HttpPost("CreateAd")] 
        
        public async Task<IActionResult> Create(AdminDto admin_dt)
        {
            if(string.IsNullOrWhiteSpace(admin_dt.username) || string.IsNullOrEmpty(admin_dt.Password) || admin_dt.AdminRole == null)
            {
                return BadRequest("Fields Are Empty");
            }
            var IsAdminFound = await _context.SuperAdmin.AnyAsync(u=>u.Username == admin_dt.username);
            if (IsAdminFound)
            {
                return BadRequest("Regsterd Admin Try Again");
            }
            string HashPass = BCrypt.Net.BCrypt.HashPassword(admin_dt.Password); 
            var admin = new SuperAdmins{
                Username = admin_dt.username,
                AdminRole = admin_dt.AdminRole,
                HashPassword = HashPass
            };
           await _context.SuperAdmin.AddAsync(admin);
           await _context.SaveChangesAsync();
            return Ok(new
            {
                Message = admin.Username + "created Successfuly",
                Role = "Admin"
            });
        }
        [HttpPost("add_role")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> AddRole([FromBody] RoleDto roleDto)
        {
            if (string.IsNullOrWhiteSpace(roleDto.RoleName))
                {
                    return BadRequest("Role Name Is Empity");
                }
            bool RoleIsFound = await _context.Roles.AnyAsync(r=>r.RoleName == roleDto.RoleName); 
            if(RoleIsFound == true)
            {
                return BadRequest("This Role Already registred");
            }
            try
            {
                var role = new Role
                {
                  RoleName = roleDto.RoleName  
                };
                await _context.Roles.AddAsync(role);
                await _context.SaveChangesAsync();
                return Ok("Role Added Succesfuly");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }

       [HttpPost("add_user")]
      [AuthorizeRole("Admin")]
public async Task<IActionResult> AddUser([FromBody] RegisterUserDto userDto)
{
    // Validate required fields
    if (string.IsNullOrEmpty(userDto.FirstName) ||
        string.IsNullOrEmpty(userDto.FatherName) ||
        string.IsNullOrEmpty(userDto.Username) ||
        string.IsNullOrEmpty(userDto.Password) ||
        string.IsNullOrEmpty(userDto.Phone))
    {
        return BadRequest("All required fields must be filled.");
    }

    if (await _context.Users.AnyAsync(u => u.Username == userDto.Username))
        return BadRequest("Username already taken.");

    // Validate roles
    if (userDto.RoleIDs == null || !userDto.RoleIDs.Any())
        return BadRequest("At least one role must be assigned.");

    var existingRoleIds = await _context.Roles
        .Where(r => userDto.RoleIDs.Contains(r.RoleID))
        .Select(r => r.RoleID)
        .ToListAsync();

    if (existingRoleIds.Count != userDto.RoleIDs.Count)
        return BadRequest("One or more roles are invalid.");

    try
    {
        var user = new Users
        {
            FirstName = userDto.FirstName,
            FatherName = userDto.FatherName,
            Username = userDto.Username,
            Email = userDto.Email,
            HashPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
            Phone = userDto.Phone
            // Gender and other fields if needed
        };

        using var transaction = await _context.Database.BeginTransactionAsync();

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync(); // user.UserID generated

       
        var userRoles = userDto.RoleIDs.Select(roleId => new UserRole
        {
            UserID = user.UserID,
            RoleID = roleId
        });
        await _context.UserRoles.AddRangeAsync(userRoles);
        await _context.SaveChangesAsync();

        await transaction.CommitAsync();

        return Ok("User added successfully with roles.");
    }
    catch (Exception ex)
    {
        // Log exception
        return StatusCode(500, "Internal server error.");
    }
}
        [HttpPost("add_clinical_department")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> AddClinicalDepartment([FromBody] RegClinicalDepDto ClinicDto)
        {
            if (string.IsNullOrWhiteSpace(ClinicDto.DepartmentName))
            {
                return BadRequest("Department Name Required");
            }
            bool IsFound= await _context.ClinicalDepartments.AnyAsync(cl=>cl.DepartmentName == ClinicDto.DepartmentName);
            if (IsFound)
            {
                return BadRequest("This Clinical Department Is Already Registrated");
            }
            try
            {
                var clinic = new ClinicalDepartment
                {
                    DepartmentName = ClinicDto.DepartmentName,
                    Description = ClinicDto.Description
                };
                await _context.ClinicalDepartments.AddAsync(clinic);
                await _context.SaveChangesAsync();
                return Ok("Department Added Successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }

        public async Task<bool> FindNurse(int UserID)
        {
            bool isFound = await _context.Nurses
            .Where(u=>u.UserID==UserID)
             .AnyAsync();
            if(isFound)
            {
                return true;
            }
            else
            {
               return false; 
            }
            
        }
        public async Task<bool> FindDoctor(int UserID)
        {
            bool isFound = await _context.Doctors
            .Where(u=>u.UserID==UserID)
             .AnyAsync();
            if(isFound)
            {
                return true;
            }
            else
            {
               return false; 
            }
            
        }
        public async Task<bool> FindPharmacist(int UserID)
        {
            bool isFound = await _context.Pharmacists
            .Where(u=>u.UserID==UserID)
             .AnyAsync();
            if(isFound)
            {
                return true;
            }
            else
            {
               return false; 
            }
            
        }
        public async Task<bool> FindCashier(int UserID)
        {
            bool isFound = await _context.Cashiers
            .Where(u=>u.UserID==UserID)
             .AnyAsync();
            if(isFound)
            {
                return true;
            }
            else
            {
               return false; 
            }
            
        }
        public async Task<bool> FindReceptionist(int UserID)
        {
            bool isFound = await _context.Receptionists
            .Where(u=>u.UserID==UserID)
             .AnyAsync();
            if(isFound)
            {
                return true;
            }
            else
            {
               return false; 
            }
            
        }
    

        [HttpPost("add_doctor")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> AddDoctor([FromBody] RegisterDoctorDto DoctorDto)
        {
            if(string.IsNullOrWhiteSpace(DoctorDto.UserID.ToString()) || string.IsNullOrWhiteSpace(DoctorDto.ClinicalDepartmentID.ToString()))
            {
                return BadRequest("Fields Are Required");
            }
            if(FindNurse(DoctorDto.UserID).Result)
            {
                return BadRequest("This User Is Already Registred As Nurse");
            }
            if(FindDoctor(DoctorDto.UserID).Result)
            {
                return BadRequest("This User Is Already Registred As Doctor");
            }
            try
            {  
                var user = await _context.Users
                           .Include(u => u.UserRole)
                           .ThenInclude(ur => ur.Role)
                           .FirstOrDefaultAsync(u => u.UserID == DoctorDto.UserID);
                if(user.UserRole.All(r => r.Role.RoleName != "Doctor"))
                {
                    return BadRequest("This User Is Not Assigned The Doctor Role");
                }
                var doctor = new Doctor
                {
                    UserID = DoctorDto.UserID,
                    ClinicalDepartmentID = DoctorDto.ClinicalDepartmentID,
                    LicenseNumber = DoctorDto.LicenseNumber
                };
                await _context.Doctors.AddAsync(doctor);
                await _context.SaveChangesAsync();
                return Ok("Doctor Registrated Successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }
        
        [HttpPost("add_select_user_doctor_role/{DepartmentID}")]
        public async Task<IActionResult> AddSelectedDoctorForDepartment(int DepartmentID,[FromBody] SelectedDoctorsDto selectedDoctorsDto)
        {
            if(DepartmentID == 0)
            {
                return BadRequest("Department ID Is Required");
            }
        
            try
            {
            var doctor = new SelectedDoctorsDto
            {
                UserIDs = selectedDoctorsDto.UserIDs
            };
            await _context.Doctors.AddRangeAsync(doctor.UserIDs.Select(id => new Doctor
            {
                UserID = id,
                ClinicalDepartmentID = DepartmentID, // or some default value
                LicenseNumber = "" // or some default value
            }));
            await _context.SaveChangesAsync();
            return Ok("Selected Doctors Added Successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
           
        }
        [HttpGet("get_unassigned_doctors")]
        public async Task<IActionResult> GetUnassignedDoctors()
        {
            try
            {
                var unassignedDoctors = await _context.Users
                    .Include(u => u.UserRole)
                    .ThenInclude(ur => ur.Role)
                    .Where(u => u.UserRole.Any(ur => ur.Role.RoleName == "Doctor") && !u.Doctor.Any())
                    .Select(u => new
                    {
                        u.UserID,
                        u.FirstName,
                        u.FatherName,
                        u.Username,
                        Roles = u.UserRole.Select(ur => ur.Role.RoleName).ToList()
                    })
                    .ToListAsync();

                return Ok(unassignedDoctors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message); 
            }
            
        }
        [HttpGet("get_doctor_for_department/{DepartmentID}")]
        public async Task<IActionResult> GetDoctorForDepartment(int DepartmentID)
        {
            if(DepartmentID == 0)
            {
                return BadRequest("Department ID Is Required");
            }
            var doctors = await _context.Doctors
            .Where(d => d.ClinicalDepartmentID == DepartmentID)
            .Include(d => d.Users)
            .ThenInclude(u => u.UserRole)
            .ThenInclude(ur => ur.Role)
            .Select(d => new DoctorDto
            {
                Id = d.UserID,
                doctorID = d.DoctorID,
                Username = d.Users.Username,
                FullName = d.Users.FirstName + " " + d.Users.FatherName,
                Email = d.Users.Email,
                Phone = d.Users.Phone,
                Roles = d.Users.UserRole.Select(ur => ur.Role.RoleName).ToList()
            })
            .ToListAsync();

            return Ok(doctors);
        }
        [HttpDelete("remove_doctor_from_department/{doctorId}")]
        public async Task<IActionResult> RemoveDoctorFromDepartment(int doctorId)
        {
            var doctor = await _context.Doctors.FindAsync(doctorId);
            if (doctor == null)
            {
                return NotFound("Doctor not found.");
            }

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return Ok("Doctor removed from department successfully.");
        }
        [HttpGet("department/{id}")]
        public async Task<IActionResult> GetDepartmentById(int id)
        {
            var department = await _context.ClinicalDepartments
                .FirstOrDefaultAsync(d => d.ClinicalDepartmentID == id);
            if (department == null)
                return NotFound();

            return Ok(new {
                clinicalDepartmentID = department.ClinicalDepartmentID,
                departmentName = department.DepartmentName,
                description = department.Description
            });
        }
        [HttpPost("add_all_role_doctor")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> AddAllRoleDoctor()
        {
            
            var doctor = await _context.Users
                             .Include(u => u.UserRole)
                             .ThenInclude(ur => ur.Role)
                             .Include(u=>u.Doctor)
                .FirstOrDefaultAsync(u => u.UserRole.Any(ur => ur.Role.RoleName == "Doctor" && !u.Doctor.Any()));
            if (doctor == null)
            {
                return NotFound("Doctor role not found.");
            }

            var usersWithoutDoctorRole = await _context.Users
                .Where(u => !u.UserRole.Any(ur => ur.Role.RoleName == "Doctor"))
                .ToListAsync();

            foreach (var docRole in doctor.UserRole.Where(ur => ur.Role.RoleName == "Doctor"))
            {
                var doc = new Doctor
                {
                    // UserID = doctor.UserID,
                    // ClinicalDepartmentID = "", // Set to null or a default value if needed
                    // LicenseNumber = null // Set to null or a default value if needed
                };
                
                await _context.Doctors.AddAsync(doc);
            }

            await _context.SaveChangesAsync();
            return Ok("All users have been assigned the Doctor role.");
        }
        [HttpPost("add_pharmacist")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> AddPharmacist([FromBody] RegisterPharmacistDto PharmacistDto)
        {
            try
            {
                var pharmacist = new Pharmacist
                {
                    UserID = PharmacistDto.UserID,
                    BranchPharmacyID = PharmacistDto.BranchPharmacyID
                };
                await _context.Pharmacists.AddAsync(pharmacist);
                await _context.SaveChangesAsync();
                return Ok("Pharmacist added successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }

      [HttpGet("get_unadded_cs_manager")]
public async Task<IActionResult> GetUnaddedCSManger()
{
    var unassigned = await _context.MainPharmacyManagers
        .Include(m => m.Users)
        .Where(m => m.Users.UserRole.Any(ur => ur.Role.RoleName == "CSM")
                    && !_context.CentralStoreManagers.Any(csm => csm.ManagerID == m.ManagerID)) // <- compare with ManagerID
        .Select(m => new
        {
            m.ManagerID, // <- the PRIMARY KEY of MainPharmacyManagers
            m.UserID,    // <- still useful for display
            FullName = m.Users.FirstName + " " + m.Users.FatherName,
            m.Users.Username
        })
        .ToListAsync();

    return Ok(unassigned);
}
        [HttpPost("add_pharmacy_manager")]
        [AuthorizeRole("Admin")]
         public async Task<IActionResult> AddMainPhramacyManager([FromBody] RegisterMainPharmacyMangerDto PharmacyMangerDto)
        {
            try
            {
                var manager = new MainPharmacyManager
                {
                    UserID = PharmacyMangerDto.UserID
                };
                
                await _context.MainPharmacyManagers.AddAsync(manager);
                await _context.SaveChangesAsync();
                return Ok("Phramcy manager Registered Successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }
      [HttpPost("add_manager_to_central")]
[AuthorizeRole("Admin")]
public async Task<IActionResult> AddCentralPharmacyManager([FromBody] RegisterCentralStoreManagerDto dto)
{
    try
    {
        // 1. Check if manager exists in MainPharmacyManagers
        var managerExists = await _context.MainPharmacyManagers
            .AnyAsync(m => m.ManagerID == dto.ManagerID);
        // if (!managerExists)
        //     return BadRequest("Manager is not registered as a main pharmacy manager. Please register them first.");

        // 2. Check if central pharmacy exists
        var pharmacyExists = await _context.CentralStorePharmacies
            .AnyAsync(p => p.CentralPharmacyID == dto.CentralPharmacyID);
        if (!pharmacyExists)
            return BadRequest("Central pharmacy not found.");

        // 3. Check for duplicate assignment
        var alreadyAssigned = await _context.CentralStoreManagers
            .AnyAsync(csm => csm.ManagerID == dto.ManagerID 
                            && csm.CentralPharmacyID == dto.CentralPharmacyID);
        if (alreadyAssigned)
            return BadRequest("Manager already assigned to this pharmacy.");

        // 4. Create assignment
        var assignment = new CentralStoreManager
        {
            CentralPharmacyID = dto.CentralPharmacyID,
            ManagerID = dto.ManagerID,
            IsCurrent = dto.IsCurrent,
            IsActive = true // if needed
        };
        _context.CentralStoreManagers.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Manager assigned successfully." });
    }
    catch (Exception ex)
    {
        var inner = ex.InnerException?.Message ?? ex.Message;
        return StatusCode(500, new { message = "An error occurred.", error = inner });
    }
}
        [AuthorizeRole("Admin")]

      [HttpGet("get_unassigned_main_pharmacy_manager")]
        public async Task<IActionResult> GetUnassignedMainPharmacyManager()
        {
            try
            {
                // Get all users with role "CSM" who are NOT assigned to any central pharmacy manager
                var unassignedManagers = await _context.Users
                    .Include(u => u.UserRole)
                        .ThenInclude(ur => ur.Role)
                    .Where(u => u.UserRole.Any(ur => ur.Role.RoleName == "CSM")
                                && !_context.CentralStoreManagers.Any(csm => csm.ManagerID == u.UserID))
                    .Select(u => new
                    {
                        u.UserID,
                        u.FirstName,
                        u.FatherName,
                        u.Username,
                        Roles = u.UserRole.Select(ur => ur.Role.RoleName).ToList()
                    })
                    .ToListAsync();

                return Ok(unassignedManagers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet("get_central_pharmacy_managers/{centralPharmacyId}")]
public async Task<IActionResult> GetCentralPharmacyManagers(int centralPharmacyId)
{
    try
    {
        var managers = await _context.CentralStoreManagers
            .Include(csm => csm.MainPharmacyManager)
                .ThenInclude(mpm => mpm.Users)
            .Where(csm => csm.CentralPharmacyID == centralPharmacyId)
            .Select(csm => new
            {
                csm.CentralStoreManagerID,
                ManagerID = csm.ManagerID,
                FullName = csm.MainPharmacyManager.Users.FirstName + " " + csm.MainPharmacyManager.Users.FatherName,
                csm.IsCurrent
            })
            .ToListAsync();
        return Ok(managers);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}
        [HttpPost("add_manager_to_aid")]
        [AuthorizeRole("Admin")]
       public async Task<IActionResult> AddAidPharmacyManager([FromBody] RegisterAidStoreManagerDto AidStoreManagerDto)
        {
            try
            {
                var aidStoreManager = new AidStoreManager
                {
                    AidPharmacyID = AidStoreManagerDto.AidPharmacyID,
                    ManagerID = AidStoreManagerDto.ManagerID,
                    IsCurrent = AidStoreManagerDto.IsCurrent
                };
                await _context.AidStoreManagers.AddAsync(aidStoreManager);
                await _context.SaveChangesAsync();
                return Ok("Mangers Added Successfully To Central Store");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }

        [HttpPost("add_nurse")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> AddNurse([FromBody] RegisterNurseDto NurseDto)
        {
            try
            {
                var nurse = new Nurse
                {
                    UserID = NurseDto.UserID,
                    ClinicalDepartmentID = NurseDto.ClinicalDepartmentID
                };
                await _context.Nurses.AddAsync(nurse);
                await _context.SaveChangesAsync();
                return Ok("Nurse Registered Successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }
        [HttpPost("add_cashier")]
        [AuthorizeRole("Admin")]
         public async Task<IActionResult> AddCashier([FromBody] RegisterCashierDto CashierDto)
        {
            try
            {
                var cashier = new Cashier
                {
                  UserID =CashierDto.UserID  
                };
                await _context.Cashiers.AddAsync(cashier);
                await _context.SaveChangesAsync();
                return Ok("Cashier Registrated Successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }
        [HttpPost("add_receptionist")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> AddReceptionist([FromBody] RegisterReceptionistDto ReceptionistDto)
        {
            try
            {
                var receptionist = new Receptionist
                {
                    UserID = ReceptionistDto.UserID
                };
                await _context.Receptionists.AddAsync(receptionist);
                await _context.SaveChangesAsync();
                return Ok("Receptionist Regstrated Successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }

        [HttpPost("add_new_branch_pharamacy")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> CreateNewBranchPharmacy([FromBody] CreateNewBranchDto NewBranchDto)
        {
            if (string.IsNullOrWhiteSpace(NewBranchDto.BranchName))
            {
                return BadRequest("Fields Are Required");
            }
            bool IsFound = await _context.BranchPharmacies.AnyAsync(branch => branch.BranchName == NewBranchDto.BranchName);
            if (IsFound)
            {
                return BadRequest("This Branch Name Had been Registred");
            }
            try
            {
                var newBranch = new BranchPharmacy
                {
                    BranchName = NewBranchDto.BranchName,
                    Location = NewBranchDto.Location
                };
                await _context.BranchPharmacies.AddAsync(newBranch);
                await _context.SaveChangesAsync();
               return Ok("Branch Created Successfully"); 
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }
        [HttpPost("register_new_medicine")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> RegisterNewMedicine([FromBody] RegisterMedicineDto MedicineDto)
        {
            if(string.IsNullOrWhiteSpace(MedicineDto.MedicineName) 
            ||string.IsNullOrWhiteSpace(MedicineDto.GenericName) 
            ||string.IsNullOrWhiteSpace(MedicineDto.UnitPrice.ToString())
            || string.IsNullOrWhiteSpace(MedicineDto.UnitOfMeasure))
            {
                return BadRequest("Fields Are Required");
            }
            try
            {
                var medicine = new Medicine
                {
                    MedicineName = MedicineDto.MedicineName,
                    GenericName = MedicineDto.GenericName,
                    UnitPrice = MedicineDto.UnitPrice,
                    UnitOfMeasure = MedicineDto.UnitOfMeasure  
                };
                await _context.Medicines.AddAsync(medicine);
                await _context.SaveChangesAsync();
             return Ok("Medicine Registerd Successfully");   
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }

    [HttpPost("add_to_central_inventory")]
    [AuthorizeRole("Admin")]
    public async Task<IActionResult> AddToCentralStoreInventory([FromBody] AddToCentralInventoryDto CentralInventoryDto)
    {
        if(string.IsNullOrWhiteSpace(CentralInventoryDto.CentralPharmacyID.ToString()) 
        ||string.IsNullOrWhiteSpace(CentralInventoryDto.MedicineID.ToString()) 
        ||string.IsNullOrWhiteSpace(CentralInventoryDto.QuantityAvailable.ToString())
        || string.IsNullOrWhiteSpace(CentralInventoryDto.ExpiryDate.ToString()))
        {
            return BadRequest("Fields Are Required");
        }
        try
        {
            // Convert to UTC if it's not already UTC
            var expiryDate = CentralInventoryDto.ExpiryDate;
            if (expiryDate.Kind != DateTimeKind.Utc)
            {
                expiryDate = DateTime.SpecifyKind(expiryDate, DateTimeKind.Utc);
            }

            var centralInventory = new CentralStoreInventory
            {
                CentralPharmacyID = CentralInventoryDto.CentralPharmacyID,
                MedicineID = CentralInventoryDto.MedicineID,
                QuantityAvailable = CentralInventoryDto.QuantityAvailable,
                ExpiryDate = expiryDate, // Use the UTC version
                BatchNumber = CentralInventoryDto.BatchNumber
            };
            await _context.CentralStoreInventories.AddAsync(centralInventory);
            await _context.SaveChangesAsync();
            return Ok("Medicine Added To Central Store Inventory");   
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("add_to_aid_inventory")]
    [AuthorizeRole("Admin")]
    public async Task<IActionResult> AddToAidStoreInventory([FromBody] AddToAidInventoryDto AidInventoryDto)
    {
        if(string.IsNullOrWhiteSpace(AidInventoryDto.AidPharmacyID.ToString()) 
        ||string.IsNullOrWhiteSpace(AidInventoryDto.MedicineID.ToString()) 
        ||string.IsNullOrWhiteSpace(AidInventoryDto.QuantityAvailable.ToString())
        || string.IsNullOrWhiteSpace(AidInventoryDto.ExpiryDate.ToString()))
        {
            return BadRequest("Fields Are Required");
        }
        try
        {
            // Convert to UTC if it's not already UTC
            var expiryDate = AidInventoryDto.ExpiryDate;
            if (expiryDate.Kind != DateTimeKind.Utc)
            {
                expiryDate = DateTime.SpecifyKind(expiryDate, DateTimeKind.Utc);
            }

            var aidInventory = new AidStoreInventory
            {
                AidPharmacyID = AidInventoryDto.AidPharmacyID,
                MedicineID = AidInventoryDto.MedicineID,
                QuantityAvailable = AidInventoryDto.QuantityAvailable,
                ExpiryDate = expiryDate, // Use the UTC version
                BatchNumber = AidInventoryDto.BatchNumber
            };
            await _context.AidStoreInventories.AddAsync(aidInventory);
            await _context.SaveChangesAsync();
            return Ok("Medicine Added To Aid Store Inventory");   
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

        [HttpPost("create_main_central_pharmacy")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> CreateMainCentralPharmacy([FromBody] CreateCentralPharmacyDto CentralPharmacyDto)
        {
            if(string.IsNullOrWhiteSpace(CentralPharmacyDto.Name))
            {
                return BadRequest("Fields Are Required");
            }
            try
            {
                var centralDto = new CentralStorePharmacy
                {
                  Name = CentralPharmacyDto.Name,
                  Location = CentralPharmacyDto.Location,
                };
                await _context.CentralStorePharmacies.AddAsync(centralDto);
                await _context.SaveChangesAsync();
             return Ok("Main Central Pharmacy Created Successfully");   
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }
        [HttpPost("create_main_aid_pharmacy")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> CreateMainAidPharmacy([FromBody] CreateAidPharmacyDto AidPharmacyDto)
        {
            try
            {
                var aidPharmacy = new AidStorePharmacy
                {
                    Name = AidPharmacyDto.Name,
                    Location = AidPharmacyDto.Location,
                    
                };
                await _context.AidStorePharmacies.AddAsync(aidPharmacy);
                await _context.SaveChangesAsync();
             return Ok("Main Aid Pharmacy Created Successfully");   
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }

       // GET: Hospital/Admin/get_doc/{doctorId}
    [HttpGet("get_doc/{doctorId}")]
    public async Task<IActionResult> GetDoctorInfo(int doctorId)
    {
        try
        {
            var doc = await _context.Doctors
                            .Include(u=>u.Users)
                            .Where(u=>u.DoctorID == doctorId)
                            .Select(u => new
                            {
                                u.DoctorID,
                                u.LicenseNumber,
                                u.ClinicalDepartmentID,
                                DepartmentName = u.ClinicalDepartment != null ? u.ClinicalDepartment.DepartmentName : "",
                                User = u.Users != null ?new
                                {
                                 u.Users.FirstName,
                                 u.Users.FatherName
                                }:null
                            
                            })
                            .FirstOrDefaultAsync();
            return Ok(doc);
        }
        catch (Exception)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while processing your request." });
        }
    }
    
    [HttpGet("get_nurse_info/{nurseID}")]
    public async Task<IActionResult> GetNurseInfo(int nurseID)
        {
            try
            {
                var getNurse = await _context.Nurses
                                    .Include(u=>u.Users)
                                    .Include(u=>u.ClinicalDepartment)
                                    .Where(u=>u.NurseID == nurseID)
                                    .Select(u => new
                                    {
                                        u.NurseID,
                                        u.ClinicalDepartmentID,
                                        User = u.Users != null ? new
                                        {
                                            u.Users.FirstName,
                                            u.Users.FatherName,
                                            u.Users.Email,
                                            u.Users.Phone
                                        } :null,
                                        DepartmentName = u.ClinicalDepartment !=null ? u.ClinicalDepartment.DepartmentName : "",
                                    })
                                    .FirstOrDefaultAsync();
                                    
                return Ok(getNurse);
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request." });
                
            }
        }
        

     [HttpGet("get_all_user")]
public async Task<IActionResult> GetAllUsers()
{
    try
    {
        var users = await _context.Users
            .Include(u => u.UserRole)
            .ThenInclude(ur => ur.Role)
            .Where(u => u.UserRole.Any())
            .Select(u => new
            {
                u.UserID,
                u.FirstName,
                u.FatherName,
                u.Email,
                u.Phone,
                u.Username,
                // Return an array of role names
                Roles = u.UserRole.Select(ur => ur.Role.RoleName).ToList()
            })
            .ToListAsync();

        return Ok(users);
    }
    catch (Exception)
    {
        return StatusCode(500, new { success = false, message = "An error occurred while processing your request." });
    }
}

        [HttpGet("get_all_clinical_departments")]
        public async Task<IActionResult> GetClinicalDepartment()
        {
            try
            {
                
                var getAllClinic = await _context.ClinicalDepartments
                                        .Select(u => new
                                        {
                                            u.ClinicalDepartmentID,
                                            u.DepartmentName,
                                            u.Description
                                        })
                                        .ToListAsync();

                return Ok(getAllClinic);
            }
            catch (Exception)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request." });
                throw;
            }
        }

        // Get all roles
[HttpGet("get_all_roles")]
public async Task<IActionResult> GetAllRoles()
{
    try
    {
        var roles = await _context.Roles
            .Select(r => new { r.RoleID, r.RoleName })
            .ToListAsync();
        return Ok(roles);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}

// Get all medicines
[HttpGet("get_all_medicines")]
public async Task<IActionResult> GetAllMedicines()
{
    try
    {
        var medicines = await _context.Medicines
            .Select(m => new { m.MedicineID, m.MedicineName, m.GenericName })
            .ToListAsync();
        return Ok(medicines);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}

// Get all branch pharmacies
[HttpGet("get_all_branch_pharmacies")]
public async Task<IActionResult> GetAllBranchPharmacies()
{
    try
    {
        var branches = await _context.BranchPharmacies
            .Select(b => new { b.BranchPharmacyID, b.BranchName, b.Location })
            .ToListAsync();
        return Ok(branches);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}

// Get all central pharmacies
[HttpGet("get_all_central_pharmacies")]
public async Task<IActionResult> GetAllCentralPharmacies()
{
    try
    {
        var central = await _context.CentralStorePharmacies
            .Select(c => new { c.CentralPharmacyID, c.Name, c.Location })
            .ToListAsync();
        return Ok(central);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}

// Get all aid pharmacies
[HttpGet("get_all_aid_pharmacies")]
public async Task<IActionResult> GetAllAidPharmacies()
{
    try
    {
        var aid = await _context.AidStorePharmacies
            .Select(a => new { a.AidPharmacyID, a.Name, a.Location })
            .ToListAsync();
        return Ok(aid);
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
}


[HttpGet("Get_Stock/{storeID}")]
public async Task<IActionResult> GetCentralInventory(int storeID)
{
    try
    {
        var getCentralInventoryStore = await _context.CentralStoreInventories
                                             .Include(inv => inv.Medicine)
                                             .Include(inv=> inv.CentralStorePharmacy)
                                             .Where(inv => inv.CentralPharmacyID == storeID)
                                             .Select(inv => new{
                                                inv.CentralInventoryID,
                                                inv.QuantityAvailable,
                                                inv.ExpiryDate,
                                                inv.BatchNumber,
                                                Medicine = inv.Medicine != null ? new {
                                                    inv.Medicine.MedicineID,
                                                    inv.Medicine.MedicineName,
                                                    inv.Medicine.GenericName,
                                                    inv.Medicine.UnitPrice,
                                                    inv.Medicine.UnitOfMeasure
                                                }:null,
                                                Store = inv.CentralStorePharmacy != null ? new
                                                {
                                                    inv.CentralStorePharmacy.CentralPharmacyID,
                                                    inv.CentralStorePharmacy.Name
                                                }:null
                                             })
                                             .ToListAsync();

        return Ok(getCentralInventoryStore);
    }
    catch (System.Exception)
    {
        
        throw;
    }
}

[HttpGet("get_all_doctors")]
public async Task<IActionResult> GetAllDoctors()
{
    try
    {
        var doctors = await _context.Doctors
            .Include(u => u.Users)
            //    .ThenInclude(u=>u.Role)
            .Select(u => new
            {
                u.Users.UserID,
                u.Users.FirstName,
                u.Users.FatherName,
                u.Users.Email,
                u.Users.Phone,
                u.Users.Username,
                // Role = u.Users.Role.RoleName
            })
            .ToListAsync();
        return Ok(doctors);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { success = false, message = ex.Message });
    }
}

[HttpGet("get_all_nurses")]
public async Task<IActionResult> GetAllNurses()
{
    try
    {
        var nurses = await _context.Nurses
            .Include(u => u.Users)
            //    .ThenInclude(u=>u.Role)
            .Select(u => new
            {
                u.Users.UserID,
                u.Users.FirstName,
                u.Users.FatherName,
                u.Users.Email,
                u.Users.Phone,
                u.Users.Username,
                // u.Users.Role.RoleName
            })
            .ToListAsync();
        return Ok(nurses);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { success = false, message = ex.Message });
    }
}
[HttpPost("create_triage_department")]
public async Task<IActionResult> CreateTriageDepartment([FromBody] CreateTriageDepartmentDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.DepartmentName))
        return BadRequest(new { message = "Department name is required." });

    var dept = new TriageDepartment
    {
        DepartmentName = dto.DepartmentName,
        Description = dto.Description
    };

    await _context.TriageDepartments.AddAsync(dept);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Created", id = dept.TriageDepartmentID });
}
        }
}