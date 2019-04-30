<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="testauth0._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">


<asp:Label ID="hello" runat="server" Text="Label" Height="50%" Width="100%"></asp:Label>
<asp:Label ID="token" runat="server" Text="Label" Height="50%" Width="100%"></asp:Label>
    
    <div onclick="enterSite()">click here to enter site</div>

    <br />
    <br />
    <br />
    
<script src="./compiled.js" language="javascript" type="text/javascript"></script>

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

        function enterSite() {
            var url = window.location.href
            var tokenString = ""
            if (auth.token) {
                tokenString = "token=" + auth.token
            }
            if (url.indexOf("?") > -1) {
                tokenString = "&" + tokenString
            } else {
                tokenString = "?" + tokenString
            }
            var target = window.location.href
            if (target.indexOf("token") > -1) {
                window.location.href = target
            } else {
                window.location.href = window.location + tokenString
            }
      }

    </script>

</asp:Content>
