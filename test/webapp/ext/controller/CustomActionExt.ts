import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import ExtensionAPI from "sap/fe/core/ExtensionAPI";
import Context from "sap/ui/model/odata/v4/Context";
import MessageToast from "sap/m/MessageToast";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import HTML from "sap/ui/core/HTML";
import Dialog from "sap/m/Dialog";
import Button from "sap/m/Button";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Fragment from "sap/ui/core/Fragment";

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


let _oDialog: Dialog;
export async function onSendAction(this: ExtensionAPI, context: Context | undefined, selectedContexts: Context[]) {
    console.log("Send triggered");

    if (!selectedContexts || selectedContexts.length === 0) {
        MessageToast.show("Lütfen bir satır seçin.");
        return;
    }

    const aMessages: { id: string; message: string; severity: number }[] = [];

    const oModel = this.getModel() as ODataModel;

    BusyIndicator.show(0);
    for (const ctx of selectedContexts) {

        const sId = ctx.getProperty("Id") as string;

        const oBindingContext = oModel.bindContext(
            `${ctx.getPath()}/com.sap.gateway.srvd.aktek.es_ui_outgoing.v0001.send(...)`
        );

        try {
            await oBindingContext.invoke();
            const oBoundContext = oBindingContext.getBoundContext();
            const oData = oBoundContext.getObject() as any;
            oData.SAP__Messages.forEach((msg: any) => {
                aMessages.push({
                    id: sId,
                    message: msg.message,
                    severity: msg.numericSeverity
                });
            });
        } catch (oError: any) {
            aMessages.push({ id: sId, message: oError.message || "Bilinmeyen hata", severity: 4 });
        }

        const oResultModel = new JSONModel({ messages: aMessages });

        const oI18nModel = new ResourceModel({
            bundleName: "com.aktek.test.i18n.i18n",
            supportedLocales: ["en", "tr", ""],
            fallbackLocale: "en"
        });


        BusyIndicator.hide();
        if (!_oDialog) {
            _oDialog = (await Fragment.load({
                name: "com.aktek.test.ext.fragment.SendResultDialog",
                controller: { onCloseResultDialog: () => { _oDialog.close(); } }
            })) as Dialog;
        }

        _oDialog.setModel(oResultModel, "results");
        _oDialog.open();
        _oDialog.setModel(oI18nModel, "i18n");

        for (const ctx of selectedContexts) {
            ctx.refresh();
        }
        if (aMessages.length > 1) {

        } else {
            // MessageBox.()
        }

    }


}