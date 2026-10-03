
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblLogin
    {
        public long Id { get; set; }
        public Nullable<long> User_Id { get; set; }
        public string CNIC { get; set; }
        public string User_Name { get; set; }
        public Nullable<long> Password { get; set; }
        public string Compnay_Name { get; set; }
        public string Address { get; set; }
        public Nullable<System.DateTime> Date { get; set; }
        public string Role { get; set; }
    }
}
