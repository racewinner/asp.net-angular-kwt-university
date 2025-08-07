using API.DTOs;
using API.Helpers;
using API.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Servivces.Interfaces
{
    public interface IDashBoardService
    {
        Task<DashBoardModel> GetDashBoardData(int TenantId);

    }
    
}
