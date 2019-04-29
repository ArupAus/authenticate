using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace testauth0
{
    public partial class _Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

            string config = Request.QueryString["config"];
            if (config != null)
            {
                hello.Text += config;
            }




            WebRequest req = WebRequest.Create("https://portal-staging.arup.digital/graphql");

            req.Method = "POST";
            req.ContentType = "application/json";
            req.Headers.Add(HttpRequestHeader.Authorization, "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9UTXhNVEZGUVVORE56TXpRakZFTkVKRk9UbENNakUwUlVVNU1rTkVSRVJET1RFeE16TkNNQSJ9.eyJodHRwOi8vYXV0aHouYXJ1cC5kaWdpdGFsL2F1dGhvcml6YXRpb24iOnsiZ3JvdXBzIjpbIkJIV1AiLCJQT1JUQUwiXSwicm9sZXMiOltdLCJwZXJtaXNzaW9ucyI6W119LCJodHRwOi8vdXNlcm1ldGEuYXJ1cC5kaWdpdGFsL3VzZXJfbWV0YWRhdGEiOnsiZGF0YWJhc2VfYWNjZXNzIjoiYXJ1cCJ9LCJpc3MiOiJodHRwczovL2FydXBkaWdpdGFsLmF1LmF1dGgwLmNvbS8iLCJzdWIiOiJ3YWFkfGlYblQ5ZFhUeVVpTl9pem5zSlFBM3J0eW1UZGJ4Xy1ySnVIM2J4VEdreUEiLCJhdWQiOiJoNDdSaW1yUnUwWUdhRTBBWFhNSjJyc3FZN25zVXY1QSIsImlhdCI6MTU1NjQzOTYwOSwiZXhwIjoxNTU2NDc1NjA5LCJhdF9oYXNoIjoiWW1HcVdhQ3YyWjdTeGFtWGFBYzl3dyIsIm5vbmNlIjoidGlwOTlrM2V1ZmpjeU1Oakpkd0dOMTYwLU5wU1A3dTEifQ.RCB0DSZB2r5r9b5uqL1XAX3uyPi-tPAwy67PCMt0aU5fFVm-XM8btXWzx1lyBFm8bGH4e8ZtiZPJjOvkuhDvLvp4wJL8gp8DcZpX2jUao3lv0QMcOxblB0JoMo37G_g3Vk_ncvz-LYdtEs96GxRnH8BjuTm12S2hitsTULmLjUscPHfyZhRxlFURZ2isg9TmkbRJArQPRDRweiC-gtrw0T9zunnH6_aSqORNYfHIWqTbPVOhjCtbV8A0szwvERui1b1P9XvHeTc5nvddD5e6v0CfLVUXIUUZbbwBo-BbOxdtFCmHB3dBLacB_KEYtQpzEsYvLJg_iXAHFEQjU6PD2w");

            string test = "{ \"query\": \"query { assignableUserList(url: \\\"https://tests-a1.map-staging.arup.digital/\\\"){ name } } \"}";


            System.Text.ASCIIEncoding enc = new System.Text.ASCIIEncoding();
            req.ContentLength = enc.GetBytes(test).Length;

            Stream s = req.GetRequestStream();

            s.Write(enc.GetBytes(test), 0, enc.GetBytes(test).Length);
          

            WebResponse response = req.GetResponse();


            Stream dataStream = response.GetResponseStream();
            // Open the stream using a StreamReader for easy access.
            StreamReader reader = new StreamReader(dataStream);
            // Read the content.
            string responseFromServer = reader.ReadToEnd();
            // Display the content.
            hello.Text += responseFromServer;


            // Cleanup the streams and the response.
            reader.Close();
            dataStream.Close();
            response.Close();



        }
    }
}