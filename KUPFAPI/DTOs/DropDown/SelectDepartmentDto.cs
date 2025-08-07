using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class SelectDepartmentDto
    {
        public int Refid { get; set; }
        public string Shortname { get; set; }
        public string Refname1 { get; set; }
        public string Refname2 { get; set; }
    }
}
