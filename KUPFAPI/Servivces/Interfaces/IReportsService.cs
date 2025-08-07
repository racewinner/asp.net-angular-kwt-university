using API.DTOs;
using API.DTOs.EmployeeDto;
using API.Helpers;
using API.Models;
using System.Threading.Tasks;

namespace API.Servivces.Interfaces
{
    public interface IReportsService
    {
        Task<VoucherDetailReport> GetVoucherDetailsReport(ReportInputModel reportInputModel);
        Task<byte[]> GenerateSubscribersMembersReport(EmployeeDetailsWithHistoryDtoObj obj);
        Task<byte[]> GenerateAssemblyReport(EmployeeDetailsWithHistoryDtoObj obj);
        Task<byte[]> GenerateEmployeeLoansStatementsReport(EmployeeLedgerDtoObj obj, DetailedEmployeeDto employeeDto);
        Task<byte[]> GenerateLoansDeducationReport(EmployeeDetailsWithHistoryDtoObj obj);
        Task<byte[]> GenerateSubscribeDeducationReport(EmployeeDetailsWithHistoryDtoObj obj);
        Task<byte[]> GenerateCertificatesReport(PaginationParams paginationParams, int tenentId, int university, int contractType, int employeeIdFrom, int employeeIdTo, int departmentFrom, int departmentTo, int occupation, int periodFrom, int periodTo, int indexEmployee,DetailedEmployeeDto detailedEmployee);


    }
}
