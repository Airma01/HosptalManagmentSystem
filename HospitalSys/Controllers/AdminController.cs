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
        public async Task<IActionResult> AddUser([FromBody] RegisterUserDto UserDto)
        {
            if(string.IsNullOrEmpty(UserDto.FirstName) || string.IsNullOrEmpty(UserDto.FatherName) || string.IsNullOrEmpty(UserDto.Username) || string.IsNullOrEmpty(UserDto.Password) || string.IsNullOrEmpty(UserDto.Phone))
            {
                return BadRequest("All Field Are Required");
            }
            bool IsUsernameFound = await _context.Users.AnyAsync(u => u.Username == UserDto.Username);
            // bool IsEmailFound = await _context.Users.AnyAsync(u => u.Email == UserDto.Email);
            if (IsUsernameFound)
            {
                return BadRequest("This Username Have been Registrated insert new UserName");
            }
            // if(IsEmailFound)
            // {
            //     return BadRequest("this email have been registrated");
            // }
            
            try
            {
                string HashPass = BCrypt.Net.BCrypt.HashPassword(UserDto.Password);
                var User = new Users
                {
                  FirstName = UserDto.FirstName,
                  FatherName = UserDto.FatherName,
                  Username = UserDto.Username,
                  Email = UserDto.Email,
                  HashPassword = HashPass,
                  RoleID = UserDto.RoleID,
                  Phone = UserDto.Phone
                };
                await _context.Users.AddAsync(User);
                await _context.SaveChangesAsync();
                return Ok("User Added Successfuly");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
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
        
        [HttpPost("add_doctor")]
        [AuthorizeRole("Admin")]
        public async Task<IActionResult> AddDoctor([FromBody] RegisterDoctorDto DoctorDto)
        {
            if(string.IsNullOrWhiteSpace(DoctorDto.UserID.ToString()) || string.IsNullOrWhiteSpace(DoctorDto.ClinicalDepartmentID.ToString()))
            {
                return BadRequest("Fields Are Required");
            }
            try
            {  
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
         public async Task<IActionResult> AddCentralPhramacyManager([FromBody] RegisterCentralStoreManagerDto CentralStoreManagerDto)
        {
            try
            {
                var centralStoreManager = new CentralStoreManager
                {
                    CentralPharmacyID = CentralStoreManagerDto.CentralPharmacyID,
                    ManagerID = CentralStoreManagerDto.ManagerID,
                    IsCurrent = CentralStoreManagerDto.IsCurrent
                };
                await _context.CentralStoreManagers.AddAsync(centralStoreManager);
                await _context.SaveChangesAsync();
                return Ok("Mangers Added Successfully To Central Store");
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
            }
        }

         public async Task<IActionResult> AddAidPharmacyManager([FromBody] RegisterAidStoreManagerDto AidStoreManagerDto)
        {
            try
            {
                var AidStoreManager = new AidStoreManager
                {
                    AidPharmacyID = AidStoreManagerDto.AidPharmacyID,
                    ManagerID = AidStoreManagerDto.ManagerID,
                    IsCurrent = AidStoreManagerDto.IsCurrent
                };
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
                var centralInventory = new CentralStoreInventory
                {
                  CentralPharmacyID = CentralInventoryDto.CentralPharmacyID,
                  MedicineID = CentralInventoryDto.MedicineID,
                  QuantityAvailable = CentralInventoryDto.QuantityAvailable,
                  ExpiryDate = CentralInventoryDto.ExpiryDate,
                  BatchNumber = CentralInventoryDto.BatchNumber
                };
                await _context.CentralStoreInventories.AddAsync(centralInventory);
                await _context.SaveChangesAsync();
             return Ok("Medicine Added To Central Store Inventory");   
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
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
                var aidInventory = new AidStoreInventory
                {
                    AidPharmacyID = AidInventoryDto.AidPharmacyID,
                    MedicineID = AidInventoryDto.MedicineID,
                    QuantityAvailable = AidInventoryDto.QuantityAvailable,
                    ExpiryDate = AidInventoryDto.ExpiryDate,
                    BatchNumber = AidInventoryDto.BatchNumber
                };
             return Ok("Medicine Added To Aid Store Inventory");   
            }
            catch (Exception ex)
            {
                return StatusCode(500,ex.Message);
                throw;
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
                            u.Users.FirstName,
                            u.Users.FatherName
                            // DepartmentName = u.ClinicalDepartment != null ? u.ClinicalDepartment.DepartmentName : ""
                            // User = u.Users != null ?new
                            // {
                                
                            // }:null
                           
                        })
                        .FirstOrDefaultAsync();
        return Ok(doc);
    }
    catch (Exception)
    {
        return StatusCode(500, new { success = false, message = "An error occurred while processing your request." });
    }
}
    }
}