using API.DTOs;
using API.Models;
using API.Servivces.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CommunicationController : ControllerBase
    {
        private readonly ICommunicationService _communicationService;
        private readonly string fileDownloadPath;

        public CommunicationController(ICommunicationService communicationService, IConfiguration _config)
        {
            _communicationService = communicationService;
            fileDownloadPath = _config.GetSection("filePath").GetSection("filedownloadpath").Value;
        }

        [HttpGet]
        [Route("GetDocumentAttachmentsByMyTransId/{myTransId}")]
        public async Task<IEnumerable<TransactionHddm>> GetDocumentAttachmentsByMyTransId(int myTransId)
        {
            var result = await _communicationService.GetDocumentAttachmentsByMyTransId(myTransId);
            return result;
        }

        [HttpPut]
        [Route("UpdateDocumentAttachmentService")]
        public async Task<ActionResult<List<TransactionHddm>>> UpsertDocumentAttachmentService([FromForm] DocumentAttachmentsDto documentAttachmentsDto)
        {
            var result = await _communicationService.UpdateDocumentAttachments(documentAttachmentsDto);
            return Ok(result);
        }

        [HttpPost]
        [Route("AddIncomingLetter")]
        public async Task<ActionResult<Boolean>> AddIncomingLetter([FromForm]LettersHdDto lettersHdDto)
        {
            var result = await _communicationService.AddIncomingLetter(lettersHdDto);
            return Ok(result);
        }

        [HttpPut]
        [Route("UpdateIncomingLetter")]
        public async Task<ActionResult<Boolean>> UpdateIncomingLetter([FromForm] LettersHdDto lettersHdDto)
        {
            var result = await _communicationService.UpdateIncomingLetter(lettersHdDto);
            return Ok(result);
        } 

        [HttpDelete]
        [Route("DeleteIncomingLetter/{id}")]
        public async Task<int> DeleteIncomingLetter(int id)
        {
            int result = 0;
            if (id != 0)
            {
                result = await _communicationService.DeleteIncomingCommunication(id);
            }
            return result;
        }

        [HttpGet]
        [Route("GetIncomingLetter/{id}")]
        public async Task<ActionResult<ReturnSingleLettersHdDto>> GetIncomingLetter(int id)
        {
            var result = await _communicationService.GetIncomingLetter(id);
            return Ok(result);
        }

        [HttpGet]
        [Route("GetIncomingLetters")]
        public async Task<ActionResult<IEnumerable<IncommingCommunicationDto>>> GetIncomingLetters()
        {
            var result = await _communicationService.GetIncomingLetters();
            return Ok(result);
        }
        [HttpGet]
        [Route("GetOutgoingLetters")]
        public async Task<ActionResult<IEnumerable<IncommingCommunicationDto>>> GetOutgoingLetters()
        {
            var result = await _communicationService.GetOutgoingLetters();
            return Ok(result);
        }

        [HttpPost]
        [Route("ImportArchieveData")]
        public async Task<ResultMDL> ImportArchieveData([FromBody] ImportArchieveDataModel data)
        {
            // To write exception data into json file.
            var filePath = Path.Combine(fileDownloadPath, "archieve_data_exception.json");
            API.Helpers.Utils.WriteJsonToFile(data.ExceptionData, filePath);

            var result = new ResultMDL();
            result = await _communicationService.ImportArchieveData(data);
            return result;
        }

        [HttpGet]
        [Route("GetArchieveExceptionData")]
        public async Task<string> GetArchieveExceptionData()
        {
            var filePath = Path.Combine(fileDownloadPath, "archieve_data_exception.json");
            return API.Helpers.Utils.ReadJsonFromFile(filePath);
        }
    }
}