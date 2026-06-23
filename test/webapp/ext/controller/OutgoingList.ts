import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';
import MessageToast from 'sap/m/MessageToast';
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param context the context of the page on which the event was fired. `undefined` for list report page.
 * @param selectedContexts the selected contexts of the table rows.
 */
export async function onDisplayXmlClicked(this: ExtensionAPI, context: Context | undefined, selectedContexts: Context[]) {
    console.log("DisplayXML triggered");

    if (!selectedContexts || selectedContexts.length === 0) {
        MessageToast.show("Lütfen bir satır seçin.");
        return;
    }

    if (selectedContexts.length > 1) {

        MessageToast.show("Lütfen yalnızca tek satır seçin.");
    }

    const oModel = this.getModel() as ODataModel;
    const selectedContext = selectedContexts[0];

    const data = selectedContext.getObject();

    var sServiceUrl = oModel.getServiceUrl();
    if (!data.DbKey) {

        console.error("Program Error DB KEY not found");
    }
    // //  var sCustomEntityUrl = sServiceUrl +
    // //                         "FilePreview(db_key=" + data.DbKey +
    // //                         ",FileName='data.xml')/FileContent/$value";
    //  var sCustomEntityUrl = sServiceUrl + 
    //                         "FilePreview(db_key=" + data.DbKey+")/$value";

    // //  const newctx = oModel.bindContext(sCustomEntityUrl);
    // const newctx = oModel.bindContext("/FilePreview(db_key=" + data.DbKey + ")");
    //  const response = await newctx.requestObject();
    //  const respons_data = response.getObject();
    //  window.open(sCustomEntityUrl, "_blank");


    sServiceUrl = oModel.getServiceUrl();
    if (sServiceUrl.startsWith("..")) {
        sServiceUrl = new URL(sServiceUrl, window.location.href).pathname;
    }

    // const sUrl = sServiceUrl + "FilePreview(db_key=" + data.DbKey + ")/FileContent";
    const sUrl = sServiceUrl + "FilePreview(db_key=" + data.DbKey + ",file_key='xml')/FileContent";
    console.log("Stream URL:", sUrl);
    window.open(sUrl, "_blank");

}