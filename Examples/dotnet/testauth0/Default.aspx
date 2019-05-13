<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="testauth0._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    
    <% if (pubLoadCase == "allow") {%>
        <%-- Insert your application here --%>
        <div>
            Insert your app here...
            <div>
                response from server: <% =pubQueryAuth %>
            </div>
            <div>
                config content: <% =pubQueryConfig %>
            </div>
        </div>
    <%} else if (pubLoadCase == "deny") {%>
        <%-- Display access denied if user is not authorized --%>
        <link rel = "stylesheet" type = "text/css" href = "./Content/Loading.css" />
        <div id="loading-wrapper">
            <div id="loading-text">Access Denied!</div>
        </div>
    <%} else if (pubLoadCase == "redirect") {%>
        <%-- Redirect to portal.arup.digital no config id query --%>
        <script>
            window.location.href = "https://portal-staging.arup.digital"
        </script>
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
        title:"Other Module",
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
                // authorized... do something
            } else {
                window.location.href = window.location + tokenString
            }
      }

    </script>

</asp:Content>
