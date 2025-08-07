using Microsoft.AspNetCore.Http;
using System;
using System.Reflection.Metadata;

namespace API.DTOs
{
    public class DocumentAttachmentsDto
    {
        public int TenentId { get; set; }
        public long Mytransid { get; set; }
        public int? EmployeeId { get; set; }
        public string Userid { get; set; }
        public string Subject { get; set; }
        public string MetaTags { get; set; }
        public string AttachmentRemarks { get; set; }
        public string NewDocumentTypes { get; set; }
        public string RemovedDocuments { get; set; }            // array of serialno of removed documents
        public IFormFile[] NewDocumentFiles { get; set; }
    }

    public class DocumentAttachmentDto {
        public int DocType { get; set; }
        public IFormFile Document { get; set; }
    }
}