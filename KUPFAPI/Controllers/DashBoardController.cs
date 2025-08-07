using API.DTOs;
using API.DTOs.DashboardDtos;
using API.Models;
using API.Servivces.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.Services.DelegatedAuthorization;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashBoardController : ControllerBase
    {
        private readonly IDashBoardService _dashBoardService;
        public IMapper _mapper { get; }
        private readonly KUPFDbContext _context;
        public DashBoardController(IDashBoardService dashBoardService, IMapper mapper, KUPFDbContext context)
        {
            _mapper = mapper;
            _dashBoardService = dashBoardService;
            _context = context;
        }

        #region Get Member Statistics
        [HttpGet]
        [Route("GetMemberStatistics")]

        public async Task<List<MemberStatisticsDto>> GetMemberStatistics(long periodCode, int tenentId, int locationId)
        {
            try
            {
                var data = (from e in _context.DetailedEmployees
                            join ap in _context.TransactionHddapprovalDetails
                            on e.EmployeeId equals ap.EmployeeId
                            join hd in _context.TransactionHds
                            on ap.Mytransid equals hd.Mytransid
                            join university in _context.Reftables
                            on e.LocationId equals university.Refid
                            where ap.TenentId == tenentId &&
                            e.TenentId == tenentId &&
                            e.LocationId == locationId &&
                            ap.LocationId == locationId &&
                            ap.Status == "ManagerApproval" &&
                            ap.SerApprovalId == 1 &&
                            ap.Active == true &&
                            university.Refsubtype == "University"
                            select new MemberStatisticsDto
                            {
                                EmployeeId = e.EmployeeId,
                                EnglishName = e.EnglishName,
                                ArabicName = e.ArabicName,
                                Department = e.DepartmentName,
                                University = university.Shortname
                            }).ToList();

                return data.Take(10).ToList();
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        #endregion

        [HttpGet]
        [Route("GetDashBoardData")]
        public async Task<DashBoardModel> GetDashBoardData(int tenentId, int locationId)
        {
            var result = await _dashBoardService.GetDashBoardData(tenentId);
            return  result;
        }

        #region
        [HttpGet]
        [Route("GetLatestSubscriber")]
        public async Task<List<DashboardSubscriberDto>> GetLatestSubscriber(int tenentId, int locationId)
        {
            var result = new List<DashboardSubscriberDto>();

            result = _context.DetailedEmployees.Where(e => e.TenentId == tenentId && e.LocationId == locationId && e.SubscribedDate != null)
                .OrderByDescending(e => e.SubscribedDate).Select(e => new DashboardSubscriberDto
                {
                    EnglishName = e.EnglishName,
                    ArabicName = e.ArabicName,
                    EmployeeId = e.EmployeeId,
                }).ToList();

            return result.Take(10).ToList();
        }

        #endregion

        #region
        [HttpGet]
        [Route("GetSubscriber")]
        public async Task<List<DashboardSubscriberDto>> GetSubscriber(int tenentId, int locationId, int type)
        {
            // type = 1 this month, 2 = this week, 3 = this day
            var result = new List<DashboardSubscriberDto>();

            if (type == 1)
            {
                result = _context.DetailedEmployees
                    .Where(e => e.TenentId == tenentId && e.LocationId == locationId && e.SubscribedDate != null && e.SubscribedDate.Value.Month == DateTime.Now.Month && e.SubscribedDate.Value.Year == DateTime.Now.Year)
                    .OrderByDescending(e => e.SubscribedDate)
                    .Select(e => new DashboardSubscriberDto
                    {
                        EnglishName = e.EnglishName,
                        ArabicName = e.ArabicName,
                        EmployeeId = e.EmployeeId,
                    })
                    .ToList();

                return result.Take(10).ToList();
            }
            if (type == 2)
            {
                DateTime today = DateTime.Today;
                int currentDayOfWeek = (int)today.DayOfWeek;
                DateTime startOfWeek = today.AddDays(-currentDayOfWeek);
                DateTime endOfWeek = startOfWeek.AddDays(6);

                result = _context.DetailedEmployees
                    .Where(e => e.TenentId == tenentId && e.LocationId == locationId && e.SubscribedDate != null &&
                                e.SubscribedDate >= startOfWeek && e.SubscribedDate <= endOfWeek)
                    .OrderByDescending(e => e.SubscribedDate)
                    .Select(e => new DashboardSubscriberDto
                    {
                        EnglishName = e.EnglishName,
                        ArabicName = e.ArabicName,
                        EmployeeId = e.EmployeeId,
                    })
                    .Take(10)
                    .ToList();

                return result;

            }
            if (type == 3)
            {
                result = _context.DetailedEmployees
                    .Where(e => e.TenentId == tenentId && e.LocationId == locationId && e.SubscribedDate != null && e.SubscribedDate.Value.Month == DateTime.Now.Month && e.SubscribedDate.Value.Year == DateTime.Now.Year && e.SubscribedDate.Value.Day == DateTime.Now.Day)
                    .OrderByDescending(e => e.SubscribedDate)
                    .Select(e => new DashboardSubscriberDto
                    {
                        EnglishName = e.EnglishName,
                        ArabicName = e.ArabicName,
                        EmployeeId = e.EmployeeId,
                    })
                    .ToList();

                return result.Take(10).ToList();
            }

            result = _context.DetailedEmployees.Where(e => e.TenentId == tenentId && e.LocationId == locationId)
                .OrderByDescending(e => e.SubscribedDate).Select(e => new DashboardSubscriberDto
                {
                    EnglishName = e.EnglishName,
                    ArabicName = e.ArabicName,
                    EmployeeId = e.EmployeeId,
                }).ToList();

            return result.Take(10).ToList();
        }

        #endregion

        private bool IsDateInCurrentWeek(DateTime date)
        {
            DateTime today = DateTime.Today;
            int currentDayOfWeek = (int)today.DayOfWeek;
            DateTime startOfWeek = today.AddDays(-currentDayOfWeek);
            DateTime endOfWeek = startOfWeek.AddDays(6);

            return date >= startOfWeek && date <= endOfWeek;
        }

        [HttpGet]
        [Route("ServicePercent")]

        public async Task<DashboardServiceSetupDto> GetServicePercent(int tenentId)
        {
            var model = new DashboardServiceSetupDto();

            var result = _context.TransactionHds
                .Where(a => a.TenentId == tenentId && a.PeriodBegin >= 202302)
                .Join(
                    _context.ServiceSetups,
                    a => new { a.TenentId, a.ServiceSubTypeId },
                    b => new { b.TenentId, ServiceSubTypeId = b.ServiceType },
                    (a, b) => new { a, b }
                )
                .GroupBy(joined => new { joined.a.TenentId, joined.a.LocationId, joined.b.ServiceShortName, joined.a.ServiceTypeId })
                .Select(group => new
                {
                    SerCount = group.Count(),
                    ServiceName = group.Key.ServiceShortName.Trim()
                })
                .ToList();


            int totalCount = result.Sum(a => a.SerCount);

            foreach(var item in result)
            {
                var PercentDto = new ServiceSetupPercentDto();

                PercentDto.Percent = (decimal)item.SerCount / totalCount * 100;
                PercentDto.ServiceName = item.ServiceName.Trim();
                PercentDto.Count = item.SerCount;

                model.Percents.Add(PercentDto);
            }

            int totalServiceTrans = _context.TransactionHds
                .Where(a => a.TenentId == tenentId && a.PeriodBegin >= 202302)
                .Select(a => a)  // You can change this to select specific columns if needed
                .Distinct()
                .Count();

            var totalTransactions = _context.TransactionHds
                .Where(a => a.TenentId == tenentId && a.PeriodBegin >= 202302)
                .GroupBy(a => new { a.TenentId, a.LocationId, a.PeriodBegin })
                .Select(group => new ServiceSetupGraphData
                {
                    PeriodCode = (int)group.Key.PeriodBegin,
                    Count = group.Count()
                })
                .Distinct()
                .ToList();

            foreach(var item in totalTransactions)
            {
                item.Percent = (decimal)item.Count / totalServiceTrans * 100;

                model.GraphDatas.Add(item);
            }

            return model;
        }

        [HttpGet]
        [Route("TotalEmployee")]

        public async Task<TotalEmployeeDto> GetTotalEmployee(int tenentId)
        {
            var model = new TotalEmployeeDto();

            var graphData = _context.DetailedEmployees
                .Where(e => e.Subscription_status == 1 && e.SubscribedDate != null)
                .GroupBy(e => new { Year = e.SubscribedDate.Value.Year, Month = e.SubscribedDate.Value.Month })
                .Select(group => new DashboardTotalEmployeeDto
                {
                    Count = group.Count(),
                    Year  = group.Key.Year,
                    Month = group.Key.Month,
                    PeriodCode = group.Key.Year.ToString() + group.Key.Month.ToString()
                })
                .OrderBy(result => result.Year)
                .ThenBy(result => result.Month)
                .ToList();

            int TotalEmployee = _context.DetailedEmployees.Where(e => e.Subscription_status == 1 && e.SubscriptionDate !=null).Count();

            model.totalEmployee = TotalEmployee;
            model.employeeGraph = graphData;

            return model;
        }

        [HttpGet]
        [Route("LoanVsReceive")]

        public async Task<LoanVSReceiveDto> GetLoanVsRecive(int tenentId)
        {
            LoanVSReceiveDto model = new LoanVSReceiveDto();

            var result = _context.TransactionHds
                .Where(hd => new List<int> { 2, 3, 4 }.Contains((int)hd.ServiceTypeId))
                .Join(
                    _context.TransactionDts,
                    hd => new { hd.TenentId, hd.Mytransid },
                    dt => new { dt.TenentId, dt.Mytransid },
                    (hd, dt) => new { HD = hd, DT = dt }
                )
                .Where(joined => joined.HD.TenentId == tenentId)
                .GroupBy(joined => 1)
                .Select(group => new
                {
                    LOANAMT = group.Sum(joined => joined.DT.InstallmentAmount),
                    RECEIVEDAMT = group.Sum(joined => joined.DT.ReceivedAmount)
                })
                .FirstOrDefault();

            var graphData = _context.TransactionHds
            .Where(hd => new List<int> { 2, 3, 4 }.Contains((int)hd.ServiceTypeId))
            .Join(
                _context.TransactionDts,
                hd => new { hd.TenentId, hd.Mytransid },
                dt => new { dt.TenentId, dt.Mytransid },
                (hd, dt) => new { HD = hd, DT = dt }
            )
            .Where(joined => joined.HD.TenentId == tenentId)
            .GroupBy(joined => joined.DT.PeriodCode)
            .Select(group => new LoanVSReceiveGraphData
            {
                PeriodCode = group.Key.ToString(),
                LoanAmt = (decimal)group.Sum(joined => joined.DT.InstallmentAmount),
                ReceivedAmt = (decimal)group.Sum(joined => joined.DT.ReceivedAmount)
            })
            .ToList();


            model.TotalLoanAmt = (decimal)result.LOANAMT;
            model.TotalReceivedAmt = (decimal)result.RECEIVEDAMT;
            model.graphData = graphData;

            return model;

        }

        [HttpGet]
        [Route("EmployeePerformance")]
        public async Task<EmployeePerformanceDto> GetEmployeePerformance(int tenentId)
        {
            EmployeePerformanceDto result = new EmployeePerformanceDto();

            result.Count = _context.UserMsts.Where(user => user.TenentId == tenentId && user.ActiveFlag == "Y").
                Select(user => user.LoginId).Distinct().OrderBy(loginId => loginId).ToList().Count();


            result.Employees = _context.UserMsts.Where(user => user.TenentId == tenentId && user.ActiveFlag == "Y").
                Select(user => new EmployeePerformance
                {
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    LoginId = user.LoginId
                }).OrderBy(user => user.FirstName).ToList();

            return result;
        }

        [HttpGet]
        [Route("EmployeePerformanceDetail")]
        public async Task<List<EmployeePerformanceDetail>> GetEmployeePerformanceDetail(int userId)
        {
            var result = new EmployeePerformanceDetail();

            var myDashboardItems = _context.MyDashboards
                .Where(item => new[] { 51, 52, 53, 54, 55, 56, 57, 58, 59, 60 }.Contains(item.MySeq))
                .OrderBy(item => item.AsOfDate)
                .ThenBy(item => item.MySeq)
                .Select(item => new EmployeePerformanceDetail
                {
                    AsOfDate = item.AsOfDate,
                    MyLabel1 = item.MyLabel2
               })
                .ToList();

            return myDashboardItems;
        }

        [HttpGet]
        [Route("NewSubscriber")]
        public async Task<int> GetNewSubscriber(int tenentId)
        {
            var currentDate = DateTime.Now;

            var result = _context.Tblperiods
                .Where(p => p.TenentId == 21 && p.PrdEndDate < currentDate)
                .OrderBy(p => p.PeriodCode)
                .Select(p => new
                {
                    p.PeriodCode,
                    p.PrdStartDate,
                    p.PrdEndDate
                })
                .FirstOrDefault();

            int periodCode = (int)result.PeriodCode;

            int count = 0;
            count = _context.TransactionHds.Where(x => x.ServiceType == "1" && x.PeriodBegin == periodCode).Count();

            return count;
        }

    }
}
