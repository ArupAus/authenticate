using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;

namespace testauth0
{
    public partial class _Default : Page
    {
        protected bool pubVar;

        protected void Page_Load(object sender, EventArgs e)
        {

            string config = Request.QueryString["config"];
            if (config != null)
            {
                hello.Text += config;
            }

            string token2 = Request.QueryString["token"];
            token.Text = "Bearer " + token2;



            WebRequest req = WebRequest.Create("https://portal-staging.arup.digital/graphql");

            req.Method = "POST";
            req.ContentType = "application/json";
            req.Headers.Add(HttpRequestHeader.Authorization, token.Text);


            string test = "{ \"query\": \"query { authorizeUser(url: \\\"https://tests-a1.map-staging.arup.digital/\\\") } \"}";


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
            dynamic obj = JsonConvert.DeserializeObject(responseFromServer);

            
            try
            {
                this.pubVar = obj.data.authorizeUser.auth;
            } catch
            {
                this.pubVar = false;
            }
            hello.Text += responseFromServer;


            // Cleanup the streams and the response.
            reader.Close();
            dataStream.Close();
            response.Close();



        }
    }
}