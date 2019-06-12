<%@ Control Language="C#" EnableViewState="true" AutoEventWireup="true" CodeBehind="Settings.ascx.cs" Inherits="RazorCart.ProductDetails.Settings" %>

<script type="text/javascript">
    (function ($) {
        $(function () {
            $("#rzcModuleSettings .dnnFormExpandContent a").dnnExpandAll({
                targetArea: "#rzcModuleSettings"
            });
        });
    })(jQuery);
</script>
<style type="text/css">
    .ui-autocomplete {
	    position: absolute;
	    top: 0;
	    left: 0;
	    cursor: default;
    }
    .ui-menu {
	    list-style: none;
	    padding: 0;
	    margin: 0;
	    display: block;
	    outline: 0;
    }
    .ui-menu .ui-menu {
	    position: absolute;
    }
    .ui-menu .ui-menu-item {
	    margin: 0;
	    cursor: pointer;
	    list-style-image: url("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
    }
    .ui-menu .ui-menu-item-wrapper {
	    position: relative;
	    padding: 3px 1em 3px .4em;
    }
    .ui-menu .ui-menu-divider {
	    margin: 5px 0;
	    height: 0;
	    font-size: 0;
	    line-height: 0;
	    border-width: 1px 0 0 0;
    }
    .ui-menu .ui-state-focus,
    .ui-menu .ui-state-active {
	    margin: -1px;
    }
    .ui-menu-icons {
	    position: relative;
    }
    .ui-menu-icons .ui-menu-item-wrapper {
	    padding-left: 2em;
    }
    .ui-menu .ui-icon {
	    position: absolute;
	    top: 0;
	    bottom: 0;
	    left: .2em;
	    margin: auto 0;
    }
    .ui-menu .ui-menu-icon {
	    left: auto;
	    right: 0;
    }
    .ui-menu.ui-widget.ui-widget-content {
	    border: 1px solid #c5c5c5;
    }
    .ui-menu.ui-widget-content {
	    border: 1px solid #dddddd;
	    background: #ffffff;
	    color: #333333;
    }
</style>
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
        <!-- Product List Page -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblProductListPage"></asp:Literal></span></label>
            </div>
            <asp:DropDownList runat="server" ID="ddlProductListPage">
                <asp:ListItem Enabled="true" Value="-1" Text="-- Select --"></asp:ListItem>
            </asp:DropDownList>
            <asp:RequiredFieldValidator runat="server" ID="vdl_ddlProductListPage" ControlToValidate="ddlProductListPage" InitialValue="-1" ErrorMessage="Please select..." ForeColor="Red" />
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
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblSpecificProduct"></asp:Literal></span></label>
            </div>
            <asp:TextBox runat="server" ID="txtSpecificProduct" placeholder="Search products"></asp:TextBox>
            <asp:HiddenField runat="server" ID="hdnSpecificProduct" />
            <script type="text/javascript"">
                $(function () {
                    var sf = $.ServicesFramework(<%= ModuleId %>);
                    $('#<%= txtSpecificProduct.ClientID %>').autocomplete({
                        source: function (request, response) {
                            $.ajax({
                                type: 'GET',
                                url: sf.getServiceRoot('RazorCart') + 'Product/List',
                                data: { CurrentPage: 1, PageSize: 10, SortExpression: 'order-asc', SearchText: request.term, CategoryList: '', MinPrice: -1, MaxPrice: -1, PriceList: '' },
                                beforeSend: sf.setModuleHeaders,
                                success: function (data) {
                                    response($.map(data.Products, function (product) {
                                        return { id: product.ProductID, value: product.ModelName, label: product.ModelName }
                                    }));
                                },
                                error: function (XMLHttpRequest, textStatus, errorThrown) {
                                    alert(XMLHttpRequest.responseJSON.Message);
                                }
                            });
                        },
                        select: function (event, ui) {
                            $('#<%= hdnSpecificProduct.ClientID %>').val(ui.item.id)
                        },
                        minLength: 2
                    });
                });
            </script>
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
        <!-- Show Reviews -->
        <div class="dnnFormItem">
            <div class="dnnLabel">
                <label><span><asp:Literal runat="server" ID="lblShowReviews"></asp:Literal></span></label>
            </div>
            <asp:CheckBox runat="server" ID="chkShowReviews" />
        </div>
    </fieldset>
</div>