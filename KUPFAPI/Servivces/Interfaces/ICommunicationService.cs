using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Servivces.Interfaces
{
    public interface ICommunicationService
    {
        Task<IEnumerable<TransactionHddm>> GetDocumentAttachmentsByMyTransId(int myTransId);
        Task<List<TransactionHddm>> UpdateDocumentAttachments(DocumentAttachmentsDto docAttachesDto);
        Task<Boolean> AddIncomingLetter(LettersHdDto lettersHdDto);
        Task<Boolean> UpdateIncomingLetter(LettersHdDto lettersHdDto);
        Task<int> DeleteIncomingCommunication(int id);
        Task<ReturnSingleLettersHdDto> GetIncomingLetter(int id);
        Task<List<IncommingCommunicationDto>> GetIncomingLetters();
        Task<List<IncommingCommunicationDto>> GetOutgoingLetters();

        Task<ResultMDL> ImportArchieveData(ImportArchieveDataModel data);

    }
}
