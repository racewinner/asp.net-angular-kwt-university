using API.DTOs.EmployeeDto;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;

namespace API.DTOs
{
    public class SelectLetterTypeDTo
    {
        public int refId { get; set; }
        public string shortName { get; set; }
    }


    public class SelectPartyTypeDTo
    {
        public int refId { get; set; }
        public string refname1 { get; set; }
        public string refname2 { get; set; }
    }


    public class IncommingCommunicationDto
    {
        public long? mytransid { get; set; }
        public string? searchtag { get; set; }
        public string? description { get; set; }
        public string? filledat { get; set; }
        public string? lettertype { get; set; }
        public string? letterdated { get; set; }

        public string? UserDocumentNo { get; set; }
        public string? approvedBy { get; set; }
    }
    public class SelectFilledTypeDTo
    {
        public int refId { get; set; }
        public string shortName { get; set; }
    }

    public class ImportArchieveModel
    {
        public DateTime? Date { get; set; }
        public int DocumentType { get; set; }
        public string? DocumentTypeStr { get; set; }
        public int From { get; set; }
        public string? FromStr { get; set; }
        public int To { get; set; }
        public string? ToStr { get; set; }
        public string? Reference { get; set; }
        public string? Remarks { get; set; }
        public string? AuthoritySigned { get; set; }
        public int FilledAt { get; set; }
        public string? SearchTag { get; set; }
    }
    public class ImportArchieveDataModel
    {
        public int TenantId { get; set; }
        public int LocationId { get; set; }
        public string UserName { get; set; }
        public int UserId { get; set; }
        public List<ImportArchieveModel> importData { get; set; }
        public List<ImportArchieveModel> ExceptionData { get; set; }
    }

}
