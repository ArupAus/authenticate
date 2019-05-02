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
        protected string testString;
        protected string testStringConfigText;

        protected void Page_Load(object sender, EventArgs e)
        {

            string config = Request.QueryString["config"];

            string token = Request.QueryString["token"];
            string tokenText = "Bearer " + token;

            string url = Request.Url.AbsoluteUri.Split('?')[0];

            WebRequest req = WebRequest.Create("https://portal-staging.arup.digital/graphql");

            req.Method = "POST";
            req.ContentType = "application/json";
            req.Headers.Add(HttpRequestHeader.Authorization, tokenText);

            string authText = "{ \"query\": \"query { authorizeUser(url: \\\"" + url + "?config=" + config + "\\\") } \"}";

            this.testString = authText;

            System.Text.ASCIIEncoding enc = new System.Text.ASCIIEncoding();
            req.ContentLength = enc.GetBytes(authText).Length;

            Stream s = req.GetRequestStream();

            s.Write(enc.GetBytes(authText), 0, enc.GetBytes(authText).Length);

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

            // Cleanup the streams and the response.
            reader.Close();
            dataStream.Close();
            response.Close();

            WebRequest req2 = WebRequest.Create("https://portal-staging.arup.digital/graphql");

            req2.Method = "POST";
            req2.ContentType = "application/json";
            req2.Headers.Add(HttpRequestHeader.Authorization, tokenText);

            string configText = "{ \"query\": \"query { getConfig(url: \\\"" + url + "\\\", uuid: \\\"" + config + "\\\") } \"}";

            req2.ContentLength = enc.GetBytes(configText).Length;

            Stream s2 = req2.GetRequestStream();

            s2.Write(enc.GetBytes(configText), 0, enc.GetBytes(configText).Length);

            WebResponse response2 = req2.GetResponse();

            Stream dataStream2 = response2.GetResponseStream();
            // Open the stream using a StreamReader for easy access.
            StreamReader reader2 = new StreamReader(dataStream2);
            // Read the content.
            string responseFromServer2 = reader2.ReadToEnd();
            // Display the content.
            dynamic obj2 = JsonConvert.DeserializeObject(responseFromServer2);

            try
            {
                this.testStringConfigText = obj2.data.getConfig.config;
            }
            catch
            {
                this.testStringConfigText = "couldn't get config";
            }

            // Cleanup the streams and the response.
            reader2.Close();
            dataStream2.Close();
            response2.Close();

        }
    }
}