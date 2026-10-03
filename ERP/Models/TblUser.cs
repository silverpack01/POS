
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblUser
    {
        public long Id { get; set; }
        public Nullable<long> Code { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string CNIC { get; set; }
        public string Address { get; set; }
        public string Date { get; set; }
        public Nullable<int> Status { get; set; }
        public Nullable<long> ProcessId { get; set; }
        public string ProcessName { get; set; }
    }
}
