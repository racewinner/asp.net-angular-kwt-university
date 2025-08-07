using API.Common;
using API.DTOs;
using API.DTOs.Common.Enums;
using API.DTOs.EmployeeDto;
using API.Helpers;
using API.Models;
using API.Servivces.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection.Metadata;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Grpc.Core;
using Microsoft.TeamFoundation.Build.WebApi;

namespace API.Servivces.Implementation
{
    public class CommunicationService : ICommunicationService
    {
        private readonly KUPFDbContext _context;
        private readonly IMapper _mapper;
        private readonly string _fileUploadPath;

        public CommunicationService(KUPFDbContext context, IMapper mapper, IConfiguration _config)
        {
            _context = context;
            _mapper = mapper;
            _fileUploadPath = _config.GetSection("filePath").GetSection("fileuploadpath").Value;
        }

        public async Task<Boolean> AddIncomingLetter(LettersHdDto lettersHdDto)
        {
            int result = 0;
            try
            {
                if (_context != null)
                {
                    var attachId = _context.TransactionHddms.FromSqlRaw("select isnull(Max(AttachID+1),1) as attachId from  [TransactionHDDMS ] where TenentID='" + lettersHdDto.TenentId + "'").Select(p => p.AttachId).FirstOrDefault();
                    var serialNo = _context.TransactionHddms.FromSqlRaw("select isnull(Max(Serialno+1),1) as serialNo from  [TransactionHDDMS ] where tenentId='" + lettersHdDto.TenentId + "' and attachid=1").Select(c => c.Serialno).FirstOrDefault();
                    // Server Path for LetterAttachments.
                    // var serverPath = @"/kupf1/kupfapi.erp53.com/New/LetterAttachments/";
                    var serverPath = _fileUploadPath;
                    var lettersHd = _mapper.Map<LettersHd>(lettersHdDto);
                    var crupId = _context.CrupMsts.Max(c => c.CrupId);
                    var maxCrupId = crupId + 1;

                    lettersHd.Mytransid = CommonMethods.CreateMyTransId();
                    lettersHd.CrupId = maxCrupId;
                    lettersHd.Active = true;
                    lettersHd.Entrydate = DateTime.Now;
                    lettersHd.Entrytime = DateTime.Now;

                    _context.LettersHds.Add(lettersHd);
                    result = _context.SaveChanges();

                    // add documents
                    DocumentAttachmentsDto docAttachesDto = _mapper.Map<DocumentAttachmentsDto>(lettersHdDto);
                    docAttachesDto.Mytransid = lettersHd.Mytransid;
                    await UpdateDocumentAttachments(docAttachesDto);

                    #region Save Into CrupAudit
                    //
                    var auditInfo = _context.Reftables.FirstOrDefault(c => c.Reftype == "Audit" && c.Refsubtype == "Employee");
                    var mySerialNo = _context.TblAudits.Count() > 0 ? _context.TblAudits.Max(c => c.MySerial) + 1 : 1;
                    var auditNo = _context.Crupaudits.Max(c => c.AuditNo) + 1;
                    var crupAudit = new Crupaudit
                    {
                        TenantId = lettersHdDto.TenentId,
                        LocationId = (int)lettersHdDto.LocationId,
                        CrupId = maxCrupId,
                        MySerial = int.Parse(mySerialNo.ToString()),
                        AuditNo = auditNo,
                        AuditType = auditInfo.Shortname,
                        TableName = DbTableEnums.LettersHD.ToString(),
                        FieldName = $"",
                        OldValue = "Non",
                        NewValue = "Inserted",
                        CreatedDate = DateTime.Now,
                        CreatedUserName = lettersHdDto.Username,
                        UserId = Convert.ToInt32(lettersHdDto.Userid),
                        CrudType = CrudTypeEnums.Insert.ToString(),
                        Severity = SeverityEnums.Normal.ToString()
                    };
                    await _context.Crupaudits.AddAsync(crupAudit);
                    await _context.SaveChangesAsync();
                    #endregion
                }
               return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<TransactionHddm>> GetDocumentAttachmentsByMyTransId(int myTransId)
        {
            var transactionHddms = await _context.TransactionHddms.Where(t => t.Mytransid == myTransId).ToListAsync();
            var data = _mapper.Map<IEnumerable<TransactionHddm>>(transactionHddms);
            return data;
        }

        public async Task<List<TransactionHddm>> UpdateDocumentAttachments(DocumentAttachmentsDto docAttachesDto)
        {
            var attachId = 1;
            var query = "";
            var serialNo = 0;
            string uploadFolder = string.Format("{0}/{1}", _fileUploadPath, docAttachesDto.Mytransid);
            int[] newDocTypes = (int[])JsonConvert.DeserializeObject(docAttachesDto.NewDocumentTypes, typeof(int[]));
            long[] removedDocuments = (long[])JsonConvert.DeserializeObject(docAttachesDto.RemovedDocuments, typeof(long[]));

            try
            {
                // To update meta information of attach documents
                query = string.Format("update TransactionHDDMS set Remarks='{0}', Subject='{1}', MetaTags='{2}' where TenentID='{3}' and MYTRANSID='{4}'",
                                            docAttachesDto.AttachmentRemarks, docAttachesDto.Subject, docAttachesDto.MetaTags, docAttachesDto.TenentId, docAttachesDto.Mytransid);
                _context.Database.ExecuteSqlRaw(query);
                _context.SaveChanges();
             
                // To delete removed documents
                if(removedDocuments.Length > 0)
                {
                    var documentsToRemove = _context.TransactionHddms.Where(t => (t.TenentId == docAttachesDto.TenentId) && (t.Mytransid == docAttachesDto.Mytransid) &&  (removedDocuments.Contains(t.Serialno)) ).ToList();
                    foreach(var doc in documentsToRemove)
                    {
                        if (File.Exists(doc.AttachmentPath)) File.Delete(doc.AttachmentPath);
                    }
                    _context.TransactionHddms.RemoveRange(documentsToRemove);
                    _context.SaveChanges();
                }

                // To insert new documents
                int newDocumentCnt = newDocTypes.Count();
                if(newDocumentCnt > 0)
                {
                    // To get an refId of applicant photo document type
                    var applicantPhotoDoc = await _context.Reftables.Where(c => c.Refsubtype == "DocType" && c.TenentId == docAttachesDto.TenentId).FirstOrDefaultAsync();

                    // To get a new serialNo
                    query = string.Format("select isnull(Max(Serialno+1),1) as serialNo from  [TransactionHDDMS ] where tenentId='{0}' and MYTRANSID='{1}' and attachid={2}",
                                                docAttachesDto.TenentId, docAttachesDto.Mytransid, attachId);
                    serialNo = _context.TransactionHddms.FromSqlRaw(query).Select(c => c.Serialno).FirstOrDefault();

                    var attachmentsData = new TransactionHddm
                    {
                        TenentId = (int)docAttachesDto.TenentId,
                        Mytransid = docAttachesDto.Mytransid,
                        AttachId = (int)attachId,
                        Remarks = docAttachesDto.AttachmentRemarks,
                        Subject = docAttachesDto.Subject,
                        MetaTags = docAttachesDto.MetaTags,
                        Actived = true,
                        CrupId = 0,
                        CreatedBy = docAttachesDto.Userid,
                        CreatedDate = DateTime.Now,
                    };

                    for (int i = 0; i < newDocumentCnt; i++)
                    {
                        var newDocument = docAttachesDto.NewDocumentFiles[i];
                        string filePath = Utils.MoveUploadedFile(newDocument, uploadFolder);
                        attachmentsData.AttachmentPath = filePath;
                        attachmentsData.DocumentType = newDocTypes[i];
                        attachmentsData.AttachmentByName = newDocument.FileName;
                        attachmentsData.Serialno = serialNo++;

                        await _context.TransactionHddms.AddAsync(attachmentsData);
                        await _context.SaveChangesAsync();
                        _context.ChangeTracker.Clear();

                        if(applicantPhotoDoc != null && newDocTypes[i] == applicantPhotoDoc.Refid)
                        {
                            var employee = await _context.DetailedEmployees.Where(de => de.EmployeeId == docAttachesDto.EmployeeId).FirstOrDefaultAsync();
                            if(employee != null)
                            {
                                // To update employee information in database
                                employee.ImageUrl = string.Format("{0}/{1}", docAttachesDto.Mytransid, Path.GetFileName(filePath));
                                _context.Update(employee);
                                await _context.SaveChangesAsync();
                            }

                        }
                    }
                }

                // To get all documents for myTransId
                var documents = _context.TransactionHddms.Where(t => t.TenentId == docAttachesDto.TenentId && t.Mytransid == docAttachesDto.Mytransid).ToList();
                return documents;
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        public async Task<Boolean> UpdateIncomingLetter(LettersHdDto lettersHdDto)
        {
            string uploadFolder = _fileUploadPath;

            try { 
                if (_context != null)
                {
                    var crupId = _context.CrupMsts.Max(c => c.CrupId);
                    var maxCrupId = crupId + 1;

                    var existingLetterHd = _context.LettersHds.Where(c => c.Mytransid == lettersHdDto.Mytransid).FirstOrDefault();
                    if (existingLetterHd != null)
                    {
                        existingLetterHd.Updttime = DateTime.Now;
                        existingLetterHd.CrupId = maxCrupId;
                        _mapper.Map(lettersHdDto, existingLetterHd);
                        _context.LettersHds.Update(existingLetterHd);

                        // To deal with documents
                        DocumentAttachmentsDto docAttaches = _mapper.Map<DocumentAttachmentsDto>(lettersHdDto);
                        var result = await UpdateDocumentAttachments(docAttaches);

                        #region Save Into CrupAudit
                        var auditInfo = _context.Reftables.FirstOrDefault(c => c.Reftype == "Audit" && c.Refsubtype == "Employee");
                        var mySerialNo = _context.TblAudits.Count()>0? _context.TblAudits.Max(c => c.MySerial) + 1:1;
                        var auditNo = _context.Crupaudits.Count()>0? _context.Crupaudits.Max(c => c.AuditNo) + 1:1;
                        var crupAudit = new Crupaudit
                        {
                            TenantId = lettersHdDto.TenentId,
                            LocationId = (int)lettersHdDto.LocationId,
                            CrupId = maxCrupId,
                            MySerial = mySerialNo,
                            AuditNo = auditNo,
                            AuditType = auditInfo.Shortname,
                            TableName = DbTableEnums.LettersHD.ToString(),
                            FieldName = $"",
                            OldValue = "Non",
                            NewValue = "Updated",
                            CreatedDate = DateTime.Now,
                            CreatedUserName = lettersHdDto.Username,
                            UserId = Convert.ToInt32(lettersHdDto.Userid),
                            CrudType = CrudTypeEnums.Edit.ToString(),
                            Severity = SeverityEnums.Normal.ToString()
                        };
                        await _context.Crupaudits.AddAsync(crupAudit);
                        await _context.SaveChangesAsync();
                        #endregion
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<int> DeleteIncomingCommunication(int id)
        {
            int result = 0;

            if (_context != null)
            {
                var letterhd = await _context.LettersHds.FirstOrDefaultAsync(x => x.Mytransid == id);

                if (letterhd != null)
                {
                    _context.LettersHds.Remove(letterhd);

                    result = await _context.SaveChangesAsync();
                }
                return result;
            }
            return result;
        }

        public async Task<ResultMDL> ImportArchieveData(ImportArchieveDataModel data)
        {
            var result = new ResultMDL();
            var count = 0;
            try
            {
                if(_context != null)
                {
                    long mytransId = 0;
                    var crupSerialNo = 0;
                    var crupAuditNo = 0;
                    if (_context.Crupaudits.Count() > 0)
                    {
                        crupSerialNo = _context.Crupaudits.Max(c => c.MySerial);
                        crupAuditNo = _context.Crupaudits.Max(c => c.AuditNo);
                    }
                    if(_context.LettersHds.Count() > 0)
                    {
                        mytransId = _context.LettersHds.Max(l => l.Mytransid);
                    }

                    foreach (var row in data.importData)
                    {
                        mytransId++;
                        crupSerialNo++;
                        crupAuditNo++;

                        // To check whether or not the same data already exists
                        var l = await _context.LettersHds.FirstOrDefaultAsync(l => (l.SenderParty == row.From) && (l.SenderReceiverParty == row.To) && (l.LetterDated == row.Date) && (l.Description == row.Remarks));
                        if (l != null) continue;

                        var lettersHd = new Models.LettersHd
                        {
                            TenentId = data.TenantId,
                            LocationId = data.LocationId,
                            Mytransid = mytransId,
                            LetterType = row.DocumentType,
                            SenderParty = row.From,
                            LetterDated = row.Date,
                            SenderReceiverParty = row.To,
                            UserDocumentNo = row.Reference,
                            Description = row.Remarks,
                            InOutApprovedBy = row.AuthoritySigned,
                            FilledAt = row.FilledAt,
                            SearchTag = row.SearchTag,
                            CrupId = 0
                        };
                        await _context.LettersHds.AddAsync(lettersHd);
                        await _context.SaveChangesAsync();

                        #region Save Into CrupAudit
                        var crupAudit = new Crupaudit
                        {
                            TenantId = data.TenantId,
                            LocationId = data.LocationId,
                            CrupId = 0,
                            MySerial = crupSerialNo,
                            AuditNo = crupAuditNo,
                            TableName = string.Format("{0} by Import", DbTableEnums.LettersHD.ToString()),
                            FieldName = $"",
                            OldValue = "Non",
                            NewValue = "Inserted",
                            CreatedDate = DateTime.Now,
                            CreatedUserName = data.UserName,
                            UserId = Convert.ToInt32(data.UserId),
                            CrudType = CrudTypeEnums.Insert.ToString(),
                            Severity = SeverityEnums.High.ToString()
                        };
                        await _context.Crupaudits.AddAsync(crupAudit);
                        #endregion

                        count++;
                    }

                    result.Message = string.Format("{0} rows have been imported with success.", count);
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.Result = ex.HResult;
            }
            return result;
        }
        public async Task<ReturnSingleLettersHdDto> GetIncomingLetter(int id)
        {
            var lettersHd = await _context.LettersHds.Where(c => c.Mytransid == id).FirstOrDefaultAsync();
            var transactionHddms = await _context.TransactionHddms.Where(c => c.Mytransid == id).ToListAsync();
            //var hddms = _mapper.Map<List<TransactionHDDMSDto>>(transactionHddms);
            var data = new ReturnSingleLettersHdDto
            {
                LetterType = lettersHd.LetterType,
                Mytransid = lettersHd.Mytransid,
                TenentId = lettersHd.TenentId,
                LocationId = lettersHd.LocationId,
                LetterDated = lettersHd.LetterDated,
                SenderReceiverParty = lettersHd.SenderReceiverParty,
                FilledAt = lettersHd.FilledAt,
                EmployeeId = lettersHd.EmployeeId,
                Representative = lettersHd.Representative,
                ReceivedSentDate = lettersHd.ReceivedSentDate,
                Description = lettersHd.Description,
                SearchTag = lettersHd.SearchTag,
                UserDocumentNo = lettersHd.UserDocumentNo,
                InOutApprovedBy = lettersHd.InOutApprovedBy
            };
            //data.TransactionHDDMSDtos = hddms;
            List<TransactionHDDMSDto> list = new List<TransactionHDDMSDto>();

            foreach (var item in transactionHddms)
            {
                var hddms = new TransactionHDDMSDto()
                {
                    AttachId = item.AttachId,
                    Attachment = File.Exists(item.AttachmentPath)?CommonMethods.GetFileFromFolder(item.AttachmentPath):null,
                    AttachmentByName = item.AttachmentByName,
                    AttachmentPath = item.AttachmentPath,
                    DocumentType = item.DocumentType,
                    MetaTags = item.MetaTags,
                    Mytransid = item.Mytransid,
                    Remarks = item.Remarks,
                    Serialno = item.Serialno,
                    Subject = item.Subject,
                    TenentId = item.TenentId
                };
                list.Add(hddms);
            }
            data.TransactionHDDMSDtos = list;
            return data;
        }

        public Task<List<IncommingCommunicationDto>> GetIncomingLetters()
        {
            var result = (from r in _context.Reftables
                          join s in _context.LettersHds on r.Refid equals s.LetterType
                          join a in _context.Reftables on s.FilledAt equals a.Refid
                          where r.Refsubtype == "Communication" && a.Refsubtype == "Party"
                          && r.Reftype == "KUPF" && a.Reftype == "KUPF" && r.Refid == 1
                          select new IncommingCommunicationDto
                          {
                              searchtag = s.SearchTag,
                              description = s.Description,
                              filledat = a.Refname1,
                              letterdated = s.LetterDated.ToString(),
                              lettertype = r.Shortname,
                              mytransid = s.Mytransid,
                              UserDocumentNo = s.UserDocumentNo,
                             // approvedBy=s.approvedBy
                          }).ToListAsync();
            return result;
        }

        public Task<List<IncommingCommunicationDto>> GetOutgoingLetters()
        {
            var result = (from r in _context.Reftables
                          join s in _context.LettersHds on r.Refid equals s.LetterType
                          join a in _context.Reftables on s.FilledAt equals a.Refid
                          where r.Refsubtype == "Communication" && a.Refsubtype == "Party"
                          && r.Reftype == "KUPF" && a.Reftype == "KUPF" && r.Refid==2
                          select new IncommingCommunicationDto
                          {
                              searchtag = s.SearchTag,
                              description = s.Description,
                              filledat = a.Refname1,
                              letterdated = s.LetterDated.ToString(),
                              lettertype = r.Shortname,
                              mytransid = s.Mytransid,
                              UserDocumentNo = s.UserDocumentNo,
                             // approvedBy = s.approvedBy
                          }).ToListAsync();
            return result;
        }
    }
}
