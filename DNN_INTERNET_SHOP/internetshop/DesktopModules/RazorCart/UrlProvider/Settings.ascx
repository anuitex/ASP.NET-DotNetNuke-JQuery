<%@ Control Language="C#" EnableViewState="true" AutoEventWireup="true" CodeBehind="Settings.ascx.cs" Inherits="RazorCart.UrlProvider.Settings" %>
<%@ Register TagName="Label" TagPrefix="dnn" Src="~/controls/labelcontrol.ascx" %>
<%@ Register TagPrefix="dnn" Assembly="DotNetNuke.Web" Namespace="DotNetNuke.Web.UI.WebControls" %>

<style>
    .rzc-table {
        width: 100%;
        max-width: 650px;
    }

        .rzc-table tr th,
        .rzc-table tr td {
            vertical-align: top;
            padding: 8px;
        }

            .rzc-table tr th:first-child {
                width: 30%;
                text-align: right;
            }

        .rzc-table tr td {
            width: 55%;
        }

        .rzc-table tr th:last-child {
            width: 15%;
        }

    .rzc-plus {
        font-size: 28px;
        font-weight: 600;
        height: 26px;
        width: 26px;
        line-height: 24px;
        background: #adadad;
        color: #fff;
        border-radius: 4px;
        text-align: center;
        display: inline-block;
    }

        .rzc-plus:hover {
            background: #777171;
        }
</style>

<h2 id="dnnSitePanel-BasicSettings" class="dnnFormSectionHead">
    <a href="#" class="dnnSectionExpanded">
        <%= LocalizeString("RazorCartUrlProviderSettings") %>
    </a>
</h2>
<fieldset>
    <asp:UpdatePanel runat="server" ID="upUrlProviderSettings">
        <ContentTemplate>
            <table class="rzc-table">
                <tr>
                    <th>
                        <asp:Label runat="server" ResourceKey="lblProductList" />
                    </th>
                    <td>
                        <div class="dnnFormItem" runat="server" id="dvProductList">
                        </div>
                    </td>
                    <th>
                        <asp:LinkButton runat="server" ID="lbAddProductList" OnClick="lbAddPage_Click" CommandName="Add" CommandArgument="ProductList" Font-Underline="false">
                            <span class="rzc-plus">+</span>
                        </asp:LinkButton>
                    </th>
                </tr>
                <tr>
                    <th>
                        <asp:Label runat="server" ResourceKey="lblProductDetails" />
                    </th>
                    <td>
                        <div class="dnnFormItem" runat="server" id="dvProductDetails">
                        </div>
                    </td>
                    <th>
                        <asp:LinkButton runat="server" ID="lbProductDetails" OnClick="lbAddPage_Click" CommandName="Add" CommandArgument="ProductDetails" Font-Underline="false">
                            <span class="rzc-plus">+</span>
                        </asp:LinkButton>
                    </th>
                </tr>
                <tr>
                    <th>
                        <asp:Label runat="server" ResourceKey="lblCategoryMenu" />
                    </th>
                    <td>
                        <div class="dnnFormItem" runat="server" id="dvCategoryMenu">
                        </div>
                    </td>
                    <th>
                        <asp:LinkButton runat="server" ID="lbCategoryMenu" OnClick="lbAddPage_Click" CommandName="Add" CommandArgument="CategoryMenu" Font-Underline="false">
                            <span class="rzc-plus">+</span>
                        </asp:LinkButton>
                    </th>
                </tr>
            </table>
        </ContentTemplate>
        <Triggers>
            <asp:AsyncPostBackTrigger ControlID="lbAddProductList" EventName="Click" />
            <asp:AsyncPostBackTrigger ControlID="lbProductDetails" EventName="Click" />
            <asp:AsyncPostBackTrigger ControlID="lbCategoryMenu" EventName="Click" />
        </Triggers>
    </asp:UpdatePanel>
</fieldset>
