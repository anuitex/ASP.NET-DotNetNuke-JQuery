<%@ Control Language="C#" EnableViewState="true" AutoEventWireup="true" CodeBehind="Settings.ascx.cs" Inherits="RazorCart.Search.Settings" %>

<style>
    .ui-autocomplete.ui-widget.ui-widget-content {
        border: 1px solid #c5c5c5;
    }
    .ui-autocomplete.ui-widget-content {
        background: #ffffff;
        color: #333333;
    }
    .ui-autocomplete.ui-menu {
        list-style: none;
        padding: 0;
        margin: 0;
        display: block;
        outline: 0;
    }
    .ui-autocomplete.ui-menu .ui-menu-item {
        cursor: pointer;
        list-style-image: url("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
    }
    .ui-state-hover,
    .ui-widget-content .ui-state-hover,
    .ui-widget-header .ui-state-hover,
    .ui-state-focus,
    .ui-widget-content .ui-state-focus,
    .ui-widget-header .ui-state-focus,
    .ui-button:hover,
    .ui-button:focus {
	    border: 1px solid #cccccc;
	    background: #ededed;
	    font-weight: normal;
	    color: #2b2b2b;
    }
</style>

<script type="text/javascript">
    (function ($) {
        $(function () {
            $("#rzcModuleSettings .dnnFormExpandContent a").dnnExpandAll({
                targetArea: "#rzcModuleSettings"
            });
        });
        jQuery.ui.autocomplete.prototype._resizeMenu = function () {
            var ul = this.menu.element;
            ul.outerWidth(this.element.outerWidth());
        }
    })(jQuery);
</script>

<div id="rzcModuleSettings">
    <div class="dnnFormExpandContent"><a href="#">Expand All</a></div>
    <h2 id="scPanel-BasicSettings" class="dnnFormSectionHead">
        <a href="#">
            <asp:Label runat="server" ID="lblBasicSettings"></asp:Label>
        </a>
    </h2>
    <fieldset>
        <!-- Store ID -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblStoreID"></asp:Label>
                </label>
            </div>
            <asp:DropDownList runat="server" ID="ddlPortalStores">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlPortalStores" ControlToValidate="ddlPortalStores" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
        <!-- Product Details Page -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblProductDetailsPage"></asp:Label>
                </label>
            </div>
            <asp:DropDownList runat="server" ID="ddlProductDetailsPage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlProductDetailsPage" ControlToValidate="ddlProductDetailsPage" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
        <!-- Search Results Page -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblSearchResultsPage"></asp:Label>
                </label>
            </div>
            <asp:DropDownList runat="server" ID="ddlSearchResultsPage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlSearchResultsPage" ControlToValidate="ddlSearchResultsPage" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
        </div>
        <!-- Search Results Page -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblProductGridPage"></asp:Label>
                </label>
            </div>
            <asp:DropDownList runat="server" ID="ddlProductGridPage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
        </div>
        <!-- Enable Collapsible -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblEnableCollapsible"></asp:Label>
                </label>
            </div>
            <asp:CheckBox runat="server" ID="chkEnableCollapsible" />
        </div>
        <!-- Start Collapsed -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblStartCollapsed"></asp:Label>
                </label>
            </div>
            <asp:CheckBox runat="server" ID="chkStartCollapsed" />
        </div>
    </fieldset>
    <h2 id="scPanel-AdvancedSearchSettings" class="dnnFormSectionHead">
        <a href="#">
            <asp:Label runat="server" ID="lblAdvancedSearchSettings"></asp:Label>
        </a>
    </h2>
    <fieldset>
        <!-- Advance Filtering -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblCategorySource"></asp:Literal></span></label>
            </div>
            <asp:RadioButtonList runat="server" ID="rblCategorySource" AutoPostBack="true" OnSelectedIndexChanged="rblCategorySource_SelectedIndexChanged">
                <asp:listitem value="NoCategories" Text="No Categories" Selected="True" />
                <asp:listitem value="TopLevelCategories" Text="Top Level Categories"  />
                <asp:listitem value="SelectedCategoryLevel" Text="Selected Category Level"  />
            </asp:RadioButtonList>
        </div>
        <div id="dvSelectedCategory" class="dnnFormItem" runat="server" visible="false">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblSelectedCategory"></asp:Label>
                </label>
            </div>
            <asp:TextBox runat="server" ID="txtSelectedCategory" />
            <asp:HiddenField runat="server" ID="hndSelectedCategory" />
        </div>
        <div id="dvShowSubCategories" class="dnnFormItem" runat="server" visible="false">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblShowSubCategories"></asp:Label>
                </label>
            </div>
            <asp:CheckBox runat="server" ID="chkShowSubCategories" />
        </div>
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label>
                    <asp:Label runat="server" ID="lblEnablePriceFilter"></asp:Label>
                </label>
            </div>
            <asp:CheckBox runat="server" ID="chkEnablePriceFilter" />
        </div>
    </fieldset>
</div>