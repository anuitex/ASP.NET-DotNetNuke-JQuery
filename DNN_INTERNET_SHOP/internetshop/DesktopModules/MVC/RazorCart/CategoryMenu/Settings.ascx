<%@ Control Language="C#" EnableViewState="true" AutoEventWireup="true" CodeBehind="Settings.ascx.cs" Inherits="RazorCart.CategoryMenu.Settings" %>

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
        <div class="dnnFormItem" runat="server" id="dvCategoryUrlKey">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblCategoryUrlKey" AssociatedControlID="txtCategoryUrlKey"></asp:Label></span></label>
            </div>
            <asp:TextBox runat="server" ID="txtCategoryUrlKey" />
            <asp:RequiredFieldValidator runat="server" ID="RequiredFieldValidator1" ControlToValidate="ddlPortalStores" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
        <!-- Product List Page -->
        <div class="dnnFormItem" runat="server" id="dvProductListPage">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblProductListPage" AssociatedControlID="ddlProductListPage"></asp:Label></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlProductListPage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlProductListPage" ControlToValidate="ddlProductListPage" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblEnableXmlPriceList" AssociatedControlID="chkEnableXmlPriceList"></asp:Label></span></label>
            </div>
            <asp:CheckBox runat="server" ID="chkEnableXmlPriceList" AutoPostBack="true" OnCheckedChanged="chkEnableXmlPriceList_CheckedChanged" />
        </div>
        <div class="dnnFormItem" runat="server" id="dvXmlPriceListPath" visible="false">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblXmlPriceListFileName"></asp:Label></span></label>
            </div>
            <asp:Label runat="server" ID="lblXmlPriceListPath"></asp:Label>
        </div>
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblUseHyperlinks" AssociatedControlID="chkUseHyperlinks"></asp:Label></span></label>
            </div>
            <asp:CheckBox runat="server" ID="chkUseHyperlinks" AutoPostBack="true" OnCheckedChanged="chkUseHyperlinks_CheckedChanged" />
        </div>
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblShowProdCount" AssociatedControlID="chkShowProdCount"></asp:Label></span></label>
            </div>
            <asp:CheckBox runat="server" ID="chkShowProdCount" />
        </div>
        <div class="dnnFormItem" runat="server" id="dvEnableMultiSelection">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblEnableMultiSelection" AssociatedControlID="chkEnableMultiSelection"></asp:Label></span></label>
            </div>
            <asp:CheckBox runat="server" ID="chkEnableMultiSelection" />
        </div>
        <div class="dnnFormItem" runat="server" id="dvHighlightSelectedCategories">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblHighlightSelectedCategories" AssociatedControlID="chkHighlightSelectedCategories"></asp:Label></span></label>
            </div>
            <asp:CheckBox runat="server" ID="chkHighlightSelectedCategories" />
        </div>
        <div class="dnnFormItem" runat="server" id="dvShowCheckBoxes">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblShowCheckBoxes" AssociatedControlID="chkShowCheckBoxes"></asp:Label></span></label>
            </div>
            <asp:CheckBox runat="server" ID="chkShowCheckBoxes" />
        </div>
        <div class="dnnFormItem" runat="server" id="dvTreeIconType">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblTreeIconType"></asp:Label></span></label>
            </div>
            <asp:RadioButtonList runat="server" ID="rblTreeIconType" RepeatDirection="Horizontal">
                <asp:ListItem Value="PlusMinus" Text="Plus & Minus"></asp:ListItem>
                <asp:ListItem Value="Arrows" Text="Arrows"></asp:ListItem>
            </asp:RadioButtonList>
        </div>
        <div class="dnnFormItem" runat="server" id="dvCollapseBehavior">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblCollapseBehavior"></asp:Label></span></label>
            </div>
            <asp:RadioButtonList runat="server" ID="rblCollapseBehavior">
                <asp:ListItem Value="0" Text="Collapse All Categories"></asp:ListItem>
                <asp:ListItem Value="1" Text="Expand First Category"></asp:ListItem>
                <asp:ListItem Value="2" Text="Expand All Categories"></asp:ListItem>
            </asp:RadioButtonList>
        </div>
        <div class="dnnFormItem" runat="server" id="dvDefaultDeptIdList">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblDefaultDeptIdList"></asp:Label></span></label>
            </div>
            <asp:ListBox runat="server" ID="lbDefaultDeptIdList" SelectionMode="multiple" DataValueField="DepartmentID" DataTextField="DepartmentName" Height="150">
            </asp:ListBox>
        </div>
        <div class="dnnFormItem" runat="server" id="dvDefaultCatIdList">
            <div class="dnnLabel">
                <label><span><asp:Label runat="server" resourcekey="lblDefaultCatIdList"></asp:Label></span></label>
            </div>
            <asp:ListBox runat="server" ID="lbDefaultCatIdList" SelectionMode="multiple" DataValueField="CategoryID" DataTextField="CategoryName" Height="150">
            </asp:ListBox>
        </div>

    </fieldset>
</div>