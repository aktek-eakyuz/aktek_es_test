import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';
import MessageToast from 'sap/m/MessageToast';
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import MessageBox from 'sap/m/MessageBox';
import BusyIndicator from "sap/ui/core/BusyIndicator";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import PDFViewer from 'sap/m/PDFViewer';
import Dialog from 'sap/m/Dialog';
import HTML from 'sap/ui/core/HTML';
import Button from 'sap/m/Button';
import busydialog from 'sap/ca/ui/utils/busydialog';
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

/**
* Generated event handler.
*
* @param this reference to the 'this' that the event handler is bound to.
* @param context the context of the page on which the event was fired. `undefined` for list report page.
* @param selectedContexts the selected contexts of the table rows.
*/
export async function onDisplayPDF(this: ExtensionAPI, context: Context | undefined, selectedContexts: Context[]) {

    const oResourceBundle = (this.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;

    // MessageToast.show("Custom handler invoked.");

    if (!selectedContexts || selectedContexts.length === 0) {

        MessageToast.show(oResourceBundle.getText("ErrorSelectSingle") ?? "Bir satır seçiniz");
        return;
    }

    const oModel = this.getModel() as ODataModel;
    const selectedContext = selectedContexts[0];

    const data = selectedContext.getObject();

    var sServiceUrl = oModel.getServiceUrl();
    if (!data.DbKey) {

        console.error("Program Error DB KEY not found");
        return;
    }

    BusyIndicator.show(0);

    sServiceUrl = oModel.getServiceUrl();
    if (sServiceUrl.startsWith("..")) {
        sServiceUrl = new URL(sServiceUrl, window.location.href).pathname;
    }

    // const sUrl = sServiceUrl + "FilePreview(db_key=" + data.DbKey + ",file_key='pdf')/FileContent";
    const sUrl = sServiceUrl + "FilePreview(db_key=" + data.DbKey + ",file_key='pdf')/FileContent";
    console.log("Stream URL:", sUrl);


    try {

        // const oBindingContext = oModel.bindContext(sUrl);
        // const oObject = await oBindingContext.requestObject();


        // // const response = await fetch(sUrl);
        // // const pdfContent = await response.text();
        // BusyIndicator.hide();

        // // // // let sServiceUrl = oModel.getServiceUrl();
        // // // // if (sServiceUrl.startsWith("..")) {
        // // // //     sServiceUrl = new URL(sServiceUrl, window.location.href).pathname;
        // // // // }
        // // // // sUrl = sServiceUrl + "FilePreview(db_key=" + data.DbKey + ",file_key='pdf')/FileContent";

        // // // // const oPDFViewer = new PDFViewer({
        // // // //     source: sUrl,
        // // // //     title: data.Uuid ?? "PDF",
        // // // //     displayType: 'Auto'

        // // // // });
        // // // // oPDFViewer.open();



        //   BusyIndicator.show(0);

        const oResponse = await fetch(sUrl, { headers: { "Accept": "application/pdf" } });
        if (!oResponse.ok) {
            BusyIndicator.hide();
            let sMsg = "HTTP " + oResponse.status;
            try {
                const oErr = await oResponse.json();
                sMsg = oErr?.error?.message?.value ?? oErr?.error?.message ?? sMsg;
            } catch {
                // body JSON değilse status'ta kal
            }
            throw new Error(sMsg);
        }
        // const oBlob = await oResponse.blob();
        // const sBlobUrl = window.URL.createObjectURL(oBlob);

        // const oPDFViewer = new PDFViewer({
        //     source: sBlobUrl,
        //     title: data.FileName ?? "PDF"
        // });
        // oPDFViewer.open();

        const oBlob = new Blob([await oResponse.arrayBuffer()], { type: "application/pdf" });
        const sBlobUrl = window.URL.createObjectURL(oBlob);

        const oHtml = new HTML({
            content: `<iframe src="${sBlobUrl}" style="width:100%;height:100%;border:none;"></iframe>`
        });

        const oDialog = new Dialog({
            title: data.Uuid ?? "PDF",
            contentWidth: "80%",
            contentHeight: "90%",
            resizable: true,
            draggable: true,
            verticalScrolling: false,
            horizontalScrolling: false,
            content: [oHtml],
            endButton: new Button({
                text: oResourceBundle.getText("btnClose") ?? "Kapat",
                press: () => oDialog.close()
            }),
            afterClose: () => {
                window.URL.revokeObjectURL(sBlobUrl);
                oDialog.destroy();
            }
        });

        BusyIndicator.hide();
        oDialog.open();
    } catch (err: any) {
        BusyIndicator.hide();
        MessageBox.error(err.message || "İçerik alınamadı.");
    }

}