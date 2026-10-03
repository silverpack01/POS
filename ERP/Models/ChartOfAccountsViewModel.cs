using System.Collections.Generic;

namespace ERPSolution.Models
{
    public class ChartOfAccountsViewModel
    {
        public List<TblHead> Heads { get; set; }
        public List<TblSubHead> SubHeads { get; set; }
        public List<TblSubSubHead> SubSubHeads { get; set; }
        public List<TblSubSubSubHead> SubSubSubHeads { get; set; }
        public List<Tbl_RegisterAccounts> Accounts { get; set; }
    }
}
