<%@ Control Language="C#" EnableViewState="true" AutoEventWireup="true" CodeBehind="Settings.ascx.cs" Inherits="RazorCart.ProductList.Settings" %>

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
            <asp:DropDownList runat="server" ID="ddlPortalStores" AutoPostBack="true" OnSelectedIndexChanged="ddlPortalStores_SelectedIndexChanged">
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
        <!-- Product Compare Page -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblProductComparePage"></asp:Literal></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlProductComparePage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- No Comparison Table --"></asp:ListItem>
            </asp:DropDownList>
        </div>
        <!-- Enable Auto Filtering -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblEnableAutoFiltering"></asp:Literal></span></label>
            </div>
            <asp:CheckBox runat="server" ID="chkEnableAutoFiltering" />
        </div>
        <!-- Auto Filtering Timeout -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblAutoFilteringTimeout"></asp:Literal></span></label>
            </div>
            <asp:TextBox runat="server" ID="txtAutoFilteringTimeout"></asp:TextBox>
        </div>
        <!-- Default Display Mode -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblDefaultDisplayMode"></asp:Literal></span></label>
            </div>
            <asp:RadioButtonList runat="server" ID="rblDefaultDisplayMode">
                <asp:ListItem Value="GridView" Text="Grid View"></asp:ListItem>
                <asp:ListItem Value="ListView" Text="List View"></asp:ListItem>
            </asp:RadioButtonList>
        </div>
        <!-- Pager Displayed Pages -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblPagerDisplayedPages"></asp:Literal></span></label>
            </div>
            <asp:TextBox runat="server" ID="txtPagerDisplayedPages"></asp:TextBox>
        </div>
        <!-- Pager Page Size -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblPagerPageSize"></asp:Literal></span></label>
            </div>
            <asp:TextBox runat="server" ID="txtPagerPageSize"></asp:TextBox>
        </div>
        <!-- Category ID -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblCategoryID"></asp:Literal></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlStoreCategories">
                <asp:ListItem Enabled="true" Value="-1" Text="-- All Categories --"></asp:ListItem>
            </asp:DropDownList>
        </div>
        <!-- Add To Cart Event -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblAddToCartEvent"></asp:Literal></span></label>
            </div>
            <asp:RadioButtonList runat="server" ID="rblAddToCartEvent" AutoPostBack="true" OnSelectedIndexChanged="rblAddToCartEvent_SelectedIndexChanged">
                <asp:ListItem Value="UseMiniCart" Text="Use MiniCart"></asp:ListItem>
                <asp:ListItem Value="RedirectToCheckout" Text="Redirect to Checkout"></asp:ListItem>
                <asp:ListItem Value="OpenCustomModal" Text="Open Custom Modal"></asp:ListItem>
            </asp:RadioButtonList>
        </div>
        <!-- Custom Modal Page -->
        <div class="dnnFormItem" runat="server" id="dvCustomModalPage">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblCustomModalPage"></asp:Literal></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlCustomModalPage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlCustomModalPage" ControlToValidate="ddlCustomModalPage" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
    </fieldset>
</div>