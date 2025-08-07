using API.Common;
using API.DTOs;
using API.DTOs.EmployeeDto;
using API.Helpers;
using API.Models;
using API.Servivces;
using API.Servivces.Implementation.DetailedEmployee;
using API.Servivces.Interfaces;
using API.Servivces.Interfaces.DetailedEmployee;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.TeamFoundation.Build.WebApi;
using Microsoft.TeamFoundation.TestManagement.WebApi;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing.Printing;
using System.IO;
using System.Threading.Tasks;

namespace API.Controllers
{
    //   [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IRefTableService _refTableService;
        private readonly IDetailedEmployeeService _detailedEmployeeService;

        private readonly IReportsService _reportsService;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public ReportsController(IRefTableService refTableService, IReportsService reportsService, IWebHostEnvironment webHostEnvironment, IDetailedEmployeeService detailedEmployeeService)
        {
            _reportsService = reportsService;
            _refTableService = refTableService;
            _webHostEnvironment = webHostEnvironment;
            _detailedEmployeeService = detailedEmployeeService;
        }


        [HttpPost]
        [Route("GetVoucherReport")]
        public async Task<ActionResult<VoucherDetailReport>> GetVoucherDetailsReport(ReportInputModel reportInputModel)
        {
            var response = await _reportsService.GetVoucherDetailsReport(reportInputModel);
            return response;
        }




        [HttpGet("GenerateLoansDeducationReport")]
        public async Task<IActionResult> GenerateLoansDeducationReport([FromQuery] PaginationParams paginationParams, int tenentId, int university, int contractType, int departmentFrom, int departmentTo, int occupation, int servicesType, int serviceSubType, int services, int periodFrom, int periodTo)
        {
            /*   PaginationParams pagingParams = new()
               {
                   PageNumber = 1,
                   PageSize = 4000
               };*/
            var result = await _refTableService.GetEmployeeTransactionHistoryByFilter(paginationParams, tenentId, university, contractType, departmentFrom, departmentTo, occupation, servicesType, serviceSubType, serviceSubType, periodFrom, periodTo);

            byte[] pdfBytes = await _reportsService.GenerateLoansDeducationReport(result);

            string fileName = $"LoansDeducation_{DateTime.Now:dd-MM-yyyy}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

    [HttpGet("GenerateEmployeeLoansStatementsReport")]
        public async Task<IActionResult> GenerateEmployeeLoansStatementsReport(int employeeId)
        {

            var result = await _refTableService.GetEmployeeLoanStatement(employeeId,1,12);
            var employeeDetail = await _detailedEmployeeService.GetEmployeeByIdAsync(12);
                
            byte[] pdfBytes = await _reportsService.GenerateEmployeeLoansStatementsReport(result, employeeDetail);

            string fileName = $"EmployeeLoansStatements_{DateTime.Now:dd-MM-yyyy}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

        [HttpGet("GenerateSubscribersMembersReport")]
        public async Task<IActionResult> GenerateSubscribersMembersReport([FromQuery] PaginationParams paginationParams, int tenentId, int university, int contractType, int departmentFrom, int departmentTo, int occupation, int servicesType, int sTypeList, int serviceSubType, int services, int periodFrom, int periodTo)
        {
            
            var result = await _refTableService.Get_DetailEmployee_History(paginationParams, tenentId, university, contractType, departmentFrom, departmentTo, occupation, servicesType, sTypeList, serviceSubType, services, periodFrom, periodTo);

            byte[] pdfBytes = await _reportsService.GenerateSubscribersMembersReport(result);

            string fileName = $"SubscribersMembers_{DateTime.Now:dd-MM-yyyy}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

        [HttpGet("GenerateAssemblyReport")]
        public async Task<IActionResult> GenerateAssemblyReport([FromQuery] PaginationParams paginationParams, int tenentId, int university, int contractType, int departmentFrom, int departmentTo, int occupation, int servicesType, int sTypeList, int serviceSubType, int services, int periodFrom, int periodTo)
        {
            //*

            var result = await _refTableService.Get_DetailEmployee_History(paginationParams, tenentId, university, contractType, departmentFrom, departmentTo, occupation, servicesType, sTypeList, serviceSubType, services, periodFrom, periodTo);
            //var result = await _refTableService.GetRefTableByFilterForReportAsync(offset, pageSize, tenentId, university, contractType, departmentFrom, departmentTo, position, serviceType, periodFrom, periodTo);


            byte[] pdfBytes = await _reportsService.GenerateAssemblyReport(result);

            string fileName = $"AssemblyReport_{DateTime.Now:dd-MM-yyyy}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

        [HttpGet("GenerateSubscribeDeducationReport")]
        public async Task<IActionResult> GenerateSubscribeDeducationReport([FromQuery] PaginationParams paginationParams, int tenentId, int university, int contractType, int departmentFrom, int departmentTo, int occupation, int servicesType, int serviceSubType, int services, int periodFrom, int periodTo)
        {

            var result = await _refTableService.GetEmployeeTransactionHistoryByFilter(paginationParams, tenentId, university, contractType, departmentFrom, departmentTo, occupation, servicesType, serviceSubType, serviceSubType, periodFrom, periodTo);

            byte[] pdfBytes = await _reportsService.GenerateSubscribeDeducationReport(result);

            string fileName = $"SubscribeDeducation_{DateTime.Now:dd-MM-yyyy}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }


        [HttpGet("GenerateCertificatesReport")]
        public async Task<IActionResult> GenerateCertificatesReport([FromQuery] PaginationParams paginationParams, int tenentId, int university, int contractType, int employeeIdFrom, int employeeIdTo, int departmentFrom, int departmentTo, int occupation, int periodFrom, int periodTo,int indexEmployee, int selectedEmployeeFromId)
        {
            var detailedEmployeeDto = await _detailedEmployeeService.GetEmployeeByIdAsync(selectedEmployeeFromId);
            byte[] pdfBytes = await _reportsService.GenerateCertificatesReport(paginationParams, tenentId, university, contractType, employeeIdFrom, employeeIdTo, departmentFrom, departmentTo, occupation, periodFrom, periodTo, indexEmployee, detailedEmployeeDto);

            string fileName = $"Certificate_{DateTime.Now:dd-MM-yyyy}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

       


    }


}


