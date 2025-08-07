using API.Common;
using API.DTOs;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Numerics;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace API.Helpers
{
    public static class Utils
    {
        public static int GetLastPeriodCode(int period_code)
        {
            int year = period_code / 100;
            int month = period_code % 100;
            DateTime dt = new DateTime(year, month, 15);
            DateTime lastMonth = dt.AddMonths(-1);
            int result = lastMonth.Year * 100 + lastMonth.Month;
            return result;
        }

        public static int GetNextPeriodCode(int period_code)
        {
            int year = period_code / 100;
            int month = period_code % 100;
            DateTime dt = new DateTime(year, month, 15);
            DateTime lastMonth = dt.AddMonths(1);
            int result = lastMonth.Year * 100 + lastMonth.Month;
            return result;
        }

        public static void WriteJsonToFile(object jsonData, string filePath)
        {
            var jsonString = JsonSerializer.Serialize(jsonData);
            File.WriteAllText(filePath, jsonString);
        }

        public static string ReadJsonFromFile(string filePath)
        {
            if (File.Exists(filePath) == false) return "";
            string fileContent = File.ReadAllText(filePath);
            return fileContent;
        }

        public static string MoveUploadedFile(IFormFile file, string uploadFolder)
        {
            if(!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            string fileExtension = Path.GetExtension(file.FileName);
            string newFileName = Md5Hash(file.FileName + "_" + CommonMethods.GenerateFileName()) + fileExtension;
            string filePath = Path.Combine(uploadFolder, newFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return filePath;
        }

        public static string Md5Hash(string input)
        {
            using (MD5 md5 = MD5.Create())
            {
                byte[] inputBytes = Encoding.UTF8.GetBytes(input);
                byte[] hashBytes = md5.ComputeHash(inputBytes);
                string hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

                return hash;
            }
        }
    }
}
