<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="testauth0._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    
    <% if (pubVar){%>
        <%-- Insert your application here --%>
        <div>
            Insert your app here...
            <div>
                response from server: <% =testString %>
            </div>
            <div>
                config content: <% =testStringConfigText %>
            </div>
        </div>
    <%} else {%>
        <%-- Display loading screen whilst authenticating --%>
        <link rel = "stylesheet" type = "text/css" href = "./Content/Loading.css" />
        <div id="loading-wrapper">
            <div id="loading-text">Loading...</div>
            <div id="loading-content"></div>
        </div>
    <%}%>
    
<script src="./Scripts/compiled.js" language="javascript" type="text/javascript"></script>

    <script type="text/javascript">

      var auth0Options = {
        languageDictionary: {
          title: "My Viewer"
        },
        theme: {
          labeledSubmitButton: false,
          logo: "https://s3-ap-southeast-2.amazonaws.com/arupdigital-assets/logo.png",
          primaryColor: "#27AAE1"
        }
      };

      var authInfo = {
        title:"UUS Viewer",
        clientId:"6zv6rmrO9TbI0M7xGQ71v1Xyshw01CJv",
        domain:"arupdigital.au.auth0.com",
        options:{auth0Options}
      }

        var auth = new AuthProvider(authInfo)

        auth.event.on('token_set', tokenSet);

        function tokenSet() {
            enterSite(auth.token)
        }

        function enterSite(token) {
            var url = window.location.href
            var tokenString = ""
            if (token) {
                tokenString = "token=" + token
            }
            if (url.indexOf("?") > -1) {
                tokenString = "&" + tokenString
            } else {
                tokenString = "?" + tokenString
            }
            var target = window.location.href
            if (target.indexOf("token") > -1) {
                // do something
            } else {
                window.location.href = window.location + tokenString
            }
      }

    </script>

</asp:Content>
