using API.DTOs;
using API.DTOs.EmployeeDto;
using API.DTOs.RefTable;
using API.Helpers;
using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Servivces
{
    public interface IRefTableService
    {
        Task<int> AddRefTableAsync(RefTableDto refTableDto);
        Task<int> UpdatRefTableAsync(RefTableDto refTableDto);
        Task<int> DeleteRefTableAsync(int id);
        Task<RefTableDto> GetRefTableByIdAsync(int refId, string refType, string refSubType);
        Task<IEnumerable<RefTableDto>> GetRefTableAsync();
        Task<RefTableDtoListObj> GetRefTableByRefTypeAndSubTypeAsync(PaginationParams paginationParams, string refType, string refSubType);
        Task<EmployeeDetailsWithHistoryDtoObj> GetRefTableByFilterAsync(PaginationParams paginationParams, int tenentId, int university, int contractType, int departmentFrom, int departmentTo, int position, int serviceType, int periodFrom, int periodTo);
        Task<EmployeeDetailsWithHistoryDtoObj> GetEmployeeTransactionHistoryByFilter(PaginationParams paginationParams, int tenentId, int university, int contractType, int departmentFrom, int departmentTo, int occupation, int servicesType, int serviceSubType, int services, int periodFrom, int periodTo);
       Task<EmployeeDetailsWithHistoryDtoObj> Get_DetailEmployee_History(PaginationParams paginationParams, int tenentId, int university, int contractType, int departmentFrom, int departmentTo, int occupation, int servicesType, int sTypeList, int serviceSubType, int services, int periodFrom, int periodTo);
      Task<EmployeeDetailsWithHistoryDtoObj> GetRefTableByFilterForReportAsync(PaginationParams paginationParams, int tenentId, int university, int contractType, int departmentFrom, int departmentTo, int position, int serviceType, int periodFrom, int periodTo);
      Task<EmployeeDetailsWithHistoryDtoObj> GetRefTableByFilterForCertificateAsync(PaginationParams paginationParams, int tenentId, int university, int contractType, int employeeIdFrom, int employeeIdTo, int departmentFrom, int departmentTo, int occupation, int periodFrom, int periodTo);
      Task<EmployeeLedgerDtoObj> GetEmployeeLoanStatement(int tenentId, int university, int employeeName);
    }
}
