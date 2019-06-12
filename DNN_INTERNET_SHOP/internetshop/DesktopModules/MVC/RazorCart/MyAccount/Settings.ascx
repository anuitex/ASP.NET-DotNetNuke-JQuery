<%@ Control Language="C#" EnableViewState="true" AutoEventWireup="true" CodeBehind="Settings.ascx.cs" Inherits="RazorCart.MyAccount.Settings" %>

<script type="text/javascript">
    (function ($) {
        $(function () {
            $("#rzcModuleSettings .dnnFormExpandContent a").dnnExpandAll({
                targetArea: "#rzcModuleSettings"
            });
        });
    })(jQuery);
</script>

<div id="rzcModuleSettings">
    <div class="dnnFormExpandContent"><a href="#">Expand All</a></div>
    <h2 id="scPanel-BasicSettings" class="dnnFormSectionHead">
        <a href="#"><asp:Label runat="server" ID="lblBasicSettings"></asp:Label></a>
    </h2>
    <fieldset>
        <!-- Store ID -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblStoreID" AssociatedControlID="ddlPortalStores"></asp:Label></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlPortalStores">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlPortalStores" ControlToValidate="ddlPortalStores" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
    </fieldset>
</div>