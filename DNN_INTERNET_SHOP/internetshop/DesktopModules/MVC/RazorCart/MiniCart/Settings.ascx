<%@ Control Language="C#" EnableViewState="true" AutoEventWireup="true" CodeBehind="Settings.ascx.cs" Inherits="RazorCart.MiniCart.Settings" %>

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
        <a href="#"><asp:Literal runat="server" ID="lblBasicSettings"></asp:Literal></a>
    </h2>
    <fieldset>
        <!-- Store ID -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblStoreID"></asp:Literal></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlPortalStores">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlPortalStores" ControlToValidate="ddlPortalStores" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
        <!-- Product Details Page -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblProductDetailsPage"></asp:Literal></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlProductDetailsPage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlProductDetailsPage" ControlToValidate="ddlProductDetailsPage" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
        <!-- Checkout Page -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblCheckoutPage"></asp:Literal></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlCheckoutPage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlCheckoutPage" ControlToValidate="ddlCheckoutPage" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
        <!-- MiniCart Layout -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblLayout"></asp:Literal></span></label>
            </div>
            <asp:RadioButtonList runat="server" ID="rblMiniCartLayout">
                <asp:listitem value="IconView" Text="MiniCart Icon View" />
                <asp:listitem value="SummaryView" Text="MiniCart Summary View" Selected="True" />
                <asp:listitem value="DetailView" Text="MiniCart Detail View"  />
                <asp:listitem value="TabView" Text="MiniCart Tab View"  />
            </asp:RadioButtonList>
        </div>
    </fieldset>
</div>