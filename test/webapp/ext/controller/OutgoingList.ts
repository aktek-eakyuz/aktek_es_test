import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';
import MessageToast from 'sap/m/MessageToast';
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import MessageBox from 'sap/m/MessageBox';
import BusyIndicator from "sap/ui/core/BusyIndicator";
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
        return;
    }


    sServiceUrl = oModel.getServiceUrl();
    if (sServiceUrl.startsWith("..")) {
        sServiceUrl = new URL(sServiceUrl, window.location.href).pathname;
    }

    const sUrl = sServiceUrl + "FilePreview(db_key=" + data.DbKey + ",file_key='xml')/FileContent";
    console.log("Stream URL:", sUrl);
    // window.open(sUrl, "_blank");


    // try {
    //     const response = await fetch(sUrl);
    //     const sHtml = await response.text();

    //     const oWindow = window.open("", "_blank");
    //     if (oWindow) {
    //         oWindow.document.open();
    //         oWindow.document.write(sHtml);
    //         oWindow.document.close();
    //     }
    // } catch (err: any) {
    //     MessageBox.error(err.message || "İçerik alınamadı.");
    // }

    
    try {
         BusyIndicator.show(0);
        const response = await fetch(sUrl);
        const sHtml = await response.text();

        
        const blob = new Blob([sHtml], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        BusyIndicator.hide();
        // Memory leak önleme
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err: any) {
        BusyIndicator.hide();
        MessageBox.error(err.message || "İçerik alınamadı.");
    }
}